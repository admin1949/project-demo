<script lang="ts">
import { Overlay } from "ol";
import type { Options } from "ol/Overlay";
import { useMap } from "../hooks/useMap";
import {
  defineComponent,
  getCurrentInstance,
  h,
  onUnmounted,
  render,
  renderSlot,
  watch,
} from "vue";
import { autoWatch } from "../hooks/useAutoWatch";
import { CRSTypes, Point } from "../utils";
import { nextTick } from "vue";
import { autoTransfrom } from "../hooks/useProjection";

interface Props {
  offset?: Options["offset"];
  position?: Options["position"];
  positioning?: Options["positioning"];
  stopEvent?: Options["stopEvent"];
  insertFirst?: Options["insertFirst"];
  autoPan?: Options["autoPan"];
  proj?: CRSTypes;
}

export default defineComponent<Props>({
  props: [
    "offset",
    "position",
    "positioning",
    "stopEvent",
    "insertFirst",
    "autoPan",
    "proj",
  ] as any,
  setup(props, { slots }) {
    const { afterMapReady, mapInstance } = useMap();
    const container = document.createElement("div");

    let overlay: Overlay | null = new Overlay({
      element: container,
      ...props,
      position: autoTransfrom(props.position as Point, props.proj),
    });

    autoWatch(props, overlay, {
      offset: () => [0, 15],
      positioning: "bottom-center",
    });

    watch(
      () => [props.position, props.proj] as const,
      ([position, proj]) => {
        overlay?.setPosition(autoTransfrom(position as Point, proj));
      }
    );

    onUnmounted(() => {
      if (overlay) {
        mapInstance.value?.map.removeOverlay(overlay);
        overlay?.dispose();
        overlay = null;
      }
      nextTick(() => {
        render(null, container);
      });
    });

    afterMapReady(({ map }) => {
      if (overlay) {
        map.addOverlay(overlay);
      }
    });

    const instance = getCurrentInstance()!;
    return () => {
      const vnode = renderSlot(slots, "default", void 0, () => {
        return [h("span")];
      });
      vnode.appContext = instance.appContext;

      render(vnode, container);
    };
  },
});
</script>
