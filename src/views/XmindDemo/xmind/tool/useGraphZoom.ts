import { XmindGraph } from "@eric/antv-xmind";
import { useX6Graph } from "./useX6Graph";

export const useGraphZoom = ({ xmindGraph }: { xmindGraph: XmindGraph }) => {
  const STEP = 25;

  const options = computed(() => {
    const min = 50;
    const max = 200;
    const step = STEP;
    const res: number[] = [];
    const current = zoom.value;
    if (current < min) {
      res.push(min);
    }

    let hasAdd = false;
    for (let i = min; i <= max; i += step) {
      if (i < current) {
        res.push(i);
        continue;
      }
      if (hasAdd) {
        res.push(i);
      } else {
        hasAdd = true;
        res.push(current);
      }
    }
    if (current > max) {
      res.push(current);
    }
    return res;
  });

  const canPlus = computed(() => {
    const current = zoom.value;
    const list = options.value;
    const last = list[list.length - 1];
    return current < last;
  });

  const canMinus = computed(() => {
    const current = zoom.value;
    const list = options.value;
    const first = list[0];
    return current > first;
  });

  const plusOne = () => {
    if (!canPlus.value) {
      return;
    }
    const current = zoom.value;
    const next = (Math.floor(current / STEP) + 1) * STEP;
    zoomTo(next);
  };

  const minusOne = () => {
    if (!canMinus.value) {
      return;
    }
    const current = zoom.value;
    const next = (Math.floor(current / STEP) - 1) * STEP;
    zoomTo(next);
  };

  const handleScaleToOriginal = () => {
    const graph = xmindGraph.getGraph();
    if (!graph) {
      return;
    }
    graph.centerContent();
  };

  const zoom = ref(100);
  const zoomTo = (val: number) => {
    const graph = xmindGraph.getGraph();
    if (!graph) {
      return;
    }

    graph.zoomTo(val / 100);
  };

  useX6Graph({ xmindGraph }, (graph) => {
    if (!graph) {
      return;
    }
    const scaleHandler = (e: { sx: number }) => {
      zoom.value = toPercent(e.sx);
    };
    graph.on("scale", scaleHandler);
    zoom.value = toPercent(graph.zoom());

    return () => {
      graph.off("scale", scaleHandler);
    };
  });

  return {
    options,
    canPlus,
    canMinus,
    plusOne,
    minusOne,
    zoom,
    zoomTo,
    handleScaleToOriginal,
  };
};
const toPercent = (val: number) => {
  return Math.floor(val * 100);
};
