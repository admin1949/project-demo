<script lang="ts">
import { Fragment, defineComponent, h, type Component } from "vue";
import { MAP_TYPE } from "../utils";
import BaiduView from "./Baidu/index.vue";
import AMapView from "./AMap/index.vue";
import TMSView from "./TMS/index.vue";
import TMSGCJ02View from "./TMS_GCJ02/index.vue";
import GEO_WMTSView from "./GEO_WMTS/index.vue";
import WGS84View from "./WGS_84/index.vue";
import { VNode } from "vue";
import { SourceItem } from "../mock";

interface Props {
  source: SourceItem[];
  activeId?: string | number;
}

const backgroundViewMap = new Map<MAP_TYPE, Component<{ url?: string }>>([
  [MAP_TYPE.BAI_DU, BaiduView],
  [MAP_TYPE.GAO_DE, AMapView],
  [MAP_TYPE.TMS, TMSView],
  [MAP_TYPE.TMS_GJC02, TMSGCJ02View],
  [MAP_TYPE.GEO_WMTS, GEO_WMTSView],
  [MAP_TYPE.WGS_84, WGS84View],
]);

export default defineComponent<Props>({
  props: ["source", "activeId"] as any,
  setup(props) {
    return () => {
      const shouldRenderItem = props.source.find(
        (i) => i.id === props.activeId
      );
      if (!shouldRenderItem) {
        return;
      }
      const layes = shouldRenderItem.layers
        .slice()
        .sort((i, j) => (i.sort || 0) - (j.sort || 0));
      const layersNodes = layes.reduce((list, layer, idx) => {
        const component = backgroundViewMap.get(layer.mapType);
        if (!component) {
          return list;
        }
        const props: {
          url: string;
          key: string;
          config?: any;
          maxZoom?: number;
          sort?: number;
        } = {
          url: layer.url,
          key: `${shouldRenderItem.id}-${idx}`,
          maxZoom: layer.maxZoom,
          sort: layer.sort,
        };

        if (layer.mapType === MAP_TYPE.GEO_WMTS) {
          props.config = layer.config;
        }

        list.push(h(component, props));
        return list;
      }, new Array<VNode>());

      if (!layersNodes.length) {
        return;
      }

      return h(Fragment, layersNodes);
    };
  },
});
</script>
