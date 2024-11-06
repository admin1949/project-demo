<template>
  <div class="switch-source-container">
    <div class="source-container" :style="container_style">
      <div
        @click="handle_select_souce(i.id)"
        class="source-item"
        :class="{ active: i.id === activeSourceId }"
        v-for="(i, idx) in sourceList"
        :style="create_source_item_style(i, idx)"
      >
        <span>{{ i.name }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type StyleValue, computed } from "vue";
import { useMap } from "../hooks/useMap";
import { SourceItem } from "../mock";

const { mapSourceControl } = useMap();
const { sourceList, activeSourceId, handleSelectMapSource } = mapSourceControl;

const handle_select_souce = (id: string | number) => {
  handleSelectMapSource(id);
};

const create_source_item_style = (
  item: SourceItem,
  idx: number
): StyleValue => {
  const is_active = activeSourceId.value === item.id;
  return {
    backgroundImage: `url("${item.demo_url}")`,
    right: `calc(var(--width) * ${idx} + var(--margin) * ${idx + 1})`,
    zIndex:
      (is_active ? sourceList.value.length : sourceList.value.length - idx) + 1,
  };
};

const container_style = computed((): StyleValue => {
  return {
    width: `calc(86px + var(--width) * ${
      sourceList.value.length - 1
    } + var(--margin) * ${sourceList.value.length - 1} + var(--margin) * 2)`,
  };
});
</script>

<style lang="scss" scoped>
.switch-source-container {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 2;

  .source-container {
    transition: all ease 0.25s;
    position: relative;
    height: 80px;
    --width: 0px;
    --margin: 10px;

    &:hover {
      background-color: #fff;
      --width: 86px;
    }

    line-height: 0;

    .source-item {
      line-height: 1.4;
      width: 86px;
      height: 60px;
      border-radius: 2px;
      background-size: cover;
      background-position: center;
      border: 1px solid transparent;
      position: absolute;
      cursor: pointer;
      top: var(--margin);
      transition: right ease 0.25s;

      span {
        position: absolute;
        bottom: 0;
        right: 0;
        padding: 2px 4px;
        color: #fff;
        background-color: rgba($color: #000000, $alpha: 0.5);
      }

      &:hover,
      &.active {
        border-color: #3385ff;

        span {
          background-color: #3385ff;
          color: #fff;
        }
      }
    }
  }
}
</style>
