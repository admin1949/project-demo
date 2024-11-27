import RBush from "ol/structs/RBush";
import { Point } from "ol/geom";
import {
  Extent,
  buffer,
  createEmpty,
  createOrUpdateFromCoordinate,
  getCenter,
} from "ol/extent";
import { WorkerServices, createTransferRes } from "t-worker";
import { add as addCoordinate, scale as scaleCoordinate } from "ol/coordinate";
import { ClusterMethods } from "./type";

let id = 0;
const getId = () => id++;

type SimpleFeature = [id: number, lng: number, lat: number];
class RemoteVectorSource {
  featuresRtree = new RBush<SimpleFeature>();
  clusterRtree = new RBush<SimpleFeature>();

  addFeaturesInternal(arr: Float64Array) {
    const extents: Extent[] = [];
    const geometryFeatures: SimpleFeature[] = [];
    this.featuresRtree.clear();

    for (let i = 0; i < arr.length; i += 3) {
      const id = arr[i + 0],
        lng = arr[i + 1],
        lat = arr[i + 2];
      const geometry = new Point([arr[i + 1], arr[i + 2]]);
      const extent = geometry.getExtent();

      const feature: SimpleFeature = [id, lng, lat];
      geometryFeatures.push(feature);
      extents.push(extent);
    }

    this.featuresRtree.load(extents, geometryFeatures);
  }

  getFeaturesInExtent(extent: Extent) {
    return this.featuresRtree.getInExtent(extent);
  }

  getFeaturesInExtentList(
    extent: Extent,
    isTotal: boolean
  ) {
    const tree = isTotal ? this.featuresRtree : this.clusterRtree;

    const list = tree.getInExtent(extent);
    const res = Uint32Array.from(list.map((i) => i[0]));
    return createTransferRes(res, [res.buffer]);;
  }

  cluster(
    mapDistance: number,
    interpolationRatio: number
  ) {
    const clustered = new Set<number>();
    const extent = createEmpty();

    const features = this.featuresRtree.getAll();

    const idArr = new Uint32Array(features.length);
    let idIdx = 0;

    const extentList: number[] = [];

    const clusterSimpleFeatures: SimpleFeature[] = [];
    const clusterExtets: Extent[] = [];
    for (let i = 0, ii = features.length; i < ii; i++) {
      const [id, lng, lat] = features[i];

      if (clustered.has(id)) {
        continue;
      }

      createOrUpdateFromCoordinate([lng, lat], extent);
      buffer(extent, mapDistance, extent);

      const neighbors = this.getFeaturesInExtent(extent).filter((neighbor) => {
        const nid = neighbor[0];
        if (clustered.has(nid)) {
          return;
        }
        clustered.add(nid);
        idArr[idIdx++] = nid;
        return true;
      });

      if (neighbors.length <= 0) {
        continue;
      }
      const center = this.createClusterPosition(
        neighbors,
        extent,
        interpolationRatio
      );
      const cid = getId();
      extentList.push(neighbors.length, cid, ...center);
      clusterSimpleFeatures.push([cid, center[0], center[1]]);
      clusterExtets.push(extent.slice());
    }

    const extents = Float64Array.from(extentList);
    this.clusterRtree.clear();
    this.clusterRtree.load(clusterExtets, clusterSimpleFeatures);

    return createTransferRes({
      ids: idArr,
      extents,
    }, [idArr.buffer, extents.buffer]);
  }

  createClusterPosition(
    features: SimpleFeature[],
    extent: Extent,
    interpolationRatio: number
  ) {
    const centroid = [0, 0];
    for (let i = features.length - 1; i >= 0; --i) {
      addCoordinate(centroid, [features[i][1], features[i][2]]);
    }
    scaleCoordinate(centroid, 1 / features.length);
    const searchCenter = getCenter(extent);
    const ratio = interpolationRatio;
    return [
      centroid[0] * (1 - ratio) + searchCenter[0] * ratio,
      centroid[1] * (1 - ratio) + searchCenter[1] * ratio,
    ];
  }
}

const instance = new RemoteVectorSource();

export default new WorkerServices<ClusterMethods>({
  addFeaturesInternal(features) {
    return instance.addFeaturesInternal(features);
  },
  cluster(mapDistance, interpolationRatio) {
    return instance.cluster(mapDistance, interpolationRatio);
  },
  getFeaturesInExtent(extent, isTotal) {
    return instance.getFeaturesInExtentList(extent, isTotal);
  },
});
