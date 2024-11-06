import { WorkerClient } from "@/worker/util/client";
import { ClusterMethods } from "@/worker/cluster/type";
import { getUid } from "ol";
import type { Extent } from "ol/extent";
import RenderFeature from "ol/render/Feature";
import { Vector as VectorSource } from "ol/source";
import clusterWorkerHerf from "@/worker/cluster?worker&url";
import type { AttributionLike } from "ol/source/Source";

export interface Options {
  wrapX?: boolean;
  attributions?: AttributionLike;
  minResolution?: number;
  distance?: number;
  minDistance: number;
}

export class ClusterSource extends VectorSource<RenderFeature> {
  resolution?: number;
  minResolution: number;
  distance: number;
  minDistance: number;
  interpolationRatio = 0;

  protected totalFeatures: RenderFeature[] = [];
  protected featuresMap = new Map<string | number, RenderFeature>();
  protected clusterMap = new Map<string | number, RenderFeature>();
  protected features: RenderFeature[] = [];

  protected remoteAddFeaturesInternal: (
    list: Float64Array
  ) => Promise<void | "cancle">;

  protected remoteCluster: (
    mapDistance: number,
    interpolationRatio: number
  ) => Promise<"cancle" | { ids: Uint32Array; extents: Float64Array }>;

  private worker: WorkerClient<ClusterMethods>;

  constructor(options: Options) {
    super({
      attributions: options.attributions,
      wrapX: options.wrapX ?? true,
    });

    this.worker = new WorkerClient<ClusterMethods>(clusterWorkerHerf, {
      name: "cluster.worker",
    });

    this.minResolution = options.minResolution || 0;
    this.minDistance = options.minDistance || 0;
    this.distance = options.distance || 0;

    this.remoteAddFeaturesInternal = lastAsyncFn((list: Float64Array) => {
      return this.worker.callRemote(
        "addFeaturesInternal",
        [list],
        [list.buffer]
      );
    });

    this.remoteCluster = lastAsyncFn(
      (mapDistance: number, interpolationRatio: number) => {
        return this.worker.callRemote("cluster", [
          mapDistance,
          interpolationRatio,
        ]);
      }
    );
  }

  setDistance(distance: number) {
    this.updateDistance(distance, this.minDistance);
  }

  setMinDistance(minDistance: number) {
    this.updateDistance(this.distance, minDistance);
  }

  getMinDistance() {
    return this.minDistance;
  }

  updateDistance(distance: number, minDistance: number) {
    const ratio =
      distance === 0 ? 0 : Math.min(minDistance, distance) / distance;
    const changed =
      distance !== this.distance || this.interpolationRatio !== ratio;
    this.distance = distance;
    this.minDistance = minDistance;
    this.interpolationRatio = ratio;
    if (changed) {
      this.refresh();
    }
  }

  async refresh() {
    const status = await this.clusterAsync();
    if (!status) {
      return;
    }
    this.clear(true);
    this.addFeatures(this.features);
  }

  private async clusterAsync() {
    const {
      resolution,
      minResolution = 0,
      distance,
      interpolationRatio,
    } = this;

    if (resolution === undefined) {
      return false;
    }

    if (minResolution > resolution) {
      if (this.features === this.totalFeatures) {
        return false;
      }

      this.clusterMap = this.featuresMap;
      this.features = this.totalFeatures;
      return true;
    }

    const mapDistance = distance * resolution;
    const res = await this.remoteCluster(mapDistance, interpolationRatio);
    if (res === "cancle") {
      return false;
    }

    const clusterMap = new Map<number, RenderFeature>();
    const currentFeatures: RenderFeature[] = [];

    const { ids, extents } = res;

    // 数据结构 4个数字表示一个集合，第 0 位表示有多少个点位数据, 第一位表示Id, 第2, 3 位表示集合的坐标点
    let count = 0;
    for (let i = 0; i < extents.length; i += 4) {
      // const childFeatures: (number | string)[] = [];
      const num = extents[i];
      const id = extents[i + 1];

      if (num === 1) {
        const sid = ids[count];
        const f = this.featuresMap.get(sid);
        if (f) {
          clusterMap.set(id, f!);
          currentFeatures.push(f!);
        }
      } else if (num > 1) {
        const childs = ids.slice(count, count + num);
        const point = [extents[i + 2], extents[i + 3]];
        const cluster = new RenderFeature(
          "Point",
          point,
          point,
          2,
          {
            features: childs,
          },
          id
        );
        clusterMap.set(id, cluster);
        currentFeatures.push(cluster);
      }

      count += num;
    }
    this.clusterMap = clusterMap;
    this.features = currentFeatures;
    return true;
  }

  async updateFeatures(features: RenderFeature[]) {
    const map = new Map<string | number, RenderFeature>();
    const totalFeatures: RenderFeature[] = [];
    const list = [];

    for (let i = 0; i < features.length; i++) {
      const item = features[i];

      let id = Number(getUid(item));
      if (Number.isNaN(id)) {
        continue;
      }
      const clone = item;
      // clone.getProperties().features = [item];
      list.push(id, ...item.getFlatCoordinates());
      totalFeatures.push(clone);
      map.set(id, item);
    }

    this.featuresMap = map;
    this.totalFeatures = totalFeatures;
    const res = await this.remoteAddFeaturesInternal(Float64Array.from(list));
    if (res === "cancle") {
      return;
    }
    this.refresh();
  }

  loadFeatures(_extent: Extent, resolution: number): void {
    if (resolution !== this.resolution) {
      this.resolution = resolution;
      this.refresh();
    }
  }

  getOverlaps() {
    return true;
  }

  dispose(): void {
    this.worker.dispose();
    this.featuresMap.clear();
    this.totalFeatures.length = 0;
    this.features.length = 0;
    super.clear(true);
    super.dispose();
  }
}

const lastAsyncFn = <T, A extends unknown[]>(
  fn: (...args: A) => T | Promise<T>
) => {
  let id = 0;
  return async (...args: A) => {
    const sid = ++id;
    try {
      const data = await fn(...args);
      if (sid !== id) {
        return "cancle";
      }
      return data;
    } catch (err) {
      return "cancle";
    }
  };
};
