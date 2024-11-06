<template>
  <ElTabs type="card" model-value="icon">
    <ElTabPane label="图标" name="icon">
      <IconStyleTable :map-style="mapStyle"></IconStyleTable>
    </ElTabPane>
    <ElTabPane label="线段" name="line">
      <LineStyleTable :map-style="mapStyle"></LineStyleTable>
    </ElTabPane>
    <ElTabPane label="多边形" name="polygon">
      <PolygonStyleTable :map-style="mapStyle"></PolygonStyleTable>
    </ElTabPane>
    <ElTabPane label="圆形" name="circle">
      <CircleStyleTable :map-style="mapStyle"></CircleStyleTable>
    </ElTabPane>
  </ElTabs>
</template>

<script setup lang="ts">
import { ElTabPane, ElTabs } from "element-plus";
import { MapStyle } from "./index";
import LineStyleTable from "./Line/LineStyleTable.vue";
import IconStyleTable from "./Icon/IconStyleTable.vue";
import PolygonStyleTable from "./Polygon/PolygonStyleTable.vue";
import CircleStyleTable from "./Circle/CircleStyleTable.vue";

defineProps<{
  mapStyle: MapStyle;
}>();
</script>
