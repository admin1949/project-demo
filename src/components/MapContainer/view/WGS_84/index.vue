<script setup lang="ts">
import { onUnmounted } from "vue";
import { useMap } from "../../hooks/useMap";
import { Layer, Tile } from "ol/layer";
import { CRSTypes, type WMTSConfig } from "../../utils";
import { XYZ } from "ol/source";

const props = withDefaults(
  defineProps<{
    url?: string;
    config?: WMTSConfig;
    maxZoom?: number;
  }>(),
  {
    url: "http://rt1.map.gtimg.com/realtimerender?x={x}&y={-y}&z={z}&type=vector&style=0",
    config: () => ({
      layer: "",
      style: "",
      matrixSet: "",
      matrixIdPrefix: "",
      format: "image/png",
    }),
    maxZoom: 18,
  }
);

const { registerLayer, registerOverViewLayer } = useMap();

let layer: Layer | null = new Tile({
  source: new XYZ({
    projection: "EPSG:4326",
    url: props.url,
    maxZoom: props.maxZoom || 18,
  }),
});

const off = registerLayer(CRSTypes.EPSG3857, layer);
const offOverlay = registerOverViewLayer(
  new Tile({
    source: new XYZ({
      projection: "EPSG:4326",
      url: props.url,
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
  render() {},
};
</script>
