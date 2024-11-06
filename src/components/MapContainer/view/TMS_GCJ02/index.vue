<script setup lang="ts">
import { onUnmounted } from "vue";
import { useMap } from "../../hooks/useMap";
import { Layer, Tile } from "ol/layer";
import { CRSTypes } from "../../utils";
import { XYZ } from "ol/source";
import { gcj02Mecator } from "../gjc02";

const props = withDefaults(
  defineProps<{
    url?: string;
    maxZoom?: number
  }>(),
  {
    url: "http://rt1.map.gtimg.com/realtimerender?x={x}&y={-y}&z={z}&type=vector&style=0",
    maxZoom: 18
  }
);

const { registerLayer, registerOverViewLayer } = useMap();

let layer: Layer | null = new Tile({
  source: new XYZ({
    url: props.url,
    projection: gcj02Mecator,
    crossOrigin: "Anonymous",
    tileSize: 256,
    tilePixelRatio: 2,
    maxZoom: props.maxZoom,
  }),
});

const off = registerLayer(CRSTypes.GCJ02, layer);
const offOverlay = registerOverViewLayer(
  new Tile({
    source: new XYZ({
      projection: gcj02Mecator,
      url: props.url,
      crossOrigin: "Anonymous",
      tileSize: 256,
      tilePixelRatio: 2,
      maxZoom: props.maxZoom,
    }),
  })
);

onUnmounted(() => {
  console.log("off TMS bg layer");
  off();
  offOverlay();
  layer?.dispose();
  layer = null;
});
</script>

<script lang="ts">
export default {
  render() { },
};
</script>
