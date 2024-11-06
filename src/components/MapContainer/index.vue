<template>
  <div class="map-container" ref="mapContainer">
    <div ref="container" class="map"></div>
    <BackgroundLayer
      :source="sourceList"
      :active-id="activeSourceId"
    ></BackgroundLayer>
    <ControllerManager :ids="controls"></ControllerManager>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, onMounted, onUnmounted, watch } from "vue";
import { useMapContainer } from "./hooks/useMap";
import { Map as OlMap, View } from "ol";
import { CRSTypes, Point, transform } from "./utils";
import { autoTransfrom } from "./hooks/useProjection";
import BackgroundLayer from "./view/BackgroundLayer.vue";
import { querySourceList } from "./mock";
import { useAsync } from "@/hooks/useAsync";
import { autoWatch } from "./hooks/useAutoWatch";
import ControllerManager from "./controller/ControllerManager.vue";
import "ol/ol.css";

type Controllers =
  | "Distance"
  | "PickCoordinate"
  | "ScaleLine"
  | "SwitchCenter"
  | "SwitchSource"
  | "Zoom"
  | "ZoomSlider"
  | "OverviewMap"
  | "FullScreen";

const props = withDefaults(
  defineProps<{
    projection?: CRSTypes;
    center?: Point;
    zoom?: number;
    maxZoom?: number;
    minZoom?: number;
    controls?: Controllers[];
  }>(),
  {
    // center: () => [121.860842, 29.916293], // 中国-浙江省-宁波市-北仑区
    // center: () => [116.380572112436, 39.913307858616875], // 百度坐标系 中国-北京-西单地铁站
    // center: () => [116.374277, 39.90738], // 高德坐标系 中国-北京-西单地铁站
    center: () => [117.10970235847704, 36.25581865649141], // 高德坐标系 中国-泰山风景区
    projection: CRSTypes.AMap,
    zoom: 14,
    maxZoom: 18,
    minZoom: 3,
    controls: () => [],
  }
);

const container = shallowRef<HTMLDivElement>();
const mapContainer = shallowRef<HTMLDivElement>();
const { onMapReady, disposeMap, mapInstance, mapSourceControl } =
  useMapContainer();

let map: OlMap | null = null;

const view = new View({
  center: autoTransfrom(props.center, props.projection),
  // projection: "EPSG:4326",
  zoom: props.zoom,
  maxZoom: props.maxZoom,
  minZoom: props.minZoom,
});

const { sourceList, activeSourceId, updateMapSource } = mapSourceControl;
const { load: refreshMapSource } = useAsync(querySourceList, (res) => {
  const list = res?.data || [];
  updateMapSource(list);
});

refreshMapSource();

const currentCenter = shallowRef<Point>();
onMounted(() => {
  map = new OlMap({
    target: container.value,
    view,
    layers: [],
    controls: [],
  });

  map.on("moveend", () => {
    currentCenter.value = view.getCenter() as Point;
  });

  onMapReady({
    map,
    projection: props.projection,
    mapContainer,
  });
});

autoWatch(props, view, {
  maxZoom: 18,
  minZoom: 3,
  zoom: 13,
});

onUnmounted(disposeMap);

watch(
  () => [props.center, props.projection] as const,
  ([center, proj], [oldCenter, oldPorj]) => {
    if (oldCenter === center && proj === oldPorj && currentCenter.value) {
      view?.setCenter(currentCenter.value);
      console.log("use last map center", currentCenter.value);
      return;
    }

    const centerPoint = autoTransfrom(center, proj);
    console.log("change to new center", proj, centerPoint);
    view?.setCenter(centerPoint);
  }
);

const setCenter = (center: Point, proj?: CRSTypes) => {
  view.setCenter(autoTransfrom(center, proj));
};

const switchMap = () => {
  const index = sourceList.value.findIndex(
    (item) => item.id === activeSourceId.value
  );
  const nextIndex = (index + 1) % sourceList.value.length;
  activeSourceId.value = sourceList.value[nextIndex].id;
};

defineExpose({
  transform,
  CRSTypes,
  setCenter,
  mapInstance,
  switchMap,
});
</script>

<style scoped lang="scss">
.map-container {
  width: 100%;
  height: 100%;
  position: relative;

  & > .map {
    width: 100%;
    height: 100%;
  }
}
</style>
