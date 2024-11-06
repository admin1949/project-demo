import { LineString, Point } from "ol/geom";
import { Stroke, Style, Icon } from "ol/style";

import arrowIconPath from "../../assets/arrow.svg";

import { Feature } from "ol";
import Rbush from "rbush";
import { createDefaultText } from "../Text";

export interface LineConfig {
  id: string | number;
  desc?: string;
  name?: string;

  isDotted: boolean; // 是否是虚线
  width: number;
  fill: string;

  arrow?: "end" | "line" | "none";
  arrowSize?: number;
  arrowUrl?: string;
  zIndex?: number;
  color?: string;
}

export const resolveLineConfig = (
  config: Partial<LineConfig> = {}
): LineConfig => {
  const DETAULT_ICON_CONFIG: LineConfig = {
    id: "",
    desc: "",
    width: 5,
    color: "rgba(237, 212, 0, 0.8)",
    fill: "rgba(47,123,228)",
    isDotted: false,
    arrowSize: 30,
    arrowUrl: arrowIconPath,
  };

  return Object.assign(DETAULT_ICON_CONFIG, config);
};

export const TEST_LINE_STYLE_ID = Symbol("TEST_LINE_STYLE_ID");
export const createLineStyle = (
  config?: LineConfig,
  feature?: Feature<LineString>,
  resolution?: number
) => {
  if (!config) {
    config = resolveLineConfig();
  }
  const customStyle = feature?.get("customStyle") as LineConfig;
  if (customStyle) {
    config = Object.assign({}, config, customStyle || {});
  }
  const zIndex = config.zIndex || 0;
  const baseStyle = new Style({
    stroke: new Stroke({
      width: config.width,
      color: config.fill,
      lineDash: config.isDotted ? [12, 12] : undefined,
    }),
    zIndex: zIndex,
  });

  const styles = [baseStyle];
  if (config.width < 15) {
    styles.push(
      new Style({
        stroke: new Stroke({
          color: "rgba(0,0,0, 0)",
          width: 15,
        }),
        zIndex,
      })
    );
  }
  if (config.name) {
    styles.push(createDefaultText(config.name, zIndex));
  }

  const { arrow, arrowSize = 30, arrowUrl = arrowIconPath } = config;

  if (arrow === "none") {
    return styles;
  }

  if (arrow === "end") {
    feature?.getGeometry()?.forEachSegment((start, end) => {
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      const rotation = Math.atan2(dy, dx);

      // arrows
      styles.push(
        new Style({
          geometry: new Point(end),
          image: new Icon({
            src: arrowUrl,
            rotateWithView: true,
            rotation: -rotation,
            width: arrowSize,
            crossOrigin: "Anonymous",
          }),
          zIndex: zIndex,
        })
      );
    });
  }

  if (arrow === "line" && feature && resolution) {
    styles.push.apply(
      styles,
      createWithLineArrowStyle(feature, resolution, {
        size: arrowSize,
        url: arrowUrl,
      })
    );
  }

  return styles;
};

const createWithLineArrowStyle = (
  feature: Feature<LineString>,
  res: number,
  arrow: { url: string; size: number }
) => {
  // 轨迹线图形
  const trackLine = feature.getGeometry();
  const styles: Style[] = [];
  if (!trackLine) {
    return styles;
  }

  // 对segments建立btree索引
  const tree = new Rbush<{
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    geom: LineString;
    rotation: number;
  }>(); // 路段数

  trackLine.forEachSegment(function (start, end) {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    // 计算每个segment的方向，即箭头旋转方向
    const rotation = Math.atan2(dy, dx);
    const geom = new LineString([start, end]);
    const extent = geom.getExtent();
    const item = {
      minX: extent[0],
      minY: extent[1],
      maxX: extent[2],
      maxY: extent[3],
      geom: geom,
      rotation: rotation,
    };
    tree.insert(item);
  });

  // 轨迹地理长度
  const length = trackLine.getLength();
  // 像素间隔步长
  const stpes = 40; // 像素步长间隔
  // 将像素步长转实际地理距离步长
  const geo_steps = stpes * res;
  // 箭头总数
  const arrowsNum = Number(length / geo_steps);
  for (let i = 1; i < arrowsNum; i++) {
    const arraw_coor = trackLine.getCoordinateAt((i * 1.0) / arrowsNum);
    // 查询设置的点的容差，测试地图单位是米。如果是4326坐标系单位为度的话，改成0.0001.
    const tol = 0.0001;
    const arraw_coor_buffer = [
      arraw_coor[0] - tol,
      arraw_coor[1] - tol,
      arraw_coor[0] + tol,
      arraw_coor[1] + tol,
    ];
    // 进行btree查询
    const treeSearch = tree.search({
      minX: arraw_coor_buffer[0],
      minY: arraw_coor_buffer[1],
      maxX: arraw_coor_buffer[2],
      maxY: arraw_coor_buffer[3],
    });
    let arrow_rotation: number;
    // 只查询一个，那么肯定是它了，直接返回
    if (treeSearch.length == 1) {
      arrow_rotation = treeSearch[0].rotation;
    } else if (treeSearch.length > 1) {
      const results = treeSearch.filter(function (item) {
        // 箭头点与segment相交，返回结果。该方法实测不是很准，可能是计算中间结果
        // 保存到小数精度导致查询有点问题
        // if(item.geom.intersectsCoordinate(arraw_coor))
        //   return true;

        // 换一种方案，设置一个稍小的容差，消除精度问题
        // 消除精度误差的容差
        const _tol = 1;
        if (
          item.geom.intersectsExtent([
            arraw_coor[0] - _tol,
            arraw_coor[1] - _tol,
            arraw_coor[0] + _tol,
            arraw_coor[1] + _tol,
          ])
        )
          return true;
      });
      if (results.length > 0) arrow_rotation = results[0].rotation;
    }

    styles.push(
      new Style({
        geometry: new Point(arraw_coor),
        image: new Icon({
          src: arrow.url,
          width: arrow.size,
          rotateWithView: true,
          rotation: -arrow_rotation!,
          crossOrigin: "Anonymous",
        }),
      })
    );
  }

  return styles;
};
