import { useNode } from "./useNode";
import { useToolNode } from "./useToolNode";

import { useLine } from "./useLine";
import { XmindGraph, XmindToolGraph } from "@eric/antv-xmind";
import { useX6Graph } from "./useX6Graph";

export const useTool = (
  config: {
    xmindGraph: XmindGraph;
    xmindToolGraph: XmindToolGraph;
  },
  zoomChange?: (zoom: number) => void
) => {
  const { xmindGraph } = config;
  const { addChild, addSublin, deleteCells, addRoot } = useNode(config);
  const { toggleLineMode, isLineMode } = useLine(config);
  const { createGroup, createSummary } = useToolNode(config);

  // 编辑历史
  const historyControl = (type: "BACKOFF" | "FORWARD") => {
    const graph = xmindGraph.getGraph();
    if (!graph) {
      return;
    }
    if (type === "BACKOFF") {
      graph.undo();
    } else if (type === "FORWARD") {
      graph.redo();
    }
  };

  // 缩放
  const zoomControl = (
    zoom: {
      defaultValue: number;
      stepValue: number;
      min: number;
      max: number;
    },
    type: "SHRINK" | "MAXMIZE" | "RESET"
  ) => {
    const graph = xmindGraph.getGraph();
    if (!graph) {
      return;
    }
    const zoomValue = graph.zoom();
    const { defaultValue, stepValue, min, max } = zoom;
    switch (type) {
      case "SHRINK":
        if (zoomValue > min) {
          graph.zoom(-stepValue);
        }
        break;
      case "MAXMIZE":
        if (zoomValue < max) {
          graph.zoom(stepValue);
        }
        break;
      case "RESET":
        graph.zoomTo(defaultValue);
    }
    const graphZoom = graph.zoom();
    return graphZoom;
  };

  const onZoomChange = () => {
    setTimeout(() => {
      const zoom = xmindGraph.getGraph()?.zoom();
      if (typeof zoom === "number") {
        zoomChange?.(Math.floor(zoom * 100));
      }
    }, 100);
  };

  useX6Graph(config, (graph) => {
    if (!graph) {
      return;
    }
    graph
      .on("cell:mousewheel", onZoomChange)
      .on("blank:mousewheel", onZoomChange);

    return () => {
      graph
        .off("cell:mousewheel", onZoomChange)
        .off("blank:mousewheel", onZoomChange);
    };
  });

  return {
    addChild,
    addRoot,
    addSiblings: addSublin,
    addOuterGroup: createGroup,
    addOutLine: createSummary,
    removeCell: deleteCells,
    historyControl,
    zoomControl,
    toggleLineMode,
    isLineMode,
  };
};
