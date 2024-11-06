<template>
  <div class="ol-control distance-container">
    <button @click="toggleDrawStatus">
      <ElIcon :size="16">
        <Van v-if="!isActiveDistance"></Van>
        <Close v-else></Close>
      </ElIcon>
    </button>
    <div v-show="isActiveDistance" class="type-select">
      <div>测量方式</div>
      <select v-model="model" style="color: black" @change="handleChangeModel">
        <option value="LineString">距离</option>
        <option value="Polygon">面积</option>
      </select>
      <button title="清空" @click="clearSource">
        <ElIcon :size="16">
          <Delete></Delete>
        </ElIcon>
      </button>
    </div>
    <!-- 辅助提示的信息 -->
    <Overlay
      v-if="isActiveDistance"
      :position="currentPoint"
      positioning="center-left"
      :offset="[15, 0]"
      :proj="CRSTypes.WM"
    >
      <div class="ol-tooltip">{{ helpText }}</div>
    </Overlay>

    <!-- 显示距离或者面积的提示 -->
    <Overlay
      v-if="isActiveDistance && linePointLength > 0"
      :position="polygonCenter"
      :proj="CRSTypes.WM"
      positioning="bottom-center"
      :offset="[0, -15]"
      :stop-event="false"
      :insert-first="false"
    >
      <div class="ol-tooltip ol-tooltip-measure" v-html="lineLength"></div>
    </Overlay>
    <template v-for="(i, _idx) in distanceList" :key="_idx">
      <Overlay
        :position="i.point"
        :proj="CRSTypes.WM"
        positioning="bottom-center"
        :offset="[0, -7]"
        :stop-event="false"
        :insert-first="false"
      >
        <div class="ol-tooltip ol-tooltip-static" v-html="i.distance"></div>
      </Overlay>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { useMap } from "../hooks/useMap";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import Draw from "ol/interaction/Draw";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import Overlay from "../layer/Overlay.vue";
import { CRSTypes, Point } from "../utils";
import { Geometry, LineString, Polygon } from "ol/geom";
import { getLength, getArea } from "ol/sphere";
import { unByKey } from "ol/Observable";
import type { EventsKey } from "ol/events";
import { Type } from "ol/geom/Geometry";
import type { Feature } from "ol";
import { ElIcon } from "element-plus";
import { Close, Delete, Van } from "@element-plus/icons-vue";

const { registerLayer, mapInstance, afterMapReady } = useMap();
const isActiveDistance = ref(false);

const layer = new VectorLayer({
  source: new VectorSource<Feature<Geometry>>({
    features: [],
  }),
  zIndex: 999,
  style: {
    "fill-color": "rgba(255, 255, 255, 0.2)",
    "stroke-color": "#ffcc33",
    "stroke-width": 2,
    "circle-radius": 7,
    "circle-fill-color": "#ffcc33",
  },
});

const off = registerLayer("distance-layer", layer);

let draw: Draw | null = null;
const currentPoint = ref<Point>([0, 0]);
const polygonCenter = ref<Point>([0, 0]);
const linePointLength = ref(0);
const lineLength = ref("");
const model = ref<Type>("LineString");

const distanceList = ref<
  {
    point: Point;
    distance: string;
  }[]
>([]);

const helpText = computed(() => {
  if (model.value === "Polygon") {
    if (linePointLength.value <= 0) {
      return "单击以开始测量面积";
    }

    return "单击新增拐点，双击以完成测量";
  }
  if (linePointLength.value <= 0) {
    return "单击以开始测量距离";
  }
  return "单击新增拐点，双击以完成测量";
});

afterMapReady(({ map }) => {
  const e1 = map.on("pointermove", (e) => {
    if (!isActiveDistance.value || e.dragging) {
      return;
    }
    currentPoint.value = e.coordinate as Point;
  });
  return e1;
});

const formatLength = (line: Geometry) => {
  const length = getLength(line, {
    projection: "EPSG:4326",
  });

  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + " " + "km";
  } else {
    output = Math.round(length * 100) / 100 + " " + "m";
  }
  return output;
};

const formatArea = function (polygon: Polygon) {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + " " + "km<sup>2</sup>";
  } else {
    output = Math.round(area * 100) / 100 + " " + "m<sup>2</sup>";
  }
  return output;
};

const createDrawInteraction = () => {
  const map = mapInstance.value?.map;
  if (!map) {
    return;
  }
  const type = model.value;
  draw = new Draw({
    type: type,
    source: layer.getSource()!,
    style: new Style({
      fill: new Fill({
        color: "rgba(255, 255, 255, 0.2)",
      }),
      stroke: new Stroke({
        color: "rgba(0, 0, 0, 0.5)",
        lineDash: [10, 10],
        width: 2,
      }),
      image: new CircleStyle({
        radius: 5,
        stroke: new Stroke({
          color: "rgba(0, 0, 0, 0.7)",
        }),
        fill: new Fill({
          color: "rgba(255, 255, 255, 0.2)",
        }),
      }),
    }),
  });

  map.addInteraction(draw);
  const waitOffKyes = new Array<EventsKey>();

  draw.on("drawstart", (e) => {
    const event = e.feature.getGeometry()?.on("change", (evt) => {
      const geom = evt.target;
      if (geom instanceof LineString) {
        lineLength.value = formatLength(geom);
        linePointLength.value = geom.getCoordinates().length;
        polygonCenter.value = geom.getLastCoordinate() as Point;
      } else if (geom instanceof Polygon) {
        lineLength.value = formatArea(geom);
        linePointLength.value = geom.getCoordinates().length;
        polygonCenter.value = geom.getInteriorPoint().getCoordinates() as Point;
      }
    });
    if (event) {
      waitOffKyes.push(event);
    }
  });

  draw.on("drawend", () => {
    console.log("off draw model");

    waitOffKyes.forEach(unByKey);
    waitOffKyes.length = 0;

    distanceList.value.push({
      point: polygonCenter.value,
      distance: lineLength.value,
    });

    linePointLength.value = 0;
    lineLength.value = "";
  });
};

const handleChangeModel = () => {
  const map = mapInstance.value?.map;
  if (!map || !isActiveDistance.value) {
    return;
  }
  if (draw) {
    map.removeInteraction(draw);
  }
  createDrawInteraction();
};

const clearSource = () => {
  layer.getSource()?.clear();
  distanceList.value = [];
};

const toggleDrawStatus = () => {
  const map = mapInstance.value?.map;
  if (!map) {
    return;
  }
  if (isActiveDistance.value) {
    if (draw) {
      map.removeInteraction(draw);
      draw.dispose();
      draw = null;
    }
    isActiveDistance.value = false;
    return;
  }

  createDrawInteraction();
  isActiveDistance.value = true;
};

onUnmounted(() => {
  off();
  draw?.dispose();
  draw = null;
});
</script>

<style scoped lang="scss">
.distance-container {
  position: absolute;
  top: 38px;
  right: 0.5em;
  z-index: 2;
  .type-select {
    position: absolute;
    padding: 4px 8px;
    top: 50%;
    right: 40px;
    font-size: 16px;
    color: #fff;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    width: max-content;
    gap: 12px;
    border-radius: 4px;
    &:before {
      border-left: 6px solid rgba(0, 0, 0, 0.5);
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      content: "";
      position: absolute;
      top: 50%;
      margin-top: -6px;
      right: -6px;
    }
  }
}
.ol-tooltip {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  opacity: 0.7;
  white-space: nowrap;
  font-size: 12px;
  cursor: default;
  user-select: none;
}

.ol-tooltip-measure {
  opacity: 1;
  font-weight: bold;
}
.ol-tooltip-measure:before,
.ol-tooltip-static:before {
  border-top: 6px solid rgba(0, 0, 0, 0.5);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: "";
  position: absolute;
  bottom: -6px;
  margin-left: -7px;
  left: 50%;
}

.ol-tooltip-static {
  background-color: #ffcc33;
  color: black;
  border: 1px solid white;
  &:before {
    border-top-color: #ffcc33;
  }
}
</style>
