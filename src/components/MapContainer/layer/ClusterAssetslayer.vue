<script lang="ts" setup>
import { Vector as VectorSource } from "ol/source";
import { Vector as Vectorlayer } from "ol/layer";
import { useMap, MAP_CLICK_FEATURE, VECTOR_LAYER } from "../hooks/useMap";
import {
  CRSTypes,
  SourceType,
  type WithStylePoint,
  type WithStylePointCollection,
} from "../utils";
import { MAP_STYLE_INJECT_KEY } from "../MapStyle/index";
import { autoWatch } from "../hooks/useAutoWatch";
import { onUnmounted, inject, watch } from "vue";
import type { StyleFunction } from "ol/style/Style";
import type { FeatureLike } from "ol/Feature";
import { useAssetsSource, type StyleKey } from "../hooks/useAssetsSource";
import { Point } from "ol/geom";
import type { Feature } from "ol";
import { ClusterSource } from "../source/ClusterSource";

const props = withDefaults(
  defineProps<{
    styleId?: string;
    proj?: CRSTypes;
    zIndex?: number;
    data?: (WithStylePoint | WithStylePointCollection)[];
    distance?: number;
    minDistance?: number;
    visible?: boolean;
    maxClusterZoom?: number;
  }>(),
  {
    zIndex: 11,
    data: () => [],
    distance: 122,
    minDistance: 121,
    visible: true,
    maxClusterZoom: 16,
  }
);

const emit = defineEmits<{
  clickCluster: [list: any[], exts: any[]];
}>();

const mapStyle = inject(MAP_STYLE_INJECT_KEY)!;
const { registerLayer, mapInstance, onMapEvent } = useMap();
const { resolveVectorSource, usedStyleMap } = useAssetsSource();

const source = new VectorSource({
  features: resolveVectorSource(
    props.data,
    props.proj || mapInstance.value?.projection
  ),
});

const clusterSource = new ClusterSource({
  source,
  distance: props.distance,
  minDistance: props.minDistance,
  maxClusterZoom: props.maxClusterZoom,
});

const createStyleFectory = (): StyleFunction => {
  return (feature: FeatureLike) => {
    const featuresGroup = (feature.get("features") || []) as Array<Feature>;
    const size = featuresGroup.length;
    if (!size) {
      return;
    }
    const firstChild = featuresGroup[0];
    if (size === 1) {
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
  zIndex: props.zIndex,
  style: createStyleFectory(),
  visible: props.visible,
});

autoWatch(props, layer, {
  zIndex: 10,
  visible: true,
});

autoWatch(props, clusterSource, {
  distance: 122,
  minDistance: 121,
  maxClusterZoom: 16,
});

watch(
  () => [props.proj, props.data] as const,
  ([proj, points]) => {
    source.clear();
    source.addFeatures(resolveVectorSource(points, proj));
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
  const subFeatures = (features[0].get("features") as Feature[]) || [];

  const icons: any[] = [];
  const exts: any[] = [];
  for (let i = 0; i < subFeatures.length; i++) {
    const pid = subFeatures[i].get("pid");
    const ext = subFeatures[i].get("ext");
    if (pid) {
      icons.push(pid);
    }
    if (ext) {
      exts.push(ext);
    }
  }
  if (!icons.length && !exts.length) {
    return;
  }
  emit("clickCluster", icons, exts);
});

onUnmounted(() => {
  offLayer();
  offList.forEach((fn) => fn());
});
</script>
<script lang="ts">
export default {
  render() {},
};
</script>
