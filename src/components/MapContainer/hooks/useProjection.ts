import { Point, CRSTypes, transform } from "../utils";

const isPoint = (t: Point | Point[]): t is Point => !Array.isArray(t[0]);

export function autoTransfrom(point: Point, from?: CRSTypes): Point;
export function autoTransfrom(points: Point[], from?: CRSTypes): Point[];
export function autoTransfrom<T extends Point[] | Point>(
  points: T,
  from = CRSTypes.WGS84
): T {
  if (!points.length) {
    return points;
  }

  const to = CRSTypes.EPSG3857;
  if (from === to) {
    return points;
  }

  if (isPoint(points)) {
    return transform(points, from, to);
  }

  const res: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    res.push(transform(points[i], from, to));
  }

  return res as T;
}
