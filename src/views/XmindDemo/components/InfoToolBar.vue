<template>
  <div
    class="w-full box-border px-4 h-12 bg-white flex justify-between items-center info-tool-box"
  >
    <div class="flex items-center gap-4">
      <div>主题数量：{{ childCount }}</div>
      <div>
        <ElButton type="primary" plain @click="handleExport">导出</ElButton>
        <ElButton @click="showImport = true">导入</ElButton>
      </div>
    </div>

    <div class="flex h-full items-center gap-2">
      <div>
        <ElDropdown split-button type="default">
          <div>{{ selectedCssName }}</div>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem
                :class="{ actived: i.name === selectedCssName }"
                v-for="i in cssList"
                :key="i.name"
                @click="setCssCreater(i)"
              >
                {{ i.name }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>

      <div>
        <ElDropdown split-button type="default">
          <div>{{ selectedLayoutName }}</div>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem
                :class="{ actived: i.name === selectedLayoutName }"
                v-for="i in layoutList"
                :key="i.name"
                @click="setLayout(i)"
              >
                {{ i.name }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>

      <div class="icon" :class="{ disabled: !canMinus }" @click="minusOne">
        <ElIcon>
          <Minus />
        </ElIcon>
      </div>
      <ElDropdown split-button type="default">
        <div>{{ zoom }}%</div>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem
              :class="{ actived: i === zoom }"
              v-for="i in options"
              :key="i"
              @click="zoomTo(i)"
            >
              {{ i }}%
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>

      <div class="icon" :class="{ disabled: !canPlus }" @click="plusOne">
        <ElIcon>
          <Plus />
        </ElIcon>
      </div>

      <div class="icon" @click="handleScaleToOriginal">
        <ElIcon>
          <ScaleToOriginal />
        </ElIcon>
      </div>
    </div>
  </div>
  <ElDialog
    title="导入文件"
    width="600px"
    v-model="showImport"
    :close-on-click-modal="false"
  >
    <ElUpload
      v-model:file-list="fileList"
      ref="uploadIntance"
      drag
      :auto-upload="false"
      @change="onFileChange"
      accept=".x6mind"
      class="drop-upload"
    >
      <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
      <div class="el-upload__text">拖拽文件到此或者<em>点击选择</em></div>
      <template #tip>
        <div class="el-upload__tip">.x6mind 文件</div>
      </template>
    </ElUpload>
    <template #footer>
      <ElButton
        @click="handleSubmit"
        :disabled="!fileList.length"
        type="primary"
        :loading="loading"
        >确定</ElButton
      >
      <ElButton @click="showImport = false">取消</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { XMIND_EVENT, XmindGraph, XmindToolGraph } from "@eric/antv-xmind";
import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
} from "element-plus";
import {
  Plus,
  Minus,
  UploadFilled,
  ScaleToOriginal,
} from "@element-plus/icons-vue";
import { useGraphCss, useGraphLayout } from "../xmind/tool/useGraphStyle";
import { useGraphZoom } from "../xmind/tool/useGraphZoom";
import { useExport, useImport } from "../xmind/tool/useExport";

const { config } = defineProps<{
  config: {
    xmindGraph: XmindGraph;
    xmindToolGraph: XmindToolGraph;
  };
}>();

const {
  options,
  canMinus,
  canPlus,
  plusOne,
  minusOne,
  zoom,
  zoomTo,
  handleScaleToOriginal,
} = useGraphZoom(config);

const childCount = ref(0);
{
  const vnodeTree = config.xmindGraph.getVodeTree();
  if (vnodeTree) {
    config.xmindGraph.setChildCount();
    childCount.value = vnodeTree.totalChildCount;
  }
}

onScopeDispose(
  config.xmindGraph.on(XMIND_EVENT.CHILD_COUNT_CHANGE, (count) => {
    childCount.value = count;
  })
);
const { cssList, selectedCssName, setCssCreater } = useGraphCss(config);
const { layoutList, selectedLayoutName, setLayout } = useGraphLayout(config);
const { handleExport } = useExport(config);

const { fileList, onFileChange, showImport, handleSubmit, loading } =
  useImport(config);
</script>

<style lang="scss" scoped>
.info-tool-box {
  box-shadow: inset 1px 1px 2px 0px rgba(6, 10, 28, 0.3);
}
.icon {
  @apply w-8 h-8 cursor-pointer flex items-center justify-center rounded;

  &:hover {
    @apply bg-gray-200;
  }
  &.disabled {
    @apply cursor-not-allowed;
  }
}
:deep(.el-dropdown-menu__item.actived) {
  background-color: var(--el-dropdown-menuItem-hover-fill);
  color: #873bf4;
}
</style>
