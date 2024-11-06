<script setup lang="ts">
import { onUnmounted } from "vue";
import { useMap } from "../../hooks/useMap";
import { createBaiduLayer } from "./baiduLayer";
import { Layer } from "ol/layer";
import { CRSTypes } from "../../utils";
import { expandUrl } from "ol/tileurlfunction";

const {
  url = "http://online{1-4}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&udt=20151021&scaler=2&p1=1",
} = defineProps<{
  url?: string;
}>();

const { registerLayer, registerOverViewLayer } = useMap();

let layer: Layer | null = createBaiduLayer({
  urls: expandUrl(url),
});

const off = registerLayer(CRSTypes.BD09LL, layer);
const offOverlay = registerOverViewLayer(
  createBaiduLayer({
    urls: expandUrl(url),
  })
);

onUnmounted(() => {
  console.log("off baidu bg layer");
  off();
  offOverlay();
  layer?.dispose();
  layer = null;
});
</script>

<script lang="ts">
export default {
  render() {},
};
</script>
