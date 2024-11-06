<template>
  <div class="cell-box" ref="autoSizeContainert">
    <div
      class="node-content"
      :class="className"
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

<script lang="ts" setup name="summery-tool">
import { Cell, Graph } from "@antv/x6";
import {
  useNodeData,
  XmindToolData,
  useEdit,
  useAutoSize,
  useNodeStyle,
} from "@eric/antv-xmind/vue";

const props = defineProps<{
  node: Cell;
  graph: Graph;
}>();

const config = useNodeData<XmindToolData>(props);
const data = config.data;
const { enterEdit, editContainert, isEdit, exitEdit } = useEdit(props);
const { autoSizeContainert } = useAutoSize(props);
const { style, className } = useNodeStyle(config);
</script>
