<template>
  <div>
    <ElButton @click="showDialog = true">基础配置</ElButton>
  </div>
  <ElDialog
    v-model="showDialog"
    :close-on-click-modal="false"
    title="编辑基础配置"
    width="1200px"
  >
    <ElForm label-suffix="：" label-width="120px">
      <ElFormItem label="中心点">
        <ElInput
          v-model="formData.center"
          :formatter="parsePointString"
          :parser="parsePointString"
        >
          <template #prepend>
            <ElSelect v-model="formData.centerProj">
              <ElOption :value="CRSTypes.BD09LL" label="百度坐标系"></ElOption>
              <ElOption :value="CRSTypes.WGS84" label="WGS84坐标系"></ElOption>
              <ElOption
                :value="CRSTypes.GCJ02"
                label="国测局02坐标系"
              ></ElOption>
            </ElSelect>
          </template>
        </ElInput>
      </ElFormItem>
      <ElFormItem label="地图层级">
        <ElInputNumber
          v-model="formData.zoom"
          :max="formData.maxZoom"
          :min="formData.minZoom"
          :step="1"
          step-strictly
        ></ElInputNumber>
      </ElFormItem>
      <ElFormItem label="最大层级">
        <ElInputNumber
          v-model="formData.maxZoom"
          :max="18"
          :min="formData.minZoom"
          :step="1"
          step-strictly
        ></ElInputNumber>
      </ElFormItem>
      <ElFormItem label="最小层级">
        <ElInputNumber
          v-model="formData.minZoom"
          :max="formData.maxZoom"
          :min="1"
          :step="1"
          step-strictly
        ></ElInputNumber>
      </ElFormItem>
      <ElFormItem label="地图工具">
        <ElCheckboxGroup v-model="formData.controls">
          <ElCheckbox label="SwitchSource">图层切换</ElCheckbox>
          <ElCheckbox label="OverviewMap">小地图</ElCheckbox>
          <ElCheckbox label="Zoom">层级切换按钮</ElCheckbox>
          <ElCheckbox label="ZoomSlider">层级切换滚动条</ElCheckbox>
          <ElCheckbox label="FullScreen">全屏工具</ElCheckbox>
          <ElCheckbox label="ScaleLine">比例尺</ElCheckbox>
          <ElCheckbox label="Distance">测距/测面积</ElCheckbox>
          <ElCheckbox label="PickCoordinate">地图选点</ElCheckbox>
          <ElCheckbox label="SwitchCenter">切换中心点</ElCheckbox>
        </ElCheckboxGroup>
      </ElFormItem>
      <ElFormItem label="默认图层">
        <ElSelect v-model="formData.defaultViewId">
          <ElOption
            v-for="i in sourceList"
            :key="i.id"
            :value="i.id"
            :label="i.name"
          >
            【{{ i.gcoord }}】{{ i.name }}
          </ElOption>
        </ElSelect>
      </ElFormItem>
      <ElFormItem>
        <ElButton type="primary" @click="handleSubmit" plain>保存</ElButton>
        <ElButton plain @click="closeDialog">取消</ElButton>
      </ElFormItem>
    </ElForm>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import {
  ElButton,
  ElCheckbox,
  ElCheckboxGroup,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElSelect,
} from "element-plus";
import { CRSTypes, Point, BaseConfig } from "../utils";
import { querySourceList } from "../mock/index";
import { useLastAsync } from "@/hooks/useAsync";

const props = defineProps<{
  mapConfig: BaseConfig;
}>();

const emit = defineEmits<{
  (event: "update:mapConfig", data: BaseConfig): void;
}>();

const showDialog = ref(false);
const closeDialog = () => {
  showDialog.value = false;
};

const resolveMapConfig = (config: Partial<BaseConfig> = {}) => {
  const baseConfig = {
    center: "121.860842, 29.916293",
    centerProj: CRSTypes.BD09LL,
    zoom: 13,
    maxZoom: 18,
    minZoom: 2,
    controls: new Array<string>(),
    defaultViewId: "",
  };

  const { center, ...reset } = config;
  if (center) {
    baseConfig.center = center.join(", ");
  }
  Object.entries(reset).forEach(([key, val]) => {
    // @ts-ignore
    baseConfig[key] = val;
  });
  return baseConfig;
};
const formData = ref(resolveMapConfig(props.mapConfig));
const parsePointString = (str: string) => {
  if (!str) {
    return "";
  }
  if (str.includes("，")) {
    return str.replace(/( *， *)/, ", ");
  }
  if (!str.includes(",")) {
    return str.replace(/( +)/, ", ");
  }
  return str.replace(/( *, *)/, ", ");
};

const { data: sourceList, load: loadSourceList } = useLastAsync(
  querySourceList,
  (res) => res?.data || []
);

loadSourceList();

const handleSubmit = () => {
  const { center, ...reset } = formData.value;
  const point = formData.value.center.split(", ").map(Number);
  if (point.length !== 2 || point.some((i) => Number.isNaN(i))) {
    ElMessage.warning("请填写合法的地图中心点");
    return;
  }
  const data = {
    center: point as Point,
    ...reset,
  };
  emit("update:mapConfig", data);
  closeDialog();
};

watch(
  () => props.mapConfig,
  (config) => {
    formData.value = resolveMapConfig(config);
  }
);
</script>

<style scoped></style>
