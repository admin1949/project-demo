import { addProjection, addCoordinateTransforms, Projection } from "ol/proj";
import projzh from "projzh";

const bd09Extent = [-20037726.37, -12474104.17, 20037726.37, 12474104.17];

const baiduMercator = new Projection({
  code: "baidu",
  extent: bd09Extent,
  units: "m",
});

addProjection(baiduMercator);
addCoordinateTransforms(
  "EPSG:4326",
  baiduMercator,
  projzh.ll2bmerc,
  projzh.bmerc2ll
);

addCoordinateTransforms(
  "EPSG:3857",
  baiduMercator,
  projzh.smerc2bmerc,
  projzh.bmerc2smerc
);

export { baiduMercator };
