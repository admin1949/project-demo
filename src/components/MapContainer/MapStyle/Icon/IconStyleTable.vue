<template>
  <div>
    <ElButton type="primary" @click="handleCreateIcon">创建图标样式</ElButton>
    <ElTable :data="iconList" height="400px">
      <ElTableColumn prop="id" label="唯一标识"></ElTableColumn>
      <ElTableColumn prop="desc" label="描述"></ElTableColumn>
      <ElTableColumn label="显示图标" width="200px">
        <template #default="{ row }">
          <div>{{ row.src }}</div>
          <img :style="createImageStyle(row)" :src="row.src" alt="" />
        </template>
      </ElTableColumn>
      <ElTableColumn label="不透明度" prop="opacity"></ElTableColumn>
      <ElTableColumn label="旋转角度">
        <template #default="{ row }"> {{ row.rotation }}π </template>
      </ElTableColumn>
      <ElTableColumn width="150px" label="图标相对基准位置">
        <template #default="{ row }">{{ row.anchorOrigin }}</template>
      </ElTableColumn>
      <ElTableColumn label="x偏移量">
        <template #default="{ row }"
          >{{ row.x }}{{ row.unit === "fraction" ? "%" : "px" }}</template
        >
      </ElTableColumn>
      <ElTableColumn label="y偏移量">
        <template #default="{ row }"
          >{{ row.y }}{{ row.unit === "fraction" ? "%" : "px" }}</template
        >
      </ElTableColumn>
      <ElTableColumn label="尺寸">
        <template #default="{ row }">{{ getIocnSizeModelDesc(row) }}</template>
      </ElTableColumn>
      <ElTableColumn width="200px" label="操作">
        <template #default="{ row }">
          <ElButton type="primary" plain @click="handleEditIocn(row)"
            >编辑</ElButton
          >
          <ElPopconfirm
            title="使用到此图标的点位将被替换为默认样式点位！"
            confirm-button-text="确认删除"
            confirm-button-type="danger"
            cancel-button-text="取消"
            width="230px"
            @confirm="handleDeleteIcon(row)"
          >
            <template #reference>
              <ElButton type="danger" plain @click="">删除</ElButton>
            </template>
          </ElPopconfirm>
        </template>
      </ElTableColumn>
    </ElTable>
    <IconStyleConfigDialog
      v-model:visible="showIconStyleDialog"
      :icon-config="editIconConfig"
      :map-style="mapStyle"
    ></IconStyleConfigDialog>
  </div>
</template>

<script setup lang="ts">
import { StyleValue, onUnmounted, shallowRef } from "vue";
import { IconConfig, TEST_ICON_STYLE_ID } from ".";
import { MapStyle, StyleCollection, StyleId } from "..";
import IconStyleConfigDialog from "./IconStyleConfigDialog.vue";
import { ElTable, ElTableColumn, ElButton, ElPopconfirm } from "element-plus";

const props = defineProps<{
  mapStyle: MapStyle;
}>();

const styleBuilder = <T>(
  styleCollection: StyleCollection<T, any>,
  notUseIds: StyleId[]
) => {
  return styleCollection
    .getAllStyle()
    .filter((i) => !notUseIds.includes(i[0]))
    .map((i) => i[1]);
};

const iconList = shallowRef(
  styleBuilder(props.mapStyle.icons, [TEST_ICON_STYLE_ID])
);
const offIconListen = props.mapStyle.icons.onMapStyleChange((ids) => {
  if (ids.length === 1 && ids[0] === TEST_ICON_STYLE_ID) {
    return;
  }
  iconList.value = styleBuilder(props.mapStyle.icons, [TEST_ICON_STYLE_ID]);
});
const getIocnSizeModelDesc = (config: IconConfig) => {
  if (config.sizeModel === "scale") {
    if (config.scale === 1) {
      return "图标原始大小";
    }
    return `等比例缩放${config.scale}倍`;
  }

  if (config.sizeModel === "forceScale") {
    return `强制缩放至 ${config.width}px * ${config.height}px`;
  }

  if (config.sizeModel === "widthFit") {
    return `宽度指定为${config.width}px，高度自适应`;
  }

  if (config.sizeModel === "heighthFit") {
    return `高度指定为${config.height}px，宽度自适应`;
  }
  return "配置异常，显示为图标原始大小";
};
const createImageStyle = (config: IconConfig): StyleValue => {
  const style: StyleValue = {
    transform: `rotate(${config.rotation / 2}turn)`,
  };
  if (config.sizeModel === "scale") {
    style.transform = style.transform + ` scale(${config.scale})`;
  }

  if (config.sizeModel === "forceScale" || config.sizeModel === "widthFit") {
    style.width = config.width + "px";
  }

  if (config.sizeModel === "forceScale" || config.sizeModel === "heighthFit") {
    style.height = config.height + "px";
  }

  return style;
};

const showIconStyleDialog = shallowRef(false);
const editIconConfig = shallowRef<IconConfig>();
const handleEditIocn = (config: IconConfig) => {
  editIconConfig.value = config;
  showIconStyleDialog.value = true;
};
const handleDeleteIcon = (config: IconConfig) => {
  props.mapStyle.icons.unregister(config.id);
};
const handleCreateIcon = () => {
  editIconConfig.value = undefined;
  showIconStyleDialog.value = true;
};

onUnmounted(() => {
  offIconListen();
});
</script>
