<template>
  <div class="ol-control pick-coordinate">
    <button @click="isActive = !isActive">
      <ElIcon :size="16">
        <LocationInformation v-if="!isActive" />
        <Pointer v-else />
      </ElIcon>
    </button>
    <Overlay
      v-if="isActivePoint"
      :position="activePoint"
      positioning="bottom-center"
      :proj="CRSTypes.WM"
      :offset="[0, -10]"
    >
      <div class="ol-tooltip-measure">
        <div class="title-box">
          <div class="title">点位信息</div>
          <ElIcon
            @click="isActivePoint = false"
            :size="20"
            class="close"
            title="关闭"
          >
            <Close></Close>
          </ElIcon>
        </div>
        <div class="content">
          <div class="li">
            3857坐标系: <span>{{ activePoint.join(",") }}</span>
          </div>
          <div class="li">
            84坐标系:
            <span>{{
              transform(activePoint, CRSTypes.WM, CRSTypes.WGS84).join()
            }}</span>
          </div>
          <div class="li">
            百度经纬度:
            <span>{{
              transform(activePoint, CRSTypes.WM, CRSTypes.BD09LL).join()
            }}</span>
          </div>
          <div class="li">
            高德经纬度:
            <span>{{
              transform(activePoint, CRSTypes.WM, CRSTypes.GCJ02).join()
            }}</span>
          </div>
        </div>
      </div>
    </Overlay>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMap } from "../hooks/useMap";
import Overlay from "../layer/Overlay.vue";
import { CRSTypes, Point, transform } from "../utils";
import { ElIcon } from "element-plus";
import { Pointer, LocationInformation, Close } from "@element-plus/icons-vue";

const { afterMapReady } = useMap();
const isActive = ref(false);

// const point = ref<Point>([0, 0]);
const activePoint = ref<Point>([0, 0]);
const isActivePoint = ref(false);

afterMapReady(({ map }) => {
  // const e1 = map.on("pointermove", (e) => {
  //   if (!isActive.value) {
  //     return;
  //   }
  //   point.value = e.coordinate as Point;
  // });
  const e2 = map.on("click", (e) => {
    if (e.dragging) {
      return;
    }
    if (!isActive.value) {
      return;
    }

    isActivePoint.value = true;
    activePoint.value = e.coordinate as Point;
  });
  return [e2];
});
</script>

<style lang="scss" scoped>
.pick-coordinate {
  position: absolute;
  top: 68px;
  right: 0.5em;
  z-index: 2;
  .icon {
    width: 16px;
    height: auto;
  }
}

.ol-tooltip-measure {
  position: relative;
  background: #fff;
  color: #333;
  opacity: 0.7;
  white-space: nowrap;
  font-size: 12px;
  cursor: default;
  opacity: 1;
  font-weight: bold;
  border: 1px solid #999;
  &:before {
    border-top: 6px solid #fff;
    border-right: 6px solid transparent;
    border-left: 6px solid transparent;
    content: "";
    position: absolute;
    bottom: -6px;
    margin-left: -7px;
    left: 50%;
    z-index: 2;
  }
  &::after {
    border-top: 7px solid #999;
    border-right: 7px solid transparent;
    border-left: 7px solid transparent;
    content: "";
    position: absolute;
    bottom: -7px;
    margin-left: -8px;
    left: 50%;
    z-index: 1;
  }
  & > .title-box {
    min-width: 200px;
    font-size: 16px;
    color: #333;
    background-color: #f0f0f0;
    padding: 0.5em 1em;
    display: flex;
    align-items: center;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    .close {
      width: 20px;
      height: auto;
      cursor: pointer;
    }
  }
  & > .content {
    padding: 8px 16px;
    font-size: 14px;
    .li {
      padding-bottom: 4px;
      &:last-of-type {
        padding-bottom: 0;
      }
    }
  }
}
</style>
