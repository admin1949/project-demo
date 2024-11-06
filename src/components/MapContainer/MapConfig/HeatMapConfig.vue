<template>
  <div>
    <ElButton @click="showDialog = true">热力图配置</ElButton>
    <ElDialog title="配置热力图" v-model="showDialog" width="1200px">
      <div class="with-preview">
        <ElForm class="form" label-width="120px" label-suffix="：">
          <ElFormItem label="半径">
            <ElInputNumber v-model="formData.radius" :min="0"></ElInputNumber>
          </ElFormItem>
          <ElFormItem label="模糊半径">
            <ElInputNumber v-model="formData.blur" :min="0"></ElInputNumber>
          </ElFormItem>
          <ElFormItem label="颜色渐变">
            <div class="color-group">
              <div v-for="(_i, idx) in formData.gradient" :key="idx">
                <ElColorPicker
                  @change="handleChangeGradient"
                  v-model="formData.gradient[idx]"
                  color-format="hex"
                ></ElColorPicker>
              </div>
            </div>
          </ElFormItem>
          <ElFormItem label="是否显示">
            <ElSwitch
              v-model="formData.visible"
              inactive-text="否"
              active-text="是"
            ></ElSwitch>
          </ElFormItem>
          <ElFormItem label="数据坐标系">
            <ElSelect v-model="formData.proj">
              <ElOption :value="CRSTypes.BD09LL" label="百度坐标系"></ElOption>
              <ElOption :value="CRSTypes.WGS84" label="WGS84坐标系"></ElOption>
              <ElOption
                :value="CRSTypes.GCJ02"
                label="国测局02坐标系"
              ></ElOption>
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="数据源">
            <ElInput
              type="textarea"
              :autosize="{ maxRows: 6, minRows: 4 }"
              v-model="formData.source"
            ></ElInput>
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" @click="handleSubmit">保存</ElButton>
            <ElButton @click="closeDialog">取消</ElButton>
          </ElFormItem>
        </ElForm>
        <div style="width: 300px">
          <div style="padding-bottom: 10x">数据个数</div>
          <ElSlider v-model="pointNums" :min="0" :max="100"></ElSlider>
          <div style="padding-bottom: 10x"></div>
          <Map
            class="map-example"
            :center="demoPoint"
            :projection="CRSTypes.WGS84"
            :zoom="12"
          >
            <HeatMap
              :proj="CRSTypes.WGS84"
              :gradient="formData.gradient"
              :blur="formData.blur"
              :radius="formData.radius"
              :data="testData"
            ></HeatMap>
          </Map>
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElInputNumber,
  ElColorPicker,
  ElInput,
  ElSlider,
  ElMessage,
  ElSwitch,
} from "element-plus";
import { computed, ref } from "vue";
import { CRSTypes, Point, HeatMapConfig } from "../utils";
import HeatMap from "../layer/HeatMap.vue";
import Map from "../index.vue";

const props = withDefaults(
  defineProps<{
    config?: HeatMapConfig;
  }>(),
  {
    config: () => ({
      gradient: ["#2200ff", "#16d9cc", "#4dee12", "#e8d225", "#ef1616"],
      radius: 5,
      blur: 15,
      visible: true,
      source: {
        proj: CRSTypes.BD09LL,
        list: [],
      },
    }),
  }
);
const emit = defineEmits<{
  (evetn: "update:config", data: HeatMapConfig): void;
}>();
const resolveHeatmapConfig = (config: HeatMapConfig) => {
  return {
    ...config,
    gradient: [...config.gradient],
    proj: config.source.proj,
    source: JSON.stringify(config.source.list, undefined, 2),
  };
};

const demoPoint: Point = [122.62952601015279, 30.849515386098748];

const showDialog = ref(false);
const closeDialog = () => (showDialog.value = false);
const formData = ref(resolveHeatmapConfig(props.config));

const handleChangeGradient = () => {
  formData.value.gradient = [...formData.value.gradient];
};
const pointNums = ref(1);
const testData = computed(() => {
  return Array.from({ length: pointNums.value }).map((_, idx) => {
    const offset = idx * 0.00013;
    const rota = idx * 0.1 * Math.PI;

    const offsetX = Math.sin(rota) * offset;
    const offsetY = Math.cos(rota) * offset;
    return {
      lng: demoPoint[0] + offsetX,
      lat: demoPoint[1] + offsetY,
      weight: 0.75,
    };
  });
});

const handleSubmit = () => {
  try {
    const { proj, source, ...reset } = formData.value;
    const list = JSON.parse(formData.value.source);
    emit("update:config", {
      ...reset,
      source: {
        list,
        proj,
      },
    });
    closeDialog();
  } catch (err) {
    ElMessage.error("保存配置错误，请检查" + err);
  }
};
</script>

<style lang="scss" scoped>
.with-preview {
  display: flex;
  gap: 18px;
  .form {
    width: 0;
    flex: 1;
    .color-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
  .map-example {
    width: 300px;
    height: 300px;
  }
  .flex-box {
    display: flex;
    gap: 20px;
    .flex-item {
      display: flex;
    }
  }
}
</style>
