<script lang="ts">
import { defineComponent, onUnmounted } from "vue";
import { Zoom } from "ol/control";
import { useMap } from "../hooks/useMap";
import { NULL } from "@/utils";

export default defineComponent(() => {
  const { afterMapReady, mapInstance } = useMap();
  let zoom: Zoom | null = null;

  onUnmounted(() => {
    if (zoom) {
      mapInstance.value?.map.removeControl(zoom);
      zoom.dispose();
      zoom = null;
    }
  });

  afterMapReady(({ map }) => {
    const hasSameControl = map
      .getControls()
      .getArray()
      .some((i) => i instanceof Zoom);
    if (hasSameControl) {
      console.log("can not add mulit control Zoom");
      return;
    }
    zoom = new Zoom();
    map.addControl(zoom);
  });

  return NULL;
});
</script>
