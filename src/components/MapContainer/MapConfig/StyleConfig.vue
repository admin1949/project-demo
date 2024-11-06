<template>
  <div>
    <ElButton @click="showDialog = true">样式配置</ElButton>
    <ElDialog
      v-model="showDialog"
      title="样式管理"
      append-to-body
      :close-on-click-modal="false"
      width="1200px"
    >
      <StyleManager :map-style="mapStyle"></StyleManager>
      <div class="btns">
        <ElButton type="primary" plain @click="closeDialog">关闭</ElButton>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ElButton, ElDialog } from "element-plus";
import StyleManager from "../MapStyle/StyleManager.vue";
import { MapStyle } from "../MapStyle/index.js";
import { ref } from "vue";

defineProps<{
  mapStyle: MapStyle;
}>();

defineEmits<{
  (event: "update:visible", val: boolean): void;
}>();
const showDialog = ref(false);
const closeDialog = () => (showDialog.value = false);
</script>

<style lang="scss" scoped>
.btns {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  width: 100%;
}
</style>
