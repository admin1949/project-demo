<script setup lang="ts">
import { Feature } from "ol";
import { onUnmounted, watch } from "vue";
import { Heatmap } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { CRSTypes } from "../utils";
import { Point } from "ol/geom";
import { useMap } from "../hooks/useMap";
import type { Options } from "ol/layer/Heatmap";
import { autoTransfrom } from "../hooks/useProjection";
import { autoWatch } from "../hooks/useAutoWatch";

const props = withDefaults(
  defineProps<{
    proj?: CRSTypes;
    opacity?: Options["opacity"];
    visible?: Options["visible"];
    extent?: Options["extent"];
    zIndex?: Options["zIndex"];
    minResolution?: Options["minResolution"];
    maxResolution?: Options["maxResolution"];
    minZoom?: Options["minZoom"];
    maxZoom?: Options["maxZoom"];
    gradient?: Options["gradient"];
    radius?: Options["radius"];
    blur?: Options["blur"];
    weight?: Options["weight"];
    data?: {
      lng: number;
      lat: number;
      weight?: number;
    }[];
  }>(),
  {
    zIndex: 1,
    minZoom: 3,
    maxZoom: 18,
    visible: true,
    radius: 5,
    blur: 15,
    data: () => [],
    weight: () => (feature: Feature) => {
      const weight = Number(feature.get("weight"));
      if (isNaN(weight)) {
        return 1;
      }
      return weight;
    },
    gradient: () => ["#2200ff", "#16d9cc", "#4dee12", "#e8d225", "#ef1616"],
  }
);

const { registerLayer, mapInstance } = useMap();

const createHeatmapSource = (
  points: { lng: number; lat: number; weight?: number }[],
  proj?: CRSTypes
) => {
  return points.map((point) => {
    return new Feature<Point>({
      geometry: new Point(autoTransfrom([point.lng, point.lat], proj)),
      weight: point.weight,
    });
  });
};

const heatmapLayer = new Heatmap({
  opacity: props.opacity,
  visible: props.visible,
  extent: props.extent,
  zIndex: props.zIndex,
  minResolution: props.minResolution,
  maxResolution: props.maxResolution,
  minZoom: props.minZoom,
  maxZoom: props.maxZoom,
  gradient: props.gradient,
  radius: props.radius,
  blur: props.blur,
  weight: props.weight,
  source: new VectorSource<Feature>({
    features: createHeatmapSource(
      props.data,
      props.proj || mapInstance.value?.projection
    ),
  }),
});

autoWatch(props, heatmapLayer, {
  opacity: 1,
  visible: true,
  zIndex: 12,
  minResolution: 0,
  maxResolution: 20,
  minZoom: 3,
  maxZoom: 18,
  radius: 5,
  blur: 15,
  gradient: () => [],
  extent: () => undefined,
});

watch(
  () => [props.proj, props.data] as const,
  ([proj, points]) => {
    heatmapLayer.getSource()?.clear();
    heatmapLayer.getSource()?.addFeatures(createHeatmapSource(points, proj));
  }
);

const dispose = registerLayer("autolayer", heatmapLayer);
onUnmounted(() => {
  dispose();
});
</script>

<script lang="ts">
export default {
  render() {},
};
</script>
