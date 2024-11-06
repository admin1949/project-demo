<template>
  <div class="heat-map-control" v-if="config.visible">
    <div class="heat-map-player" v-if="false">
      <div class="player-control">
        <!-- <ElIcon
          class="control-item"
          @click="upFrame"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
          size="18"
        >
          <DArrowLeft></DArrowLeft>
        </ElIcon> -->
        <div class="icon-box">
          <svg-icon
            class="up"
            iconClass="btn-paly-backward"
            @click="upFrame"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
          ></svg-icon>
        </div>

        <ElIcon class="control-item" @click="togglePlayHeatMap" size="32">
          <div class="icon-box" v-if="player">
            <svg-icon
              iconClass="btn-stop"
              style="
                color: #4b7efa;
                width: 30px !important;
                height: 30px !important;
              "
            ></svg-icon>
          </div>
          <div class="icon-box" v-else>
            <svg-icon
              iconClass="btn-play"
              class="play"
              style="padding-left: 5px"
            ></svg-icon>
          </div>
          <!-- <VideoPlay ></VideoPlay> -->
        </ElIcon>
        <div class="icon-box">
          <svg-icon
            class="down"
            iconClass="btn-paly-forward"
            @click="downFrame"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
          ></svg-icon>
        </div>

        <!-- <ElIcon
          class="control-item"
          @click="downFrame"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
          size="18"
        >
          <DArrowRight></DArrowRight>
        </ElIcon> -->
      </div>
      <ElSlider
        class="slider"
        v-model="index"
        :min="0"
        :max="config.source.list.length"
        :marks="sliderMarks"
        :format-tooltip="formatTooltip"
        @input="sliderInput"
      />
      <div class="heat-map-type">
        <div class="cumulative-content">
          <ElRadioGroup
            v-model="heatCumulative"
            @change="handleChangeCumulative"
          >
            <ElRadio :label="false">热力不累加</ElRadio>
            <ElRadio :label="true">热力累加</ElRadio>
          </ElRadioGroup>
        </div>
      </div>
      <!-- <div class="reset-btn" @click="resetMapHeat">重置</div> -->
    </div>
    <HeatMap
      :data="heatMapData"
      :proj="config.source.proj"
      :radius="config.radius"
      :blur="config.blur"
      :gradient="config.gradient"
    ></HeatMap>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import HeatMap from "../layer/HeatMap.vue";
import { ElSlider, ElIcon, ElRadioGroup, ElRadio } from "element-plus";
import { HeatMapConfig } from "../utils";

const props = defineProps<{
  config: HeatMapConfig;
}>();

const source = computed(() => props.config.source.list);
const TIME_OUT = 1000;
const index = ref(0);
const heatCumulative = ref(true);
const sliderMarks = computed(() => {
  return Object.fromEntries(
    source.value.reduce((arr, item, idx) => {
      if (item.mark) {
        arr.push([idx + 1, item.mark]);
      }
      return arr;
    }, [] as [number, string][])
  );
});

const heatMapData = computed(() => {
  const idx = index.value - 1;
  const item = props.config.source.list[idx];
  if (!item) {
    return [];
  }

  if (!heatCumulative.value) {
    return item.list;
  }

  const dataMap = new Map<
    string,
    {
      lng: number;
      lat: number;
      weight: number;
    }
  >();

  source.value.slice(0, idx + 2).forEach((item) => {
    item.list.forEach((i) => {
      const key = `${i.lng},${i.lat}`;
      const info = dataMap.get(key);
      if (info) {
        info.weight += i.weight ?? 1;
        return;
      }

      dataMap.set(key, {
        lng: i.lng,
        lat: i.lat,
        weight: i.weight ?? 1,
      });
    });
  });

  return [...dataMap.entries()].map((item) => item[1]);
});

const formatTooltip = (idx: number) => {
  if (idx === 0) {
    return "开始";
  }
  const item = source.value[idx - 1];
  if (!item) {
    return "";
  }

  return item.mark || item.label;
};

const sliderInput = () => {};

const handleChangeCumulative = () => {
  console.log(heatCumulative.value);
};

const player = ref(false);
let timer: NodeJS.Timeout | null = null;
const clearTimer = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};
const autoDoNext = () => {
  if (index.value >= source.value.length) {
    player.value = false;
    return;
  }
  index.value += 1;
  timer = setTimeout(autoDoNext, TIME_OUT);
};

const togglePlayHeatMap = () => {
  if (player.value) {
    player.value = false;
    clearTimer();
    return;
  }
  if (index.value >= source.value.length) {
    return;
  }
  index.value += 1;
  clearTimer();
  timer = setTimeout(autoDoNext, TIME_OUT);
  player.value = !player.value;
};

// const resetMapHeat = () => {
//   player.value = false;
//   index.value = 0;
//   clearTimer();
// };

const upFrame = () => {
  clearTimer();
  if (index.value > 0) {
    index.value -= 1;
  }
};
const downFrame = () => {
  clearTimer();
  if (index.value < source.value.length) {
    index.value += 1;
  }
};
let lastStatus = player.value;
const handleMouseEnter = () => {
  clearTimer();
  lastStatus = player.value;
  player.value = false;
};
const handleMouseLeave = () => {
  player.value = lastStatus;
  lastStatus = false;
  if (player.value) {
    timer = setTimeout(autoDoNext, TIME_OUT);
  }
};
onUnmounted(() => {
  clearTimer();
});

watch(
  () => source.value,
  () => {
    clearTimer();
    index.value = 0;
    player.value = false;
  }
);
</script>

<style scoped lang="scss">
.heat-map-control {
  position: fixed;
  z-index: 1;
  left: 56%;
  transform: translateX(-50%);
  bottom: 0px;
  display: flex;
  pointer-events: initial;

  .reset-btn {
    display: flex;
    width: 70px;
    height: 100%;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    cursor: pointer;
  }

  .heat-map-player {
    width: 790px;
    height: 63px;
    box-sizing: border-box;
    // border-radius: 4px;
    // padding: 5px 20px;
    // background-color: var(--theme-bg);
    background-image: url(../../../assets//images/GlobalOverview/bg-play.svg);
    display: flex;
    justify-content: space-around;
    // gap: 20px;
    align-items: center;

    .player-control {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-left: 70px;

      .control-item {
        cursor: pointer;
        color: #fff;
      }

      .svg-icon {
        width: 15px;
        height: 15px;
      }
    }

    .slider {
      width: 350px;
      padding: 0 20px;
      margin-top: -12px;

      :deep(.el-slider__marks) {
        margin-top: 3px;
      }

      :deep(.el-slider__marks-text) {
        color: #fff;
        font-size: 12px;
        margin-top: 12px;
        word-break: keep-all;
        width: max-content;
      }

      :deep(.el-slider__button) {
        border: solid 2px var(--cad-card-dark);
      }

      :deep(.el-slider__bar) {
        background: var(--cad-card-dark);
      }
    }
  }

  .heat-map-type {
    padding-right: 70px;

    :deep(.el-radio__inner) {
      border-color: var(--cad-card-dark) !important;
      background: var(--cad-bg-color-dark-blue) !important;
    }

    :deep(.el-checkbox__inner) {
      background: var(--cad-bg-color-dark-blue);
    }
  }

  .cumulative-content {
    width: 80px;

    :deep() {
      .el-radio__label {
        color: #fff !important;
      }

      .el-radio {
        display: block;
        height: 20px;
        line-height: 20px;
        margin: 0;
      }

      .el-radio__label {
        font-size: 12px;
      }
    }
  }
}

.icon-box {
  width: 31px;
  height: 31px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  // margin: auto;
  align-items: center;
  justify-content: center;

  .svg-icon {
    width: 16px !important;
    height: 18px !important;
  }
}
</style>
