import { Stroke, Text, Fill, Style } from "ol/style";
import { Point as OlPoint, Polygon } from "ol/geom";
import { Feature } from "ol";
import { Point, getMapZoom } from "../../utils";

export interface TextConfig {
  text: string;
  detail: string;
  canShowDetail: boolean;
  stroke: string; // 使用rgba颜色
  fill: string; // 使用rgba颜色

  bgStroke: string; // 使用rgba颜色
  bgFill: string; // 使用rgba颜色

  fontSize: number; //字体大小
  bold: boolean; // 是否加粗
  italic: boolean; // 是否倾斜
  padding?: [number, number, number, number];

  zIndex?: number;
  zoom?: number;
  // x: number; // 偏移量 X
  // y: number; // 偏移量 Y
}

export const resolveTextConfig = (
  config: Partial<TextConfig> = {}
): TextConfig => {
  const DETAULT_TEXT_CONFIG: TextConfig = {
    text: "",
    detail: "",
    canShowDetail: false,
    stroke: "rgba(0, 0, 0, 0)", // 使用rgba颜色
    fill: "#24579D", // 使用rgba颜色

    bgStroke: "rgba(36, 87, 157, 0.7)", // 使用rgba颜色
    bgFill: "rgba(36, 87, 157, 0.2)", // 使用rgba颜色

    padding: [2, 4, 2, 4],
    fontSize: 14, //字体大小
    bold: false, // 是否加粗
    italic: false, // 是否倾斜

    // x: 0, // 偏移量 X
    // y: 0, // 偏移量 Y
  };

  return Object.assign(DETAULT_TEXT_CONFIG, config);
};

const getTextScale = (mapZoom: number, textZoom?: number) => {
  if (!textZoom) {
    return 1;
  }
  return Math.pow(2, mapZoom - textZoom);
};

export const TEST_TEXT_STYLE_ID = Symbol("TEST_TEXT_STYLE_ID");
export const createTextStyle = (
  config?: TextConfig,
  feature?: Feature<OlPoint>,
  resolution: number = 1
) => {
  if (!feature) {
    return;
  }
  if (!config) {
    config = resolveTextConfig();
  }

  const customStyle = feature.get("customStyle") as TextConfig;
  if (customStyle) {
    config = Object.assign({}, config, customStyle);
  }
  const zIndex = config.zIndex || 0;
  const { bold, italic, fontSize, text, padding = [0, 0, 0, 0], zoom } = config;
  const front = [
    `${bold ? "bold" : ""}`,
    `${italic ? "italic" : ""}`,
    `${fontSize}px`,
    "sans-serif",
  ]
    .filter((i) => i.length)
    .join(" ");

  const texts = text.split("\n");
  const width = Math.max.apply(
    Math,
    texts.map((i) => getTextSize(i, front))
  );

  const height = texts.length * fontSize + padding[0] + padding[2];

  const textStyle = new Style({
    text: new Text({
      text: text,
      // offsetX: config.x,
      // offsetY: config.y,
      font: front,
      stroke: new Stroke({
        color: config.stroke,
      }),
      fill: new Fill({
        color: config.fill,
      }),
      backgroundFill: new Fill({
        color: config.bgFill,
      }),
      backgroundStroke: new Stroke({
        color: config.bgStroke,
      }),
      scale: getTextScale(getMapZoom(resolution), zoom),
    }),
    zIndex,
  });
  const point = feature.getGeometry()?.getCoordinates();
  const polygon = createPlygon(
    { width, height },
    padding,
    point as Point,
    resolution * getTextScale(getMapZoom(resolution), zoom)
  );
  if (!polygon) {
    return textStyle;
  }

  const bgPlygon = new Style({
    fill: new Fill({
      color: "rgba(0, 0, 0, 0)",
    }),
    geometry: new Polygon([polygon.map((i) => [i[0], i[1]])]),
    zIndex,
  });
  return [textStyle, bgPlygon];
};

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const getTextSize = (text: string, front: string) => {
  if (!ctx) {
    return 10;
  }
  ctx.save();
  ctx.font = front;
  const size = ctx.measureText(text);
  ctx.restore();
  return size.width;
};

const createPlygon = (
  size: { width: number; height: number },
  padding:
    | [number, number, number, number]
    | readonly [number, number, number, number],
  point?: [number, number],
  res = 1
) => {
  if (!point) {
    return;
  }
  const [top, right, bottom, left] = padding;
  const [lng, lat] = point;
  const { width, height } = size;
  const topLeft = [
    lng - (width / 2 + left) * res,
    lat - (height / 2 + top) * res,
  ];
  const topRight = [
    lng + (width / 2 + right) * res,
    lat - (height / 2 + top) * res,
  ];
  const bottomRight = [
    lng + (width / 2 + right) * res,
    lat + (height / 2 + bottom) * res,
  ];
  const bottomleft = [
    lng - (width / 2 + left) * res,
    lat + (height / 2 + bottom) * res,
  ];

  return [topLeft, topRight, bottomRight, bottomleft, topLeft];
};

export const createDefaultText = (text: string, zIndex?: number) => {
  return new Style({
    text: new Text({
      text: text,
      font: "14px sans-serif",
      fill: new Fill({
        color: "#fff",
      }),
      stroke: new Stroke({
        color: "#000",
      }),
      backgroundFill: new Fill({
        color: "rgba(0, 0, 0, 0.5)",
      }),
      padding: [2, 4, 2, 4],
    }),
    zIndex,
  });
};
