<template>
  <ElDialog
    v-model="showDialog"
    width="1200px"
    :close-on-click-modal="false"
    title="线段样式配置"
  >
    <div class="with-preview">
      <ElForm
        class="form"
        ref="formInstance"
        :model="formData"
        :rules="rules"
        label-suffix="："
        label-width="140px"
      >
        <ElFormItem label="唯一标识" prop="id">
          <ElInput v-model="formData.id"></ElInput>
        </ElFormItem>
        <ElFormItem label="描述" prop="desc">
          <ElInput v-model="formData.desc"></ElInput>
        </ElFormItem>
        <ElFormItem label="边框线宽" prop="width">
          <ElInputNumber
            v-model="formData.width"
            :min="1"
            :step="1"
          ></ElInputNumber>
        </ElFormItem>
        <ElFormItem label="边框颜色" prop="stroke">
          <ElColorPicker v-model="formData.stroke" show-alpha></ElColorPicker>
        </ElFormItem>
        <ElFormItem label="填充方式">
          <ElRadioGroup v-model="formData.fillModel">
            <ElRadio label="color">纯色填充</ElRadio>
            <ElRadio label="gradient">中心渐变填充</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem
          label="填充颜色"
          prop="fill"
          v-if="formData.fillModel === 'color'"
        >
          <ElColorPicker v-model="formData.fill" show-alpha></ElColorPicker>
        </ElFormItem>
        <ElFormItem
          label="渐变颜色配置"
          prop="fill"
          v-if="formData.fillModel === 'gradient'"
        >
          <ElColorPicker v-model="formData.fill" show-alpha></ElColorPicker>
        </ElFormItem>
        <ElFormItem>
          <ElButton @click="handleSubmit" type="primary" plain>保存</ElButton>
          <ElButton @click="closeDialog">取消</ElButton>
        </ElFormItem>
      </ElForm>
      <div style="width: 300px">
        <Map
          class="map-example"
          :center="demoPoint"
          :projection="CRSTypes.WGS84"
          :zoom="12"
        >
          <StaticPointIconLayer
            :data="testData"
            :proj="CRSTypes.WGS84"
          ></StaticPointIconLayer>
        </Map>
        <div style="height: 16px"></div>
        <ElText type="info">
          <ElIcon><InfoFilled /></ElIcon>
          黑点为基准坐标点，仅用于辅助定位，不会实际显示
        </ElText>
      </div>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElText,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElColorPicker,
  type FormRules,
  type FormInstance,
  ElMessage,
  ElRadioGroup,
  ElRadio,
} from "element-plus";
import { InfoFilled } from "@element-plus/icons-vue";
import { MapStyle } from "..";
import { useDialog } from "@/hooks/useDialog";
import { nextTick, ref, watch } from "vue";
import Map from "../../index.vue";
import StaticPointIconLayer from "../../layer/StaticAssetsLayer.vue";
import {
  Point,
  CRSTypes,
  WithStyleCircle,
  WithStylePoint,
  SourceType,
} from "../../utils";
import { TEST_CIRCLE_STYLE_ID, CircleConfig, resolveCircleConfig } from ".";
import { useAsync } from "@/hooks/useAsync";

const props = defineProps<{
  visible: boolean;
  mapStyle: MapStyle;
  polygonConfig?: CircleConfig;
}>();

defineEmits<{
  (event: "update:visible", val: boolean): void;
}>();

const { showDialog, closeDialog } = useDialog(props, "visible", "线段样式配置");
const { mapStyle } = props;

const demoPoint: Point = [122.62952601015279, 30.849515386098748];
const testData: (WithStyleCircle | WithStylePoint)[] = [
  {
    type: SourceType.CIRCLE,
    source: [[demoPoint[0], demoPoint[1]], 2000],
    styleId: TEST_CIRCLE_STYLE_ID,
  },
  {
    type: SourceType.POINT,
    source: [demoPoint[0], demoPoint[1]],
    styleId: "",
  },
];

const formData = ref(resolveCircleConfig(props.polygonConfig));
const formInstance = ref<FormInstance>();
const rules: FormRules = {
  id: {
    required: true,
    validator: (_, value: string, cb) => {
      if (!value) {
        return cb("图标全局唯一id不能为空！");
      }
      if (value === props.polygonConfig?.id) {
        return cb();
      }
      const hasRepet = mapStyle.circle.getAllStyle().some(([_, config]) => {
        if (config === formData.value) {
          return false;
        }
        return (config as CircleConfig).id === value;
      });
      if (hasRepet) {
        return cb("图标全局id不能重复，请修改！");
      }
      return cb();
    },
  },
};

watch(
  formData,
  (config) => {
    mapStyle.circle.registry(TEST_CIRCLE_STYLE_ID, config);
  },
  {
    deep: true,
    immediate: true,
  }
);
watch(
  () => props.polygonConfig,
  (config) => {
    formData.value = resolveCircleConfig(config);
  }
);

const { load: handleSubmit } = useAsync(async () => {
  const status = await formInstance.value?.validate().catch(() => false);
  if (!status) {
    return;
  }

  if (props.polygonConfig) {
    mapStyle.circle.update(
      formData.value.id,
      formData.value,
      props.polygonConfig.id
    );
    ElMessage.success("保存成功!");
  } else {
    mapStyle.circle.registry(formData.value.id, formData.value);
    ElMessage.success("创建成功");
    nextTick(() => {
      formData.value = resolveCircleConfig();
    });
  }

  closeDialog();
});
</script>

<style lang="scss" scoped>
.with-preview {
  display: flex;
  gap: 18px;
  .form {
    width: 0;
    flex: 1;
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
