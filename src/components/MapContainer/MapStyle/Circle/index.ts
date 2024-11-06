import { Feature } from "ol";
import { Circle, Point } from "ol/geom";
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from "ol/style";
import { createDefaultText } from "../Text";

export interface CircleConfig {
  id: string | number;
  desc?: string;
  name?: string;
  fillModel: "color" | "gradient";
  stroke: string;
  width: number;
  fill: string;
  isDotted: boolean;
  zIndex?: number,
  canShowRadii?:boolean;
}

// 调试圆形样式的key
export const TEST_CIRCLE_STYLE_ID = Symbol("TEST_CIRCLE_STYLE_ID");

export const resolveCircleConfig = (config: Partial<CircleConfig> = {}) => {
  const DETAULT_ICON_CONFIG: CircleConfig = {
    id: "",
    desc: "",
    width: 4,
    stroke: "rgba(47,123,228, 1)",
    fill: "rgba(47,123,228,0.2)",
    fillModel: "color",
    isDotted: false,
    canShowRadii:false,
  };

  return Object.assign(DETAULT_ICON_CONFIG, config);
};

export const createCircleStyle = (
  config?: CircleConfig,
  feature?: Feature<Circle>,
  _resolution?: number
) => {
  const radius = feature?.getGeometry()?.getRadius();
  if (!radius) {
    return;
  }
  if (!config) {
    config = resolveCircleConfig();
  }
  const customStyle = feature?.get("customStyle") as CircleConfig;
  if (customStyle) {
    config = Object.assign({}, config, customStyle);
  }
  const zIndex = config.zIndex || 0;
  const circleStyle = new Style({
    image: new CircleStyle({
      radius: radius,
    }),
    fill: new Fill({
      color: config.fill,
    }),
    stroke: new Stroke({
      color: config.stroke,
      width: config.width,
      lineDash: config.isDotted ? [10, 10] : undefined,
    }),
    zIndex,
  });
  const res = [circleStyle];
  const center = feature?.getGeometry()?.getCenter();
  if (config.canShowRadii && center) {
    res.push(
      new Style({
        geometry: new Point([center[0] + radius, center[1]]),
        text: new Text({
          text: `${Number(radius.toFixed(2))}米`,
          font: "14px sans-serif",
          textAlign: "left",
          placement: "line",
          backgroundFill: new Fill({
            color: "#24579D",
          }),
          backgroundStroke: new Stroke({
            lineCap: "round",
            color: "#24579D",
          }),
          padding: [4, 4, 2, 4],
          fill: new Fill({
            color: "#fff",
          }),
          offsetX: 4,
        }),
      })
    )
  }

  if (!config.name) {
    return res;
  }

  const textStyle = createDefaultText(config.name, zIndex);
  res.push(textStyle);
  return res;
};
