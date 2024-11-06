import { DIRECTION } from "@eric/antv-xmind";
import { Path } from "@antv/x6";

const path = `
M 0 99 L 0 100 
C 8.61 99.88 11.95 99.18 15.55 97.10 
C 24.36 92.65 20.36 70.69 21.20 63.09 
C 21.20 55.09 21.38 52.31 30 50
C 21.38 47.55 21.20 44.88 21.20 36.76 
L 21.20 16.11 
C 20.66 3.58 16.38 0.27 0 0
L 0 1
C 8.95 3.26 11.79 6.77 11.79 15.55
L 11.79 34.82 
C 11.79 44.53 12.11 47.57 21.82 49.91 
C 12.09 52.13 11.79 55.18 11.79 64.89 
L 11.79 84.54 
C 11.79 93.30 8.93 96.82 0 99 
L 0 99 Z
`;
const p = Path.parse(path);
const bbox = p.bbox();
const other = p.clone().rotate(180, bbox ? bbox.center : [0, 0]);
console.log(p, other);
const createOriginPath = (h: number) => {
  if (h < 100) {
    return path;
  }
  const half = h / 2;
  const l = `
M 0 ${h - 1} L 0 ${h} 
C 8.61 ${h - 0.12} 11.95 ${h - 0.82} 15.55 ${h - 2.9} 
C 24.36 ${h - 7.35} 20.36 ${h - 29.31} 21.20 ${half + 13.09} 
C 21.20 ${half + 5.09} 21.38 ${half + 2.31} 30 ${half}
C 21.38 ${half - 2.45} 21.20 ${half - 5.12} 21.20 ${half - 13.24} 
L 21.20 16.11 
C 20.66 3.58 16.38 0.27 0 0
L 0 1
C 8.95 3.26 11.79 6.77 11.79 15.55
L 11.79 ${half - 15.18} 
C 11.79 ${half - 5.47} 12.11 ${half - 2.43} 21.82 ${half - 0.09} 
C 12.09 ${half + 2.13} 11.79 ${half + 5.18} 11.79 ${half + 14.89} 
L 11.79 ${h - 15.46} 
C 11.79 ${h - 6.7} 8.93 ${h - 3.18} 0 ${h - 1}
L 0 99 Z`;

  return l;
};

export const createPath = (h = 100, dir: DIRECTION) => {
  const p = createOriginPath(h);
  const baseCenter = { x: 15, y: 50 };

  if (dir === DIRECTION.TO_BOTTOM) {
    const path = Path.parse(p);
    const center = path.bbox()?.center || baseCenter;
    path
      .rotate(270, center)
      .translate(center.y - center.x, center.x - center.y);
    return path.toString();
  }

  if (dir === DIRECTION.TO_LEFT) {
    const path = Path.parse(p);
    const center = path.bbox()?.center || baseCenter;
    path.rotate(180, center);
    return path.toString();
  }
  return p;
};
