<template>
  <div>
    <ElButton type="primary" @click="handleCreateLine">创建线段样式</ElButton>
    <ElTable :data="lineList" height="400px">
      <ElTableColumn prop="id" label="唯一标识"></ElTableColumn>
      <ElTableColumn prop="desc" label="描述"></ElTableColumn>
      <ElTableColumn label="示例">
        <template #default="{ row }">
          <div>
            <div :style="createLineStyle(row)"></div>
            <img v-if="row.arrow !== 'none'" :style="createLineArrowStyle(row)" :src="row.arrowUrl" />
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="width" label="线宽">
        <template #default="{ row }">{{ row.width }}px</template>
      </ElTableColumn>
      <ElTableColumn prop="color" label="线条颜色"></ElTableColumn>
      <ElTableColumn prop="arrowUrl" label="箭头地址">
        <template #default="{ row }">
          {{ row.arrow === "none" ? "不显示箭头" : row.arrowUrl }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="arrowSize" label="箭头尺寸">
        <template #default="{ row }">
          {{ row.arrow === "none" ? "不显示箭头" : row.arrowSize + "px" }}
        </template>
      </ElTableColumn>
      <ElTableColumn width="200px" label="操作">
        <template #default="{ row }">
          <ElButton type="primary" plain @click="handleEditLine(row)">编辑</ElButton>
          <ElPopconfirm
            title="使用到此样式的线段将被替换为默认样式！"
            confirm-button-text="确认删除"
            confirm-button-type="danger"
            cancel-button-text="取消"
            width="230px"
            @confirm="handleDeleteLine(row)"
          >
            <template #reference>
              <ElButton type="danger" plain @click="">删除</ElButton>
            </template>
          </ElPopconfirm>
        </template>
      </ElTableColumn>
    </ElTable>
    <LineStyleConfigDialog
      :map-style="mapStyle"
      :line-config="editLineConfig"
      v-model:visible="showLineStyleDialog"
    ></LineStyleConfigDialog>
  </div>
</template>

<script setup lang="ts">
import { StyleValue, onUnmounted, shallowRef } from "vue";
import { MapStyle, StyleCollection, StyleId } from "..";
import { LineConfig, TEST_LINE_STYLE_ID } from "./index";
import { ElTable, ElTableColumn, ElButton, ElPopconfirm } from "element-plus";
import LineStyleConfigDialog from "./LineStyleConfigDialog.vue";

const props = defineProps<{
  mapStyle: MapStyle;
}>();

const styleBuilder = <T>(styleCollection: StyleCollection<T, any>, notUseIds: StyleId[]) => {
  return styleCollection
    .getAllStyle()
    .filter((i) => !notUseIds.includes(i[0]))
    .map((i) => i[1]);
};

const lineList = shallowRef(styleBuilder(props.mapStyle.lines, [TEST_LINE_STYLE_ID]));
const offLineListen = props.mapStyle.lines.onMapStyleChange((ids) => {
  if (ids.length === 1 && ids[0] === TEST_LINE_STYLE_ID) {
    return;
  }
  lineList.value = styleBuilder(props.mapStyle.lines, [TEST_LINE_STYLE_ID]);
});
const createLineStyle = (config: LineConfig): StyleValue => {
  return {
    minWidth: "60px",
    height: config.width + "px",
    backgroundColor: config.color,
  };
};
const createLineArrowStyle = (config: LineConfig): StyleValue => {
  return {
    width: config.arrowSize + "px",
    position: "absolute",
    top: "50%",
    right: config.arrow === "end" ? "0" : "auto",
    left: config.arrow === "end" ? "auto" : "50%",
    transform: config.arrow === "end" ? "translateY(-50%)" : "translate(-50%, -50%)",
    zIndex: 2,
  };
};
const showLineStyleDialog = shallowRef(false);
const editLineConfig = shallowRef<LineConfig>();
const handleEditLine = (config: LineConfig) => {
  editLineConfig.value = config;
  showLineStyleDialog.value = true;
};
const handleDeleteLine = (config: LineConfig) => {
  props.mapStyle.lines.unregister(config.id);
};
const handleCreateLine = () => {
  editLineConfig.value = undefined;
  showLineStyleDialog.value = true;
};

onUnmounted(() => {
  offLineListen();
});
</script>
