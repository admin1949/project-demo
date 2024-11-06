<script lang="ts">
import { defineComponent, onUnmounted } from "vue";
import { ScaleLine } from "ol/control";
import { useMap } from "../hooks/useMap";

export default defineComponent(() => {
  const { afterMapReady, mapInstance } = useMap();
  let scaleLine: ScaleLine | null = null;

  onUnmounted(() => {
    if (scaleLine) {
      mapInstance.value?.map.removeControl(scaleLine);
      scaleLine.dispose();
      scaleLine = null;
    }
  });

  afterMapReady(({ map }) => {
    const hasSameControl = map
      .getControls()
      .getArray()
      .some((i) => i instanceof ScaleLine);
    if (hasSameControl) {
      console.log("can not add mulit control ScaleLine");
      return;
    }
    scaleLine = new ScaleLine();
    map.addControl(scaleLine);
  });

  return () => null;
});
</script>
