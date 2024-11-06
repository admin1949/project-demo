<template>
  <div class="ol-control switch-center">
    <button @click="showDialog = true">
      <svg class="icon" viewBox="0 0 1024 1024">
        <path
          fill="currentColor"
          d="M288 896h448q32 0 32 32t-32 32H288q-32 0-32-32t32-32z"
        ></path>
        <path
          fill="currentColor"
          d="M800 416a288 288 0 1 0-576 0c0 118.144 94.528 272.128 288 456.576C705.472 688.128 800 534.144 800 416zM512 960C277.312 746.688 160 565.312 160 416a352 352 0 0 1 704 0c0 149.312-117.312 330.688-352 544z"
        ></path>
        <path
          fill="currentColor"
          d="M512 512a96 96 0 1 0 0-192 96 96 0 0 0 0 192zm0 64a160 160 0 1 1 0-320 160 160 0 0 1 0 320z"
        ></path>
      </svg>
    </button>
    <ElDialog
      append-to-body
      v-model="showDialog"
      :close-on-click-modal="false"
      title="设置地图中心点"
    >
      <ElForm
        label-suffix="："
        ref="formInstance"
        label-width="120px"
        :model="formData"
        :rules="rules"
      >
        <ElFormItem label="中心点" prop="center">
          <ElInput
            v-model="formData.center"
            :formatter="parsePointString"
            :parser="parsePointString"
          >
            <template #prepend>
              <ElSelect v-model="formData.proj">
                <ElOption
                  :value="CRSTypes.BD09LL"
                  label="百度经纬度"
                ></ElOption>
                <ElOption
                  :value="CRSTypes.WGS84"
                  label="WGS84坐标系"
                ></ElOption>
                <ElOption
                  :value="CRSTypes.GCJ02"
                  label="国测局02坐标系"
                ></ElOption>
              </ElSelect>
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" plain @click="handleSubmit">确定</ElButton>
          <ElButton plain @click="handleCancle">取消</ElButton>
        </ElFormItem>
      </ElForm>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElSelect,
  FormInstance,
  FormRules,
} from "element-plus";
import { ref } from "vue";
import { useMap } from "../hooks/useMap";
import { CRSTypes, parsePointString, Point, transform } from "../utils";
import { useAsync } from "@/hooks/useAsync";

const { mapInstance } = useMap();
const showDialog = ref(false);

const rules: FormRules = {
  center: [
    {
      required: true,
      validator: (_rule, value: string, cb) => {
        const point = value?.split(", ").map(Number);
        if (point.length !== 2 || point.some((i) => Number.isNaN(i))) {
          return cb("请填写正确的地图中心点，如 121, 29");
        }
        cb();
      },
    },
  ],
};
const createEmptyFormData = () => {
  return {
    proj: CRSTypes.BD09LL,
    center: "",
  };
};

const formData = ref(createEmptyFormData());
const formInstance = ref<FormInstance>();
const { load: handleSubmit } = useAsync(async () => {
  const validate = await formInstance.value?.validate();
  if (!validate) {
    return;
  }
  const point = formData.value.center.split(", ").map(Number) as Point;
  const view = mapInstance.value?.map.getView();
  if (!view) {
    return;
  }
  view.setCenter(transform(point, formData.value.proj, CRSTypes.WGS84));
});

const handleCancle = () => {
  showDialog.value = false;
};
</script>

<style scoped lang="scss">
.switch-center {
  position: absolute;
  top: 98px;
  right: 0.5em;
  z-index: 2;
  .icon {
    width: 16px;
    height: auto;
  }
}
</style>
