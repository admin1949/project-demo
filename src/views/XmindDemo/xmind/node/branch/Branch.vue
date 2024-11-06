<template>
  <div
    ref="autoSizeContainert"
    class="cell-box"
    :class="{
      'last-parent': data.isLastParent,
      'is-freeze': data.freeze,
    }"
  >
    <div
      class="node-content"
      :class="classNames"
      :style="style"
      @dblclick="enterEdit"
    >
      <div
        ref="editContainert"
        class="text-contet"
        @blur="exitEdit"
        :contenteditable="isEdit"
      >
        {{ data.text }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="branch-cell">
import { Cell, Graph } from "@antv/x6";
import {
  useNodeData,
  XmindCellData,
  useEdit,
  useAutoSize,
  useNodeStyle,
} from "@eric/antv-xmind/vue";

const props = defineProps<{
  node: Cell;
  graph: Graph;
}>();
const config = useNodeData<XmindCellData>(props);
const data = config.data;
const { style, className } = useNodeStyle(config);
const classNames = computed(() => {
  const list: string[] = [className.value];
  if (data.value.willCut) {
    list.push("will-cut");
  }
  return list;
});

const { isEdit, enterEdit, exitEdit, editContainert } = useEdit(props);
const { autoSizeContainert } = useAutoSize(props, isEdit);
</script>

<style lang="scss" scoped>
.cell-box {
  &.is-freeze {
    opacity: 0.3;
  }

  &.last-parent {
    border-color: #e9be00 !important;
  }
}
</style>
