import {
  CRSTypes,
  SourceType,
  StaticSourceItem,
  WithStyleCircle,
  WithStyleCircleCollection,
  WithStyleLineString,
  WithStyleLineStringCollection,
  WithStylePoint,
  WithStylePointCollection,
  WithStylePolygon,
  WithStylePolygonCollection,
  WithStyleText,
} from "../utils";
import { Feature } from "ol";
import { Circle, LineString, Point, Polygon } from "ol/geom";
import RenderFeature from "ol/render/Feature";
import { autoTransfrom } from "./useProjection";
import { StyleId } from "../MapStyle";

const resolvePointSource = (
  item: WithStylePoint | WithStylePointCollection,
  proj?: CRSTypes,
  arr: (Feature | RenderFeature)[] = []
) => {
  const obj = {
    styleId: item.styleId,
    featureType: SourceType.POINT,
    pid: item.pid,
    ext: item.ext,
    customStyle: item.customStyle,
  };

  if (item.type === SourceType.POINT) {
    const feature = new Feature();
    feature.setProperties(obj, true);
    feature.set("geometry", new Point(autoTransfrom(item.source, proj)), true);
    arr.push(feature);
    return;
  }

  const list = autoTransfrom(item.source, proj);
  for (let i = 0, ii = list.length; i < ii; i++) {
    const feature = new Feature();
    feature.set("geometry", new Point(list[i]), true);
    feature.setProperties(obj, true);
  }
};

const resolveLineSource = (
  item: WithStyleLineString | WithStyleLineStringCollection,
  proj?: CRSTypes,
  arr: Feature[] = []
) => {
  const obj = {
    styleId: item.styleId,
    featureType: SourceType.LINE,
    pid: item.pid,
    ext: item.ext,
    customStyle: item.customStyle,
  };

  if (item.type === SourceType.LINE) {
    const feature = new Feature(
      new LineString(autoTransfrom(item.source, proj))
    );
    feature.setProperties(obj, true);
    arr.push(feature);
    return;
  }

  for (let i = 0, ii = item.source.length; i < ii; i++) {
    const feature = new Feature(
      new LineString(autoTransfrom(item.source[i], proj))
    );
    feature.setProperties(obj, true);
    arr.push(feature);
  }
};

const resolvePolygonSource = (
  item: WithStylePolygon | WithStylePolygonCollection,
  proj?: CRSTypes,
  arr: Feature[] = []
) => {
  const obj = {
    styleId: item.styleId,
    featureType: SourceType.POLYGON,
    pid: item.pid,
    ext: item.ext,
    customStyle: item.customStyle,
  };
  if (item.type === SourceType.POLYGON) {
    const feature = new Feature(
      new Polygon(item.source.map((list) => autoTransfrom(list, proj)))
    );
    feature.setProperties(obj, true);
    arr.push(feature);
    return;
  }

  for (let i = 0, ii = item.source.length; i < ii; i++) {
    const feature = new Feature(
      new Polygon(item.source[i].map((list) => autoTransfrom(list, proj)))
    );
    feature.setProperties(obj, true);
    arr.push(feature);
  }
};

const resolveCircleSource = (
  item: WithStyleCircle | WithStyleCircleCollection,
  proj?: CRSTypes,
  arr: Feature[] = []
) => {
  const obj = {
    styleId: item.styleId,
    featureType: SourceType.CIRCLE,
    pid: item.pid,
    ext: item.ext,
    customStyle: item.customStyle,
  };
  if (item.type === SourceType.CIRCLE) {
    const geometry = autoTransfrom(item.source[0], proj);
    const feature = new Feature(new Circle(geometry, item.source[1]));
    feature.setProperties(obj, true);
    arr.push(feature);
    return;
  }

  for (let i = 0, ii = item.source.length; i < ii; i++) {
    const [center, radius] = item.source[i];
    const geometry = autoTransfrom(center, proj);
    const feature = new Feature(new Circle(geometry, radius));
    feature.setProperties(obj, true);
    arr.push(feature);
  }
};

const resolveTextSource = (
  item: WithStyleText,
  proj?: CRSTypes,
  arr: Feature[] = []
) => {
  const feature = new Feature(new Point(autoTransfrom(item.source, proj)));
  feature.setProperties(
    {
      styleId: item.styleId,
      featureType: SourceType.TEXT,
      pid: item.pid,
      ext: item.ext,
      customStyle: item.customStyle,
    },
    true
  );

  arr.push(feature);
};

export type StyleKey = "icons" | "lines" | "polygon" | "circle" | "text";
export const useAssetsSource = () => {
  const usedStyleMap = new Map<StyleKey, Set<StyleId>>();
  const addStyleKey = (key: StyleKey, styleId: StyleId) => {
    let list = usedStyleMap.get(key);
    if (!list) {
      list = new Set();
      usedStyleMap.set(key, list);
    }
    list.add(styleId);
  };

  const resolveVectorSource = (list: StaticSourceItem[], proj?: CRSTypes) => {
    usedStyleMap.clear();
    const arr = new Array<Feature<Point | LineString | Polygon | Circle>>();
    for (let i = 0, ii = list.length; i < ii; i++) {
      const item = list[i];
      switch (item.type) {
        case SourceType.POINT:
        case SourceType.POINT_COLLECTION:
          resolvePointSource(item, proj, arr);
          addStyleKey("icons", item.styleId);
          break;
        case SourceType.LINE:
        case SourceType.LINE_COLLECTION:
          resolveLineSource(item, proj, arr);
          addStyleKey("lines", item.styleId);
          break;
        case SourceType.POLYGON:
        case SourceType.POlYGON_COLLECTION:
          resolvePolygonSource(item, proj, arr);
          addStyleKey("polygon", item.styleId);
          break;
        case SourceType.CIRCLE:
        case SourceType.CIRCLE_COLLECTION:
          resolveCircleSource(item, proj, arr);
          addStyleKey("circle", item.styleId);
          break;
        case SourceType.TEXT:
          resolveTextSource(item, proj, arr);
          addStyleKey("text", item.styleId);
          break;
        default:
          console.warn("unknown source", item);
      }
    }
    return arr;
  };

  return {
    resolveVectorSource,
    usedStyleMap,
  };
};

export const useClusterSource = () => {
  const usedStyleMap = new Map<StyleKey, Set<StyleId>>();
  const addStyleKey = (key: StyleKey, styleId: StyleId) => {
    let list = usedStyleMap.get(key);
    if (!list) {
      list = new Set();
      usedStyleMap.set(key, list);
    }
    list.add(styleId);
  };

  const resolveVectorSource = (list: WithStylePoint[], proj?: CRSTypes) => {
    usedStyleMap.clear();
    const arr = new Array<RenderFeature>();
    for (let i = 0, ii = list.length; i < ii; i++) {
      const item = list[i];
      const point = autoTransfrom(item.source, proj);

      const feature = new RenderFeature(
        "Point",
        point,
        point,
        2,
        {
          styleId: item.styleId,
          featureType: SourceType.POINT,
          pid: item.pid,
          ext: item.ext,
          customStyle: item.customStyle,
        },
        item.pid
      );

      arr.push(feature);
      addStyleKey("icons", item.styleId);
    }
    return arr;
  };

  return {
    resolveVectorSource,
    usedStyleMap,
  };
};
