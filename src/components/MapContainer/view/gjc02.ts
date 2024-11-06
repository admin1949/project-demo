import { addProjection, addCoordinateTransforms, Projection } from "ol/proj";
import projzh from "projzh";
import type { Transfromer } from "projzh";

// 定义GCJ02
const gcj02Extent = [
  -20037508.342789244, -20037508.342789244, 20037508.342789244,
  20037508.342789244,
];

const ll2gmerc: Transfromer = (input, opt_output, opt_dimension) => {
  const output = projzh.datum.gcj02.fromWGS84(input, opt_output, opt_dimension);
  return projzh.ll2smerc(output, output, opt_dimension);
};

const gmerc2ll: Transfromer = function (input, opt_output, opt_dimension) {
  const output = projzh.smerc2ll(input, input, opt_dimension);
  return projzh.datum.gcj02.toWGS84(output, opt_output, opt_dimension);
};

const smerc2gmerc: Transfromer = function (input, _opt_output, opt_dimension) {
  let output = projzh.smerc2ll(input, input, opt_dimension);
  output = projzh.datum.gcj02.fromWGS84(output, output, opt_dimension);
  return projzh.ll2smerc(output, output, opt_dimension);
};

const gmerc2smerc: Transfromer = function (input, _opt_output, opt_dimension) {
  let output = projzh.smerc2ll(input, input, opt_dimension);
  output = projzh.datum.gcj02.toWGS84(output, output, opt_dimension);
  return projzh.ll2smerc(output, output, opt_dimension);
};

const gcj02Mecator = new Projection({
  code: "GCJ-02",
  extent: gcj02Extent,
  units: "m",
});

addProjection(gcj02Mecator);
// 将4326/3857转为gcj02坐标的方法定义
addCoordinateTransforms("EPSG:4326", gcj02Mecator, ll2gmerc, gmerc2ll);
addCoordinateTransforms("EPSG:3857", gcj02Mecator, smerc2gmerc, gmerc2smerc);

export { gcj02Mecator };
