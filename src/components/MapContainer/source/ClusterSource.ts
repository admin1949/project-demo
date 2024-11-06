import Cluster from "ol/source/Cluster";
import type { Options as OriginOptions } from "ol/source/Cluster";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { getMapZoom } from "../utils";

interface Options<T extends Feature> extends OriginOptions<T> {
  maxClusterZoom?: number;
}

const safeCreateCluster = <T extends Geometry>(
  geometry: T,
  features: Feature[]
): Feature<T> => {
  const feature = new Feature<T>();
  feature.set("geometry", geometry, true);
  feature.set("features", features, true);
  return feature;
};

export class ClusterSource<T extends Feature> extends Cluster<T> {
  private maxClusterZoom?: number;

  constructor(opt: Options<T>) {
    opt.createCluster = opt.createCluster || safeCreateCluster;
    super(opt);
    this.maxClusterZoom = opt.maxClusterZoom;
  }

  setMaxClusterZoom(maxClusterZoom: number) {
    this.maxClusterZoom = maxClusterZoom;
    this.refresh();
  }

  cluster() {
    if (this.resolution === undefined || !this.source) {
      return;
    }

    if (
      !this.maxClusterZoom ||
      getMapZoom(this.resolution) < this.maxClusterZoom
    ) {
      super.cluster();
      return;
    }

    const features = this.source.getFeatures();

    for (let i = 0, ii = features.length; i < ii; i++) {
      const feature = features[i];

      const geometry = this.geometryFunction(feature);
      if (!geometry) {
        continue;
      }

      const clusteredFeature = new Feature();
      clusteredFeature.set("geometry", geometry.clone(), true);
      clusteredFeature.set("features", [feature], true);

      this.features.push(clusteredFeature);
    }
  }
}
