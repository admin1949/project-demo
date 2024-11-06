<script lang="ts">
import { defineComponent, onUnmounted } from "vue";
import { ZoomSlider } from "ol/control";
import { useMap } from "../hooks/useMap";
import { NULL } from "@/utils";

export default defineComponent(() => {
  const { afterMapReady, mapInstance } = useMap();
  let zoomSlider: ZoomSlider | null = null;
  onUnmounted(() => {
    if (zoomSlider) {
      mapInstance.value?.map.removeControl(zoomSlider);
      zoomSlider.dispose();
      zoomSlider = null;
    }
  });

  afterMapReady(({ map }) => {
    const hasSameControl = map
      .getControls()
      .getArray()
      .some((i) => i instanceof ZoomSlider);
    if (hasSameControl) {
      console.log("can not add mulit control ZoomSlider");
      return;
    }
    zoomSlider = new ZoomSlider();
    map.addControl(zoomSlider);
  });

  return NULL;
});
</script>
