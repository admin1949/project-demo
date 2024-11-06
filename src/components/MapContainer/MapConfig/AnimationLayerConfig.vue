<template>
  <div>
    <ElButton>轨迹动画</ElButton>
    <ElDialog v-model="showDialog" title="显示轨迹动画" width="1200px">
      <ElForm label-width="120px" label-suffix="：">
        <ElFormItem label="数据坐标系">
          <ElSelect placeholder="请选择数据坐标系" v-model="formData.proj">
            <ElOption :value="CRSTypes.BD09LL" label="百度坐标系"></ElOption>
            <ElOption :value="CRSTypes.WGS84" label="WGS84坐标系"></ElOption>
            <ElOption :value="CRSTypes.GCJ02" label="国测局02坐标系"></ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="动画时长">
          <ElInputNumber v-model="formData.time" :min="1"></ElInputNumber>
        </ElFormItem>
        <ElFormItem>
          <ElButton @click="closeDialog">取消</ElButton>
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
  ElInputNumber,
  ElSelect,
  ElOption,
} from "element-plus";
import { CRSTypes } from "gcoord";
import { ref } from "vue";

interface AnimationConfig {
  time: number;
  visible: boolean;
  proj: CRSTypes.BD09LL;
}

defineProps<{
  config: AnimationConfig;
}>();

const showDialog = ref(false);
const closeDialog = () => (showDialog.value = false);
const formData = ref({
  time: 10,
  visible: true,
  proj: CRSTypes.BD09LL,
});
</script>

<style scoped></style>
