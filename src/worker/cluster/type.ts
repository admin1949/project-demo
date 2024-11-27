import type { Extent } from "ol/extent";
import type { ServerMethods, TransferRes } from "t-worker";

export type ClusterMethods = ServerMethods<
  {
    addFeaturesInternal(f: Float64Array): void;
    
    cluster(
      distance: number,
      ratio: number
    ): TransferRes<{
      ids: Uint32Array;
      extents: Float64Array;
    }>;

    getFeaturesInExtent(
      extent: Extent,
      isTotal: boolean
    ): TransferRes<Uint32Array>;
  }
>;
