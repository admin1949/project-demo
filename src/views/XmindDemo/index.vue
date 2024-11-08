<template>
  <div class="w-full h-full relative flex flex-col">
    <div class="h-0 flex-1 w-full">
      <div class="w-full h-full" ref="container"></div>
    </div>
    <DrewToolbar :config="xmind"></DrewToolbar>
    <InfoToolBar :config="xmind"></InfoToolBar>
  </div>
</template>

<script setup lang="ts">
import { useXmindGraph } from "./xmind/useGraph";
import {
  useEdit,
  useQuestKey,
  useFreeNode,
  useNode,
  useTool,
  useHideChild,
} from "./xmind/tool";
import { Root } from "./xmind/node/topic";
import DrewToolbar from "./components/DrewToolbar.vue";
import InfoToolBar from "./components/InfoToolBar.vue";
import { Branch } from "./xmind/node/branch";
import { XMIND_EVENT } from "@eric/antv-xmind";

const xmind = useXmindGraph();
onMounted(() => {
  const root1 = Root.getTemplate();
  const createChild = () =>
    Array.from({ length: 6 }, (_, idx) => {
      const b = Branch.getTemplate();
      b.data!.text = "分支主题" + (idx + 1);
      return b;
    });
  root1.children = createChild();

  xmind.initGraphData({
    nodes: [root1],
    tools: [],
    edges: [],
  });
  xmind.xmindGraph.once(XMIND_EVENT.ALL_NODE_LAYOUT_END, () => {
    const graph = xmind.xmindGraph.getGraph();
    if (!graph) {
      return;
    }
    graph.centerContent();
  });
});

useQuestKey(xmind);
useEdit(xmind);
useFreeNode(xmind);
useNode(xmind);
useTool(xmind);
useHideChild(xmind);
</script>

<style lang="scss" scoped></style>
