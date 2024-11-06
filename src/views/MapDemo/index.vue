<template>
  <div class="w-full h-full flex">
    <div class="w-[200px] h-full box-border p-4">
      <div>
        <ElSwitch v-model="showView" active-text="展示聚合图层"></ElSwitch>
      </div>
      <div v-if="showView">
        <div class="pt-3 pb-1 text-sm text-gray-800">数量：</div>
        <ElSelect v-model="size">
          <ElOption
            v-for="i in sizes"
            :label="i.label + '随机点位'"
            :value="i.value"
            :key="i.value"
          ></ElOption>
        </ElSelect>
        <div class="pt-3 pb-1 text-sm text-gray-800">区域：</div>
        <ElSelect v-model="position">
          <ElOption
            v-for="i in positions"
            :label="i.label"
            :value="i.value"
            :key="i.value"
          ></ElOption>
        </ElSelect>
      </div>
    </div>
    <div class="w-0 h-full flex-1">
      <MapContainer
        :center
        :projection="CRSTypes.GCJ02"
        :controls="['SwitchSource', 'PickCoordinate', 'Distance']"
        :zoom="9"
      >
        <BigDataView v-if="showView" :size :extent></BigDataView>
      </MapContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Point, CRSTypes } from "@/components/MapContainer/utils";
import BigDataView from "./BigDataView.vue";
import { ElOption, ElSelect, ElSwitch } from "element-plus";
const center: Point = [101.86878183672431, 29.635089772822468];

const showView = ref(false);
const sizes = [
  { label: "10w", value: 10_0000 },
  { label: "30w", value: 30_0000 },
  { label: "50w", value: 50_0000 },
  { label: "70w", value: 70_0000 },
  { label: "90w", value: 90_0000 },
  { label: "110w", value: 110_0000 },
  { label: "130w", value: 130_0000 },
  { label: "150w", value: 150_0000 },
  { label: "200w", value: 200_0000 },
];
const size = ref(sizes[1].value);

const positions = [
  {
    label: "区域1",
    value: "1",
    extent: [
      97.39182404319865, 25.403164208518533, 106.34573963024997,
      33.8670153371264,
    ],
  },
  {
    label: "区域2",
    value: "2",
    extent: [
      73.3781713676076, 3.3015909531533647, 134.9273730296193,
      53.62378071497058,
    ],
  },
  { label: "区域3", value: "3", extent: [-180, -90, 180, 90] },
];
const position = ref(positions[0].value);
const extent = computed(() => {
  const code = position.value;
  const item = positions.find((i) => i.value === code);
  return item ? item.extent : [-180, -90, 180, 90];
});
</script>
