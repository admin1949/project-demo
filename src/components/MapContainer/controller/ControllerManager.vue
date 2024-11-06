<script lang="ts">
import { Component, Fragment, defineComponent, h } from "vue";
import Distance from "./Distance.vue";
import PickCoordinate from "./PickCoordinate.vue";
import SwitchCenter from "./SwitchCenter.vue";
import SwitchSource from "./SwitchSource.vue";
import ZoomSlider from "./ZoomSlider.vue";
import Zoom from "./Zoom.vue";
import ScaleLine from "./ScaleLine.vue";
import OverviewMap from "./OverviewMap.vue";
import FullScreen from "./FullScreen.vue";

interface Props {
  ids: string[];
}

const CONTROL_MAP = new Map<string, Component>([
  ["Distance", Distance],
  ["PickCoordinate", PickCoordinate],
  ["ScaleLine", ScaleLine],
  ["SwitchCenter", SwitchCenter],
  ["SwitchSource", SwitchSource],
  ["Zoom", Zoom],
  ["ZoomSlider", ZoomSlider],
  ["OverviewMap", OverviewMap],
  ["FullScreen", FullScreen],
]);

export default defineComponent<Props>(
  (props) => {
    return () => {
      const ids = [...new Set(props.ids || [])].filter((i) =>
        CONTROL_MAP.has(i)
      );

      return h(
        Fragment,
        ids.map((key) => {
          const component = CONTROL_MAP.get(key)!;
          return h(component, { key });
        })
      );
    };
  },
  {
    props: ["ids"],
  }
);
</script>
