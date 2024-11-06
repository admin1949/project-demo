import { XYZ } from "ol/source";
import { Tile } from "ol/layer";
import { gcj02Mecator } from "../gjc02";

export const createAmapLayer = ({
  urls,
  maxZoom,
}: {
  urls: string[];
  maxZoom?: number;
}) => {
  return new Tile({
    source: new XYZ({
      projection: gcj02Mecator,
      tilePixelRatio: 2,
      urls,
      crossOrigin: "Anonymous",
      maxZoom: maxZoom || 18,
    }),
  });
};
