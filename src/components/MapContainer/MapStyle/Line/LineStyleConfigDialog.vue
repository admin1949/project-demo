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
        <ElFormItem label="线宽" prop="width">
          <ElInputNumber
            v-model="formData.width"
            :min="1"
            :step="1"
          ></ElInputNumber>
        </ElFormItem>
        <ElFormItem label="线条颜色" prop="color">
          <ElColorPicker v-model="formData.color" show-alpha></ElColorPicker>
        </ElFormItem>
        <ElFormItem label="结尾箭头" prop="endArrow">
          <ElRadioGroup v-model="formData.arrow">
            <ElRadio label="none">无</ElRadio>
            <ElRadio label="end">结尾方向箭头</ElRadio>
            <ElRadio label="line">跟随线段</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <template v-if="formData.arrow !== 'none'">
          <ElFormItem label="箭头路径" prop="arrowUrl">
            <ElInput v-model="formData.arrowUrl"></ElInput>
          </ElFormItem>
          <ElFormItem label="箭头尺寸" prop="endArrow">
            <ElInputNumber
              v-model="formData.arrowSize"
              :step="2"
              :min="10"
            ></ElInputNumber>
          </ElFormItem>
        </template>
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
  ElRadioGroup,
  ElRadio,
  type FormRules,
  type FormInstance,
  ElMessage,
} from "element-plus";
import { InfoFilled } from "@element-plus/icons-vue";
import { MapStyle } from "..";
import { useDialog } from "@/hooks/useDialog";
import { nextTick, ref, watch } from "vue";
import Map from "../../index.vue";
import StaticPointIconLayer from "../../layer/StaticAssetsLayer.vue";
import {
  Point,
  WithStyleLineString,
  CRSTypes,
  WithStylePoint,
  SourceType,
} from "../../utils";
import { TEST_LINE_STYLE_ID, LineConfig, resolveLineConfig } from ".";
import { useAsync } from "@/hooks/useAsync";

const props = defineProps<{
  visible: boolean;
  mapStyle: MapStyle;
  lineConfig?: LineConfig;
}>();

defineEmits<{
  (event: "update:visible", val: boolean): void;
}>();

const { showDialog, closeDialog } = useDialog(props, "visible", "线段样式配置");
const { mapStyle } = props;

const demoPoint: Point = [122.62952601015279, 30.849515386098748];
const offset = 0.03;
const testData: (WithStyleLineString | WithStylePoint)[] = [
  {
    type: SourceType.LINE,
    source: [
      [demoPoint[0] - offset, demoPoint[1] + offset],
      [demoPoint[0] + offset, demoPoint[1]],
      [demoPoint[0] - offset, demoPoint[1]],
      [demoPoint[0] + offset, demoPoint[1] - offset],
    ],
    styleId: TEST_LINE_STYLE_ID,
  },
];

const formData = ref(resolveLineConfig(props.lineConfig));
const formInstance = ref<FormInstance>();
const rules: FormRules = {
  id: {
    required: true,
    validator: (_, value: string, cb) => {
      if (!value) {
        return cb("图标全局唯一id不能为空！");
      }
      if (value === props.lineConfig?.id) {
        return cb();
      }
      const hasRepet = props.mapStyle.lines
        .getAllStyle()
        .some(([_, config]) => {
          if (config === formData.value) {
            return false;
          }
          return (config as LineConfig).id === value;
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
    mapStyle.lines.registry(TEST_LINE_STYLE_ID, config);
  },
  {
    deep: true,
    immediate: true,
  }
);
watch(
  () => props.lineConfig,
  (config) => {
    formData.value = resolveLineConfig(config);
  }
);

const { load: handleSubmit } = useAsync(async () => {
  const status = await formInstance.value?.validate().catch(() => false);
  if (!status) {
    return;
  }

  if (props.lineConfig) {
    mapStyle.lines.update(
      formData.value.id,
      formData.value,
      props.lineConfig.id
    );
    ElMessage.success("保存成功!");
  } else {
    mapStyle.lines.registry(formData.value.id, formData.value);
    ElMessage.success("创建成功");
    nextTick(() => {
      formData.value = resolveLineConfig();
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
