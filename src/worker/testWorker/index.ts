import { WorkerServices, createTransferRes } from "t-worker";
import { Fns } from "./type";
import gcoord from "gcoord";

const sleep = (time = 1000) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, time);
  });

export default new WorkerServices<Fns>({
  getNumber(val) {
    return 12 + val;
  },
  async getString(val) {
    await sleep();
    return createTransferRes(val + "__add:" + Math.random(), []);
  },

  getRandamPoints(size, extent) {
    const res = new Float64Array(size * 2);
    const [minx, miny, maxx, maxy] = extent || [-180, -90, 180, 90];
    const offsetX = maxx - minx;
    const offsetY = maxy - miny;

    for (let i = 0; i < size; i++) {
      const x = minx + Math.random() * offsetX;
      const y = miny + Math.random() * offsetY;
      const [lng, lat] = gcoord.transform([x, y], gcoord.WGS84, gcoord.WM);
      const p = i * 2;
      res[p] = lng;
      res[p + 1] = lat;
    }

    return createTransferRes(res, [res.buffer]);
  },
});
