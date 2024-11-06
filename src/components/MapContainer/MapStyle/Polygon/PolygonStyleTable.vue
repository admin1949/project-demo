<template>
  <div>
    <ElButton type="primary" @click="handleCreatePolygon">创建多边形样式</ElButton>
    <ElTable :data="polygonList" height="400px">
      <ElTableColumn label="唯一标识" prop="id"></ElTableColumn>
      <ElTableColumn label="描述" prop="desc"></ElTableColumn>
      <ElTableColumn label="边框" prop="width">
        <template #default="{ row }">
          <div>{{ row.width }}px，{{ row.stroke }}</div>
          <div :style="createStrokeStyle(row)"></div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="填充颜色" prop="fill">
        <template #default="{ row }">
          <div>{{ row.fill }}</div>
          <div :style="createFillStyle(row)"></div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作">
        <template #default="{ row }">
          <ElButton type="primary" plain @click="handleEditPlygon(row)">编辑</ElButton>
          <ElPopconfirm
            title="使用到此样式的线段将被替换为默认样式！"
            confirm-button-text="确认删除"
            confirm-button-type="danger"
            cancel-button-text="取消"
            width="230px"
            @confirm="handleDeletePolygon(row)"
          >
            <template #reference>
              <ElButton type="danger" plain @click="">删除</ElButton>
            </template>
          </ElPopconfirm>
        </template>
      </ElTableColumn>
    </ElTable>
    <PolygonStyleConfigDialog
      v-model:visible="showPolygonStyleDialog"
      :map-style="mapStyle"
      :polygon-config="editPolygonConfig"
    ></PolygonStyleConfigDialog>
  </div>
</template>

<script setup lang="ts">
import { ElButton, ElTable, ElTableColumn, ElPopconfirm } from "element-plus";
import { MapStyle, StyleCollection, StyleId } from "..";
import { StyleValue, onUnmounted, shallowRef } from "vue";
import { PolygonConfig, TEST_POLYGON_STYLE_ID } from ".";
import PolygonStyleConfigDialog from "./PolygonStyleConfigDialog.vue";

const props = defineProps<{
  mapStyle: MapStyle;
}>();

const styleBuilder = <T>(styleCollection: StyleCollection<T, any>, notUseIds: StyleId[]) => {
  return styleCollection
    .getAllStyle()
    .filter((i) => !notUseIds.includes(i[0]))
    .map((i) => i[1]);
};

const polygonList = shallowRef(styleBuilder(props.mapStyle.polygon, [TEST_POLYGON_STYLE_ID]));
const offLineListen = props.mapStyle.polygon.onMapStyleChange((ids) => {
  if (ids.length === 1 && ids[0] === TEST_POLYGON_STYLE_ID) {
    return;
  }
  polygonList.value = styleBuilder(props.mapStyle.polygon, [TEST_POLYGON_STYLE_ID]);
});

onUnmounted(() => {
  offLineListen();
});

const createStrokeStyle = (config: PolygonConfig): StyleValue => {
  return {
    minWidth: "60px",
    height: config.width + "px",
    backgroundColor: config.stroke,
  };
};
const createFillStyle = (config: PolygonConfig): StyleValue => {
  return {
    minWidth: "60px",
    height: "8px",
    backgroundColor: config.fill,
  };
};

const showPolygonStyleDialog = shallowRef(false);
const editPolygonConfig = shallowRef<PolygonConfig>();
const handleCreatePolygon = () => {
  editPolygonConfig.value = void 0;
  showPolygonStyleDialog.value = true;
};

const handleEditPlygon = (config: PolygonConfig) => {
  editPolygonConfig.value = config;
  showPolygonStyleDialog.value = true;
};
const handleDeletePolygon = (config: PolygonConfig) => {
  props.mapStyle.polygon.unregister(config.id);
};
</script>
