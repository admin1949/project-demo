import gcoord from "gcoord";
import type { StyleId } from "./MapStyle/index";
import type { Map as OlMap, Feature } from "ol";
import { extend, createEmpty, getWidth, isEmpty } from "ol/extent";
import { get } from "ol/proj";

export type Point = [lng: number, lat: number];

export enum MAP_TYPE {
  BAI_DU = "BAI_DU",
  GAO_DE = "GAO_DE",
  TMS = "TMS",
  TMS_GJC02 = "TMS_GJC02",
  GEO_WMTS = "GEO_WMTS",
  WGS_84 = "WGS_84",
}

export enum CRSTypes {
  WGS84 = "WGS84",
  WGS1984 = "WGS84",
  EPSG4326 = "WGS84",
  GCJ02 = "GCJ02",
  AMap = "GCJ02",
  BD09 = "BD09",
  BD09LL = "BD09",
  Baidu = "BD09",
  BMap = "BD09",
  BD09MC = "BD09MC",
  BD09Meter = "BD09MC",
  EPSG3857 = "EPSG3857",
  EPSG900913 = "EPSG3857",
  EPSG102100 = "EPSG3857",
  WebMercator = "EPSG3857",
  WM = "EPSG3857",
}

export const transform = gcoord.transform;
export const loop = () => {};

const size = getWidth(get("EPSG:3857")!.getExtent()) / 256;
export const getMapZoom = (resolution: number) => {
  return Math.log2(size / resolution);
};

// @ts-ignore
self.gcoord = gcoord;

export interface BaseConfig {
  center: Point;
  centerProj: CRSTypes;
  zoom: number;
  maxZoom: number;
  minZoom: number;
  controls: string[];
}

export interface HeatMapConfig {
  gradient: string[];
  radius: number;
  blur: number;
  visible: boolean;
  source: {
    proj: CRSTypes;
    list: {
      label: string;
      mark?: string;
      list: {
        lng: number;
        lat: number;
        weight?: number;
      }[];
    }[];
  };
}

export const isSamePoint = (p1: Point, p2: Point) => {
  return p1 === p2 || (p1[0] === p2[0] && p1[1] === p2[1]);
};

export const parsePointString = (str: string) => {
  if (!str) {
    return "";
  }
  if (str.includes("，")) {
    return str.replace(/(\d) *， *(\d)/, "$1, $2");
  }
  if (!str.includes(",")) {
    return str.replace(/(\d) +(\d)/, "$1, $2");
  }
  return str.replace(/(\d) *, *(\d)/, "$1, $2");
};

export enum SourceType {
  POINT = "point",
  POINT_COLLECTION = "pointCollection",

  LINE = "lineString",
  LINE_COLLECTION = "lineStringCollection",

  POLYGON = "polygon",
  POlYGON_COLLECTION = "polygonCollection",

  CIRCLE = "circle",
  CIRCLE_COLLECTION = "circleCollection",

  TEXT = "text",
}

interface WithStyleAssets<T> {
  source: T;
  styleId: StyleId;
  pid?: string | number;
  ext?: Record<string, any>;
  customStyle?: Record<string, any>;
}

export interface WithStylePoint extends WithStyleAssets<Point> {
  type: SourceType.POINT;
}

export interface WithStyleText extends WithStyleAssets<Point> {
  type: SourceType.TEXT;
}

export interface WithStylePointCollection extends WithStyleAssets<Point[]> {
  type: SourceType.POINT_COLLECTION;
}

export interface WithStyleLineString extends WithStyleAssets<Point[]> {
  type: SourceType.LINE;
}

export interface WithStyleLineStringCollection
  extends WithStyleAssets<Point[][]> {
  type: SourceType.LINE_COLLECTION;
}

export interface WithStylePolygon extends WithStyleAssets<Point[][]> {
  type: SourceType.POLYGON;
}

export interface WithStylePolygonCollection
  extends WithStyleAssets<Point[][][]> {
  type: SourceType.POlYGON_COLLECTION;
}

export interface WithStyleCircle
  extends WithStyleAssets<[center: Point, radius: number]> {
  type: SourceType.CIRCLE;
}

export interface WithStyleCircleCollection
  extends WithStyleAssets<[center: Point, radius: number][]> {
  type: SourceType.CIRCLE_COLLECTION;
}

export type StaticSourceItem =
  | WithStylePolygon
  | WithStylePoint
  | WithStyleText
  | WithStyleLineString
  | WithStyleCircle
  | WithStylePointCollection
  | WithStyleLineStringCollection
  | WithStylePolygonCollection
  | WithStyleCircleCollection;

export interface LayerSource {
  name: string;
  proj: CRSTypes;
  zIndex: number;
  visible: boolean;
  source: StaticSourceItem[];
}

export const screenshotMap = (map: OlMap) => {
  return new Promise<HTMLCanvasElement>((res) => {
    map.once("rendercomplete", function () {
      const mapCanvas = document.createElement("canvas");
      const size = map.getSize()!;
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      const mapContext = mapCanvas.getContext("2d")!;
      Array.prototype.forEach.call(
        map.getViewport().querySelectorAll(".ol-layer canvas, canvas.ol-layer"),
        (canvas: HTMLCanvasElement) => {
          if (canvas.width > 0) {
            const opacity =
              canvas.parentElement?.style.opacity || canvas.style.opacity;
            mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);
            let matrix;
            const transform = canvas.style.transform;
            if (transform) {
              // Get the transform parameters from the style's transform matrix
              matrix = transform
                .match(/^matrix\(([^\(]*)\)$/)![1]
                .split(",")
                .map(Number);
            } else {
              matrix = [
                parseFloat(canvas.style.width) / canvas.width,
                0,
                0,
                parseFloat(canvas.style.height) / canvas.height,
                0,
                0,
              ];
            }
            // Apply the transform to the export map context
            CanvasRenderingContext2D.prototype.setTransform.apply(
              mapContext,
              matrix as any
            );
            const backgroundColor = canvas.parentElement?.style.backgroundColor;
            if (backgroundColor) {
              mapContext.fillStyle = backgroundColor;
              mapContext.fillRect(0, 0, canvas.width, canvas.height);
            }
            mapContext.drawImage(canvas, 0, 0);
          }
        }
      );
      mapContext.globalAlpha = 1;
      mapContext.setTransform(1, 0, 0, 1, 0, 0);
      res(mapCanvas);
    });
    map.renderSync();
  });
};

export const centerFeatures = (
  features: Feature[],
  map?: OlMap,
  padding = [100, 50, 100, 50],
  maxZoom = 19
) => {
  const view = map?.getView();
  if (!view) {
    return;
  }
  if (!features.length) {
    return;
  }
  const extent = createEmpty();
  features.forEach((item) => {
    const current = item.getGeometry()?.getExtent();
    if (!current) {
      return;
    }
    extend(extent, current);
  });
  if (isEmpty(extent)) {
    return;
  }

  view.fit(extent, { duration: 200, padding, maxZoom });
};

export interface WMTSConfig {
  layer: string;
  style: string;
  matrixSet: string;
  format: string;
  matrixIdPrefix: string;
}

export enum MAP_VIEW_ZOOM {
  /** 地图资源上图 */
  BG_VIEW = 0,
  /** 地图图标 */
  ASSETS = 100,
}
