import { TileImage } from "ol/source";
import TileGrid from "ol/tilegrid/TileGrid";
import { Tile } from "ol/layer";
import { baiduMercator } from "../bd09";

export const createBaiduLayer = ({ urls }: { urls: string[] }) => {
  const bmerResolutions = Array.from({ length: 19 }).map((_, index) =>
    Math.pow(2, 18 - index)
  );
  let idx = 0;

  const baiduLayer = new Tile({
    // source: new ImageTile({
    //   projection: baiduMercator,
    //   crossOrigin: "anonymous",
    //   wrapX: true,
    //   url: function (z, x, y) {
    //     y = -y - 1; // !important 百度地图瓦片中心点在0，0 需要在 openlayer 6.x及以上版本 处理y值
    //     z -= 1;
    //     idx = (idx + 1) % urls.length;
    //     return urls[idx]
    //       .replace(/\{x\}/g, String(x))
    //       .replace(/\{y\}/g, String(y))
    //       .replace(/\{z\}/g, String(z));
    //   },
    //   tileGrid: new TileGrid({
    //     resolutions: [...bmerResolutions],
    //     origin: [0, 0],
    //     tileSize: 512,
    //   }),
    // }),
    source: new TileImage({
      projection: baiduMercator,
      tilePixelRatio: 2,
      crossOrigin: "Anonymous",
      wrapX: true,
      tileUrlFunction: function (tileCoord) {
        let [z, x, y]: number[] = tileCoord;
        y = -y - 1; // !important 百度地图瓦片中心点在0，0 需要在 openlayer 6.x及以上版本 处理y值
        z -= 1;
        idx = (idx + 1) % urls.length;
        return urls[idx]
          .replace(/\{x\}/g, String(x))
          .replace(/\{y\}/g, String(y))
          .replace(/\{z\}/g, String(z));
      },
      tileGrid: new TileGrid({
        resolutions: [...bmerResolutions],
        origin: [0, 0],
        tileSize: 512,
      }),
    }),
  });

  return baiduLayer;
};
