import { Fill, Stroke, Style, Circle, Text } from "ol/style";
import type { Options as StrokeOption } from "ol/style/Stroke";
import type { Feature } from "ol";
import type { Point } from "ol/geom";

export interface ClusterConfig {
  id: string | number;
  desc?: string;

  /** 最小半径 */
  minSize: number;
  /** 允许增加的半径 */
  offsetSize: number;
  /** 直径浮动系数 */
  changeRadio: number;
  /** 集合点填充颜色 */
  fill: string;
  /** 聚合点描边样式 */
  stroke?: StrokeOption;
  text?: {
    fill: string;
    stroke?: StrokeOption;
  };
}

const canvas = document.createElement("canvas");

export const ctx2d = canvas.getContext("2d");

export const resolveClusterConfig = (
  config: Partial<ClusterConfig> = {}
): ClusterConfig => {
  const DETAULT_ICON_CONFIG: ClusterConfig = {
    id: "",
    desc: "",
    minSize: 20,
    offsetSize: 20,
    changeRadio: 100,
    fill: "#6247FF",
    text: {
      fill: "#fff",
      stroke: {
        color: "rgba(0, 0, 0, 0.6)",
        width: 3,
      },
    },
  };
  return Object.assign(DETAULT_ICON_CONFIG, config);
};

const getNum = (num: number, offset = 50) => {
  return num / (num + offset);
};

const CACHED_FILL = new Map<string, Fill>();
const getCachedFill = (color: string) => {
  let fill = CACHED_FILL.get(color);
  if (!fill) {
    fill = new Fill({ color });
    CACHED_FILL.set(color, fill);
  }
  return fill;
};

const DEFAULT_CLUSTER_CONFIG = resolveClusterConfig();
// 仅用于测试时添加的样式.
export const TEST_CLUSTER_STYLE_ID = Symbol("TEST_CLUSTER_STYLE_ID");
export const createClusterStyle = (
  config?: ClusterConfig,
  _feature?: Feature<Point>
) => {
  if (!config) {
    config = DEFAULT_CLUSTER_CONFIG;
  }

  const subNums =
    (_feature?.get("features") as (Feature | number)[])?.length || 0;

  const radius =
    config.minSize +
    Math.floor(getNum(subNums, config.changeRadio) * config.offsetSize);

  const gradient = ctx2d!.createRadialGradient(0, 0, 0, 0, 0, radius);

  gradient.addColorStop(0, "rgba(0, 51, 211, 0.95)");
  gradient.addColorStop(1, "rgba(75,126,250,0.80)");

  return new Style({
    image: new Circle({
      radius,
      // fill: getCachedFill(config.fill),
      fill: new Fill({
        color: gradient,
      }),
    }),
    stroke: config.stroke ? new Stroke(config.stroke) : undefined,
    text: config.text
      ? new Text({
          fill: getCachedFill(config.text.fill),
          stroke: new Stroke(config.text.stroke),
          text: subNums + "",
          font: "14px sans-serif",
        })
      : undefined,
  });
};
