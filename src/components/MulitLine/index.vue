<template>
  <div v-bind="$attrs" v-for="i in line">{{ i }}</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    content?: string;
    split?: string;
  }>(),
  {
    content: "",
    split: "\n",
  }
);

const line = computed(() => {
  const { content, split } = props;
  if (!content) {
    return [];
  }
  return content.split(split);
});
</script>

<style lang="scss" scoped></style>
