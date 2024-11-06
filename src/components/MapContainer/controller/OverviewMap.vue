<script lang="ts">
import { defineComponent, onUnmounted } from "vue";
import { useMap } from "../hooks/useMap";
import { OverviewMap } from "ol/control";

export default defineComponent(() => {
  const { registerOverviewMap } = useMap();

  const overViewMap = new OverviewMap({
    className: "ol-overviewmap ol-custom-overviewmap",
  });
  const off = registerOverviewMap(overViewMap);

  onUnmounted(off);

  return () => null;
});
</script>

<style lang="scss">
.ol-custom-overviewmap,
.ol-custom-overviewmap.ol-uncollapsible {
  top: auto;
  right: auto;
  left: 10px;
  bottom: 38px !important;
}

.ol-custom-overviewmap:not(.ol-collapsed) {
  border: 1px solid black;
}

.ol-custom-overviewmap .ol-overviewmap-map {
  border: none;
  width: 300px !important;
}

.ol-custom-overviewmap .ol-overviewmap-box {
  border: 2px solid red;
}

.ol-custom-overviewmap:not(.ol-collapsed) button {
  bottom: 1px;
  left: 1px;
  right: auto;
  top: auto;
}
</style>
