import { Fill, Stroke, Style, Circle, Text } from "ol/style";
import Icon, {
  IconAnchorUnits,
  IconOrigin,
  Options as IconOption,
} from "ol/style/Icon";

import defaultIcon from "../../assets/icon-warning-instance-general.svg";

import { Point } from "ol/geom";
import { Feature } from "ol";

export interface IconConfig {
  id: string | number;
  desc?: string;
  src: string;
  anchorOrigin?: IconOrigin | "center";
  unit: IconAnchorUnits;
  x: number;
  y: number;
  opacity: number;
  rotation: number;

  sizeModel: "scale" | "widthFit" | "heighthFit" | "forceScale";
  scale: number;
  width: number;
  height: number;

  name?: string;
  showNameText?: boolean | number;
  textTop?: number;
  zIndex?: number;
}

const CREATE_DEFAULT_ICON = () => {
  return new Style({
    image: new Circle({
      radius: 7,
      fill: new Fill({ color: "black" }),
      stroke: new Stroke({
        color: "white",
        width: 2,
      }),
    }),
  });
};

export const resolveIconConfig = (
  config: Partial<IconConfig> = {}
): IconConfig => {
  const DETAULT_ICON_CONFIG: IconConfig = {
    id: "",
    desc: "",
    src: defaultIcon,
    anchorOrigin: "center",

    unit: "fraction",
    x: 0,
    y: 0,

    opacity: 1,
    rotation: 0,

    sizeModel: "scale",
    width: 20,
    height: 20,
    scale: 1,

    name: "",
    showNameText: false,
    textTop: 0,
  };
  return Object.assign(DETAULT_ICON_CONFIG, config);
};

// 仅用于测试时添加的样式.
export const TEST_ICON_STYLE_ID = Symbol("TEST_ICON_STYLE_ID");
export const createIconStyle = (
  config?: IconConfig,
  feature?: Feature<Point>,
  resoultion: number = 1
) => {
  if (!config) {
    return CREATE_DEFAULT_ICON();
  }
  const customStyle = feature?.get("customStyle") as {
    name?: string;
    showNameText?: boolean | number;
    textTop?: number;
    zIndex?: number;
  };

  if (customStyle) {
    config = Object.assign({}, config, customStyle);
  }

  const anchorOrigin = config.anchorOrigin;
  const zIndex = config.zIndex || 0;
  const opt: IconOption = {
    src: config.src || defaultIcon,
    opacity: config.opacity,
    rotation: config.rotation * Math.PI,
    crossOrigin: "Anonymous",
  };

  if (anchorOrigin !== "center") {
    opt.anchorOrigin = anchorOrigin;
    opt.anchor = [config.x, config.y];
    opt.anchorXUnits = config.unit;
    opt.anchorYUnits = config.unit;
  }

  if (config.sizeModel === "scale") {
    opt.scale = config.scale;
  }

  if (config.sizeModel === "forceScale" || config.sizeModel === "widthFit") {
    opt.width = config.width;
  }

  if (config.sizeModel === "forceScale" || config.sizeModel === "heighthFit") {
    opt.height = config.height;
  }

  const text = createTextFiled(config, resoultion);

  return new Style({
    image: new Icon(opt),
    text,
    zIndex,
  });
};

export const createTextFiled = (
  config: {
    name?: string;
    showNameText?: boolean | number;
    textTop?: number;
    opcity?: number;
  },
  resoultion: number
): Text | undefined => {
  if (!config.name) {
    return;
  }
  const canShowNameText =
    typeof config.showNameText === "number"
      ? config.showNameText > resoultion
      : true;

  if (!canShowNameText) {
    return;
  }

  return new Text({
    text: config.name,
    font: "14px sans-serif",
    fill: new Fill({
      color: "#fff",
    }),
    backgroundFill: new Fill({
      color: "rgba(45, 123, 228, 0.7)",
    }),
    padding: [2, 4, 2, 4],
    offsetY: config.textTop ?? -45,
  });
};
