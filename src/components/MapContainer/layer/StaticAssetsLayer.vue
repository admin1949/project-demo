<script setup lang="ts">
import { CRSTypes, type StaticSourceItem } from "../utils";
import { Layer, Vector as Vectorlayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { useMap, MAP_CLICK_FEATURE, VECTOR_LAYER } from "../hooks/useMap";
import { inject, onUnmounted, watch } from "vue";
import { MAP_STYLE_INJECT_KEY, createStyleFectory } from "../MapStyle";
import type { FeatureLike } from "ol/Feature";
import { useAssetsSource, type StyleKey } from "../hooks/useAssetsSource";
import { autoWatch } from "../hooks/useAutoWatch";

type ActiveFeature = {
  feature: FeatureLike;
  layer: Layer;
};

const props = withDefaults(
  defineProps<{
    proj?: CRSTypes;
    zIndex?: number;
    data?: StaticSourceItem[];
    visible?: boolean;
  }>(),
  {
    data: () => [],
    zIndex: 1,
    visible: true,
  }
);

const emit = defineEmits<{
  (event: "clickFeature", pid: string | number, ext: any): void;
}>();

const { registerLayer, mapInstance, onMapEvent } = useMap();
const mapStyle = inject(MAP_STYLE_INJECT_KEY)!;
const { usedStyleMap, resolveVectorSource } = useAssetsSource();

const layer = new Vectorlayer({
  source: new VectorSource({
    features: resolveVectorSource(props.data, props.proj),
  }),
  style: createStyleFectory(mapStyle),
  zIndex: props.zIndex,
  visible: props.visible,
});

autoWatch(props, layer, {
  zIndex: 1,
  visible: true,
});

watch(
  () => [props.proj, props.data] as const,
  ([proj, points]) => {
    layer.getSource()?.clear();
    layer.getSource()?.addFeatures(resolveVectorSource(points, proj));
    layer.changed();
  }
);

const off = registerLayer(VECTOR_LAYER, layer);

const offList = (
  ["icons", "lines", "polygon", "circle", "text"] as StyleKey[]
).map((key) => {
  return mapStyle[key].onMapStyleChange((ids) => {
    const usedStyleIds = usedStyleMap.get(key);
    const hasUsed = !!usedStyleIds && ids.some((id) => usedStyleIds.has(id));
    if (!hasUsed) {
      return;
    }
    layer.setStyle(createStyleFectory(mapStyle));
  });
});

onMapEvent(MAP_CLICK_FEATURE, ({ layer: cLayer, features }) => {
  if (!props.visible) {
    return;
  }
  if (layer !== cLayer || !features.length) {
    return;
  }
  emit("clickFeature", features[0].get("pid") || "", features[0].get("ext"));
});

onUnmounted(() => {
  off();
  offList.forEach((fn) => fn());
  layer.dispose();
  const map = mapInstance.value?.map;
  if (map) {
    const activeFeature = map.get("activeFeature") as ActiveFeature | null;
    if (activeFeature?.layer === layer) {
      map.set("activeFeature", null);
      map.getTargetElement().style.cursor = "";
    }
  }
});
</script>

<script lang="ts">
export default {
  render() {},
};
</script>
