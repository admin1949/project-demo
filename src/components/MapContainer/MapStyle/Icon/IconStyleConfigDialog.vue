<template>
  <ElDialog
    v-model="showDialog"
    title="图标管理"
    append-to-body
    :close-on-click-modal="false"
    width="1200px"
  >
    <div class="with-preview">
      <ElForm
        class="form"
        :model="formData"
        ref="formInstance"
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
        <ElFormItem label="图标地址">
          <ElInput
            v-model="formData.src"
            placeholder="请输入图标地址"
          ></ElInput>
        </ElFormItem>
        <ElFormItem label="图标相对基准位置">
          <ElSelect v-model="formData.anchorOrigin">
            <ElOption label="中心点" value="center"></ElOption>
            <ElOption label="左上角" value="top-left"></ElOption>
            <ElOption label="左下角" value="bottom-left"></ElOption>
            <ElOption label="右上角" value="top-right"></ElOption>
            <ElOption label="右下角" value="bottom-right"></ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem
          label="位置偏移"
          v-show="formData.anchorOrigin !== 'center'"
        >
          <div class="flex-box">
            <div class="flex-item">
              x：
              <ElInputNumber
                :step="0.1"
                v-model="formData.x"
                placeholder="x"
              ></ElInputNumber>
            </div>
            <div class="flex-item">
              y：
              <ElInputNumber
                :step="0.1"
                v-model="formData.y"
                placeholder="y"
              ></ElInputNumber>
            </div>
            <div class="flex-item">
              单位：
              <ElSelect v-model="formData.unit">
                <ElOption
                  value="fraction"
                  label="相对图片大小的比例"
                ></ElOption>
                <ElOption value="pixels" label="像素 px"></ElOption>
              </ElSelect>
            </div>
          </div>
        </ElFormItem>
        <ElFormItem label="图标缩放">
          <ElSelect v-model="formData.sizeModel">
            <ElOption label="缩放" value="scale"></ElOption>
            <ElOption label="指定宽度，高度自适应" value="widthFit"></ElOption>
            <ElOption
              label="指定高度，宽度自适应"
              value="heighthFit"
            ></ElOption>
            <ElOption label="指定宽高，拉伸图片" value="forceScale"></ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="缩放比例" v-if="formData.sizeModel === 'scale'">
          <ElInputNumber
            v-model="formData.scale"
            :step="0.1"
            :min="0"
          ></ElInputNumber>
        </ElFormItem>
        <ElFormItem label="图标大小" v-if="formData.sizeModel !== 'scale'">
          <div class="flex-box">
            <div
              class="flex-item"
              v-show="
                formData.sizeModel === 'widthFit' ||
                formData.sizeModel === 'forceScale'
              "
            >
              宽度：<ElInputNumber
                v-model="formData.width"
                :step="2"
                :min="0"
              ></ElInputNumber>
            </div>
            <div
              class="flex-item"
              v-show="
                formData.sizeModel === 'heighthFit' ||
                formData.sizeModel === 'forceScale'
              "
            >
              高度：<ElInputNumber
                v-model="formData.height"
                :step="2"
                :min="0"
              ></ElInputNumber>
            </div>
          </div>
        </ElFormItem>
        <ElFormItem label="旋转角度">
          <ElInputNumber
            v-model="formData.rotation"
            :step="0.1"
            :min="-2"
            :max="2"
          ></ElInputNumber>
        </ElFormItem>
        <ElFormItem label="不透明度">
          <ElInputNumber
            v-model="formData.opacity"
            :step="0.1"
            :min="0"
            :max="1"
          ></ElInputNumber>
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
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElSelect,
  ElText,
  ElIcon,
  ElButton,
  ElMessage,
  FormInstance,
  FormRules,
} from "element-plus";
import { useDialog } from "@/hooks/useDialog";
import { nextTick, ref, watch } from "vue";
import Map from "../../index.vue";
import { CRSTypes, Point, SourceType, WithStylePoint } from "../../utils";
import StaticPointIconLayer from "../../layer/StaticAssetsLayer.vue";
import { MapStyle } from "../index";
import { InfoFilled } from "@element-plus/icons-vue";
import { IconConfig, TEST_ICON_STYLE_ID, resolveIconConfig } from "./index";
import { useAsync } from "@/hooks/useAsync";

const props = defineProps<{
  visible: boolean;
  iconConfig?: IconConfig;
  mapStyle: MapStyle;
}>();

defineEmits<{
  (event: "update:visible", val: boolean): void;
}>();

const { showDialog, closeDialog } = useDialog(props, "visible", "图标配置");
const { mapStyle } = props;

const demoPoint: Point = [122.62952601015279, 30.849515386098748];

const testData: WithStylePoint[] = [
  {
    type: SourceType.POINT,
    styleId: TEST_ICON_STYLE_ID,
    source: demoPoint,
  },
  {
    type: SourceType.POINT,
    styleId: "default",
    source: demoPoint,
  },
];

const formData = ref(resolveIconConfig(props.iconConfig));
const formInstance = ref<FormInstance>();
const rules: FormRules = {
  id: {
    required: true,
    validator: (_, value: string, cb) => {
      if (!value) {
        return cb("图标全局唯一id不能为空！");
      }
      if (value === props.iconConfig?.id) {
        return cb();
      }
      const hasRepet = props.mapStyle.icons
        .getAllStyle()
        .some(([_, config]) => {
          if (config === formData.value) {
            return false;
          }
          return (config as IconConfig).id === value;
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
    mapStyle.icons.registry(TEST_ICON_STYLE_ID, config);
  },
  { immediate: true, deep: true }
);

watch(
  () => props.iconConfig,
  (config) => {
    formData.value = resolveIconConfig(config);
  }
);

const { load: handleSubmit } = useAsync(async () => {
  const status = await formInstance.value?.validate().catch(() => false);
  console.log(status);
  if (!status) {
    return;
  }

  if (props.iconConfig) {
    mapStyle.icons.update(
      formData.value.id,
      formData.value,
      props.iconConfig.id
    );
    ElMessage.success("保存成功!");
  } else {
    mapStyle.icons.registry(formData.value.id, formData.value);
    ElMessage.success("创建成功");
    nextTick(() => {
      formData.value = resolveIconConfig();
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
