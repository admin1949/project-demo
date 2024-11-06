import { Feature } from "ol";
import { Polygon } from "ol/geom";
import { Fill, Stroke, Style } from "ol/style";
import { createDefaultText } from "../Text";

export interface PolygonConfig {
  id: string | number;
  desc?: string;

  name?: string;
  width: number;
  stroke: string;
  fill: string;
  isDotted: boolean;
  zIndex?: number;
}

export const TEST_POLYGON_STYLE_ID = Symbol("TEST_POLYGON_STYLE_ID");

export const resolvepolygonConfig = (config: Partial<PolygonConfig> = {}) => {
  const DETAULT_ICON_CONFIG: PolygonConfig = {
    id: "",
    desc: "",
    width: 3,
    stroke: "rgba(47,123,228, 1)",
    fill: "rgba(47,123,228, 0.2)",
    isDotted: false,
  };

  return Object.assign(DETAULT_ICON_CONFIG, config);
};

export const createPolygonStyle = (
  config?: PolygonConfig,
  feature?: Feature<Polygon>,
  _resolution?: number
) => {
  if (!config) {
    config = resolvepolygonConfig();
  }
  const customStyle = feature?.get("customStyle") as PolygonConfig;
  if (customStyle) {
    config = Object.assign({}, config, customStyle);
  }
  const zIndex = config.zIndex || 0;
  const polygonStyle = new Style({
    stroke: new Stroke({
      color: config.stroke,
      width: config.width,
      lineDash: config.isDotted ? [10, 10] : undefined,
    }),
    fill: new Fill({
      color: config.fill,
    }),
    zIndex,
  });
  if (!config.name) {
    return polygonStyle;
  }
  const textStyle = createDefaultText(config.name, zIndex);
  return [polygonStyle, textStyle];
};
