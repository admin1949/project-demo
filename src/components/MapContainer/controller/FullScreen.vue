<script lang="ts">
import { defineComponent, onUnmounted } from "vue";
import { FullScreen } from "ol/control";
import { useMap } from "../hooks/useMap";

export default defineComponent(() => {
  const { afterMapReady, mapInstance } = useMap();
  let fullScreen: FullScreen | null = null;

  onUnmounted(() => {
    if (fullScreen) {
      mapInstance.value?.map.removeControl(fullScreen);
      fullScreen.dispose();
      fullScreen = null;
    }
  });

  afterMapReady(({ map }) => {
    const hasSameControl = map
      .getControls()
      .getArray()
      .some((i) => i instanceof FullScreen);
    if (hasSameControl) {
      console.log("can not add mulit control FullScreen");
      return;
    }
    fullScreen = new FullScreen({
      source: mapInstance.value?.mapContainer.value,
    });
    map.addControl(fullScreen);
  });

  return () => null;
});
</script>
