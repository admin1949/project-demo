import type { Extent } from "ol/extent";
import type { ServerMethods, PerformanceResult } from "../util/type";

export type ClusterMethods = ServerMethods<
  {
    addFeaturesInternal(f: Float64Array): void;
  },
  {
    cluster(
      distance: number,
      ratio: number
    ): PerformanceResult<{
      ids: Uint32Array;
      extents: Float64Array;
    }>;

    getFeaturesInExtent(
      extent: Extent,
      isTotal: boolean
    ): PerformanceResult<Uint32Array>;
  }
>;
