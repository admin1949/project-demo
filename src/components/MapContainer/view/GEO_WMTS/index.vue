<script setup lang="ts">
import { onUnmounted } from "vue";
import { useMap } from "../../hooks/useMap";
import { Layer, Tile } from "ol/layer";
import { CRSTypes, type WMTSConfig } from "../../utils";
import { XYZ, WMTS } from "ol/source";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { get } from "ol/proj";
import { getTopLeft, getWidth } from "ol/extent";

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

const projection = get("EPSG:3857")!;
const projectionExtend = projection.getExtent();

const size = getWidth(projectionExtend) / 256;
const { config } = props;

const tileGrid = new WMTSTileGrid({
  resolutions: Array.from({ length: 19 }).map(
    (_, idx) => size / Math.pow(2, idx)
  ),
  matrixIds: Array.from({ length: 19 }).map(
    (_, idx) => config.matrixIdPrefix + idx
  ),
  origin: getTopLeft(projectionExtend),
});

let layer: Layer | null = new Tile({
  source: new WMTS({
    url: props.url,
    layer: config.layer,
    style: config.style,
    matrixSet: config.matrixSet,
    format: config.format || "image/png",
    tileGrid: tileGrid,
    cacheSize: Math.pow(2, 10),
  }),
});

const off = registerLayer(CRSTypes.EPSG3857, layer);
const offOverlay = registerOverViewLayer(
  new Tile({
    source: new XYZ({
      url: props.url,
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
  render() {},
};
</script>
