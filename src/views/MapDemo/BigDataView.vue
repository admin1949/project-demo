<template>
  <WorkerClusterAssetslayer
    :data="list"
    :proj="CRSTypes.WM"
    visible
    :z-index="2"
  ></WorkerClusterAssetslayer>
</template>

<script setup lang="ts">
import WorkerClusterAssetslayer from "@/components/MapContainer/layer/WorkerClusterAssetslayer.vue";
import {
  MAP_STYLE_INJECT_KEY,
  MapStyle,
  SourceType,
} from "@/components/MapContainer/MapStyle";
import { resolveIconConfig } from "@/components/MapContainer/MapStyle/Icon";
import { CRSTypes, WithStylePoint } from "@/components/MapContainer/utils";
import { WorkerClient } from "@/worker/util/client";
import testWorkerUrl from "@/worker/testWorker/index?worker&url";
import { Fns } from "@/worker/testWorker/type";
import { useLastAsync } from "@/hooks/useAsync";
import { Extent } from "ol/extent";

const {
  size = 30_0000,
  extent = [
    97.39182404319865, 25.403164208518533, 106.34573963024997, 33.8670153371264,
  ],
} = defineProps<{
  size?: number;
  extent?: Extent;
}>();

const mapStyle = new MapStyle();
mapStyle.icons.registry("xx", resolveIconConfig({}));
provide(MAP_STYLE_INJECT_KEY, mapStyle);

const worker = new WorkerClient<Fns>(testWorkerUrl, {
  name: "test.worker",
});
onUnmounted(() => {
  worker.dispose();
});

const { data: list, load: loadPoints } = useLastAsync(
  (size: number, extent?: Extent) => {
    return worker.callRemote("getRandamPoints", [size, extent]);
  },
  (res) => {
    if (!res) {
      return [];
    }
    const l: WithStylePoint[] = [];
    const type = SourceType.POINT;
    for (let i = 0, j = 0; i < res.length; i += 2) {
      l[j++] = {
        pid: j,
        source: [res[i], res[i + 1]],
        styleId: "xx",
        type,
      };
    }
    return l;
  },
  {
    shallow: true,
  }
);

watchEffect(() => {
  const s = size;
  const e = extent;
  nextTick(() => {
    loadPoints(s, e);
  });
});
</script>

<style lang="scss" scoped></style>
