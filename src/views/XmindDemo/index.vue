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

const xmind = useXmindGraph();
onMounted(() => {
  xmind.initGraphData({
    nodes: [Root.getTemplate()],
    tools: [],
    edges: [],
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
