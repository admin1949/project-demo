<template>
  <div class="drew-toolbar">
    <div
      class="title"
      :class="{
        fold: fold,
      }"
    >
      <div class="break-btn" @click="autoBreak()">
        <ElIcon>
          <IconCanvas v-if="fold"></IconCanvas>
          <ArrowLeft v-else></ArrowLeft>
        </ElIcon>
      </div>
      <div v-if="fold" class="arrow-right" @click="autoBreak()">
        <ElIcon>
          <ArrowRight></ArrowRight>
        </ElIcon>
      </div>
      <span v-else>工具</span>
    </div>
    <ul v-if="!fold">
      <li
        :class="[item.operation ? '' : 'cursor-not-allowed']"
        v-for="item in drewTools"
        :key="item.type"
        @click="drewToolHandle(item)"
      >
        <ElIcon>
          <component :is="item.icon"></component>
        </ElIcon>
        <p>{{ item.content }}</p>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useTool } from "../xmind/tool";
import { useX6Graph } from "../xmind/tool/useX6Graph";
import { XmindGraph, XmindToolGraph } from "@eric/antv-xmind";
import { useToolList } from "./tool";
import { ElIcon } from "element-plus";
import { ArrowRight, ArrowLeft } from "@element-plus/icons-vue";
import IconCanvas from "@/assets/svg/icon-canvas.svg?component";

const fold = ref(false);
const autoBreak = () => {
  fold.value = !fold.value;
};
const getActiveSheetLock = () => false;

const props = defineProps<{
  config: {
    xmindGraph: XmindGraph;
    xmindToolGraph: XmindToolGraph;
  };
}>();
const {
  addChild,
  addSiblings,
  addOuterGroup,
  addOutLine,
  removeCell,
  historyControl,
  toggleLineMode,
  addRoot,
} = useTool(props.config);

useX6Graph(props.config, (graph) => {
  if (!graph) {
    return;
  }
  graph.bindKey(["command+z", "ctrl+z"], (e) => {
    const lock = getActiveSheetLock();
    if (lock) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    // getHistoryInfo("BACKOFF");
  });
  graph.bindKey(["command+y", "ctrl+y"], (e) => {
    const lock = getActiveSheetLock();
    if (lock) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    // getHistoryInfo("FORWARD");
  });
});
const { drewTools } = useToolList();

const drewToolHandle = (item: { type: string }) => {
  let lock = false;
  if (lock) {
    return;
  }
  let { type } = item;
  switch (type) {
    case "BACKOFF":
      historyControl("BACKOFF");
      break;
    case "FORWARD":
      historyControl("FORWARD");
      break;
    case "CREATE_ROOT":
      addRoot();
      break;
    case "CHILDREN":
      addChild();
      break;
    case "SIBLING":
      addSiblings();
      break;
    case "CONNECTLINE":
      toggleLineMode();
      break;
    case "OUTERFRAME":
      addOuterGroup();
      break;
    case "OUTLINE":
      addOutLine();
      break;
    case "REMARK":
      break;
    case "DELETE":
      removeCell();
      break;
    default:
      break;
  }
};
</script>
<style lang="scss" scoped>
.drew-toolbar {
  width: 60px;
  background-color: rgba(255, 255, 255, 0.8);
  position: absolute;
  z-index: 0;
  top: 15px;
  left: 15px;
  box-shadow: 0px 2px 4px 0px rgba(6, 10, 28, 0.3);
  border-radius: 3px;
  .title {
    padding: 4px 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &.fold {
      height: 46px;
      align-items: center;
      padding: 0 4px 0 10px;
      .break-btn {
        .svg-icon {
          width: 18px;
          height: 16px;
        }
      }
      .arrow-right {
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        .btn-arrow-right {
          width: 5px;
          height: 10px;
          cursor: pointer;
        }
      }
    }
    .break-btn {
      width: 20px;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      .svg-icon {
        width: 12px;
        height: 12px;
      }
    }
    span {
      font-size: 12px;
    }
  }
  ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0 4px 4px;
    li {
      box-sizing: border-box;
      padding: 2px;
      width: 52px;
      height: 52px;
      text-align: center;
      margin-bottom: 6px;
      cursor: pointer;
      &:last-child {
        margin-bottom: 0;
      }
      &.cursor-not-allowed {
        cursor: not-allowed;
      }
      .svg-icon {
        width: 24px;
      }
      p {
        font-size: 12px;
      }
    }
  }
}
</style>
