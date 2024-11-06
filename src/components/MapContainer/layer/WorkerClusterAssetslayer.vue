<script lang="ts" setup>
import { useMap, MAP_CLICK_FEATURE, VECTOR_LAYER } from "../hooks/useMap";
import { CRSTypes, SourceType } from "../utils";
import type { WithStylePoint } from "../utils";
import { MAP_STYLE_INJECT_KEY } from "../MapStyle/index";
import { autoWatch } from "../hooks/useAutoWatch";
import { onUnmounted, inject, watch } from "vue";
import type { StyleFunction } from "ol/style/Style";
import type { FeatureLike } from "ol/Feature";
import { useClusterSource } from "../hooks/useAssetsSource";
import type { StyleKey } from "../hooks/useAssetsSource";
import { Point } from "ol/geom";
import { Feature } from "ol";
import { ClusterSource } from "../source/WorkerClusterSource";
import { Vector as Vectorlayer } from "ol/layer";

const props = withDefaults(
  defineProps<{
    styleId?: string;
    proj?: CRSTypes;
    zIndex?: number;
    data?: WithStylePoint[];
    distance?: number;
    minDistance?: number;
    visible?: boolean;
  }>(),
  {
    zIndex: 11,
    data: () => [],
    distance: 122,
    minDistance: 121,
    visible: true,
  }
);

defineEmits<{
  (event: "clickCluster", list: any[], exts: any[]): void;
}>();

const mapStyle = inject(MAP_STYLE_INJECT_KEY)!;
const { registerLayer, mapInstance, onMapEvent } = useMap();
const { resolveVectorSource, usedStyleMap } = useClusterSource();

const clusterSource = new ClusterSource({
  distance: props.distance,
  minDistance: props.minDistance,
  minResolution: 0.8,
});

clusterSource.updateFeatures(
  resolveVectorSource(props.data, props.proj || mapInstance.value?.projection)
);

const createStyleFectory = (): StyleFunction => {
  return (feature: FeatureLike) => {
    const featuresGroup = (feature.get("features") || []) as Array<Feature>;
    const size = featuresGroup.length;

    const firstChild = featuresGroup[0] || feature;

    if (size <= 1) {
      const key = firstChild.get("styleId");
      const type = firstChild.get("featureType");
      switch (type) {
        case SourceType.POINT:
          return mapStyle.icons.get(key, firstChild as Feature<Point>);
        default:
          console.warn("unknown type feature", feature);
      }
    }

    return mapStyle.cluster.get(props.styleId, feature as Feature<Point>);
  };
};

const layer = new Vectorlayer({
  source: clusterSource,
  style: createStyleFectory(),
  zIndex: props.zIndex,
  visible: props.visible,
});

autoWatch(props, layer, {
  zIndex: 10,
  visible: true,
});

autoWatch(props, clusterSource, {
  distance: 122,
  minDistance: 121,
});

watch(
  () => [props.proj, props.data] as const,
  ([proj, points]) => {
    clusterSource.updateFeatures(resolveVectorSource(points, proj));
  }
);

const offLayer = registerLayer(VECTOR_LAYER, layer);

const offList = (["icons"] as StyleKey[]).map((key) => {
  return mapStyle[key].onMapStyleChange((ids) => {
    const usedStyleIds = usedStyleMap.get(key);
    const hasUsed = !!usedStyleIds && ids.some((id) => usedStyleIds.has(id));
    if (!hasUsed) {
      return;
    }
    layer.setStyle(createStyleFectory());
  });
});

watch(
  () => props.styleId,
  () => {
    layer.setStyle(createStyleFectory());
  }
);

onMapEvent(MAP_CLICK_FEATURE, ({ layer: cLayer, features }) => {
  if (!props.visible) {
    return;
  }
  if (layer !== cLayer || !features.length) {
    return;
  }
  const subFeatures = (features[0].get("features") as number[]) || [];
  if (!subFeatures.length) {
    subFeatures.push(Number(features[0].getId()));
  }

  console.log("sub child pid is", subFeatures);
});

onUnmounted(() => {
  offLayer();
  offList.forEach((fn) => fn());
  clusterSource.dispose();
});
</script>

<script lang="ts">
import { NULL } from "@/utils";

export default {
  render: NULL,
};
</script>
