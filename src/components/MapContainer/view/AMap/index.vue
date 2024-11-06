<script setup lang="ts">
import { createAmapLayer } from "./gaodeLayer";
import { useMap } from "../../hooks/useMap";
import { Layer } from "ol/layer";
import { onUnmounted } from "vue";
import { CRSTypes } from "../../utils";
import { expandUrl } from "ol/tileurlfunction";
import { NULL } from "@/utils";

const {
  url = "http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7",
  sort = 0,
} = defineProps<{
  url?: string;
  sort?: number;
}>();

const { registerLayer, registerOverViewLayer } = useMap();
let layer: Layer | null = createAmapLayer({ urls: expandUrl(url) });
layer.setZIndex(sort);

const off = registerLayer(CRSTypes.GCJ02, layer);
const off_overlay = registerOverViewLayer(
  createAmapLayer({ urls: expandUrl(url) })
);

onUnmounted(() => {
  console.log("off gaode bg layer");
  off();
  off_overlay();
  layer?.dispose();
  layer = null;
});
</script>

<script lang="ts">
export default {
  render: NULL,
};
</script>
