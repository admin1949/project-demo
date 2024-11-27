import type { Extent } from "ol/extent";
import type { TransferRes, AwaitAble, ServerMethods } from "t-worker";

export type Fns = ServerMethods<{
  getNumber(input: number): AwaitAble<number>;
  getString: (input: string) => AwaitAble<TransferRes<string>>;
  getRandamPoints(
    size: number,
    extent?: Extent
  ): AwaitAble<TransferRes<Float64Array>>;
}>;
