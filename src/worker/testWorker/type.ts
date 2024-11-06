import type { Extent } from "ol/extent";
import type { PerformanceResult, AwaitAble, ServerMethods } from "../util/type";

export type Fns = ServerMethods<
  {
    getNumber(input: number): AwaitAble<number>;
  },
  {
    getString: (input: string) => AwaitAble<PerformanceResult<string>>;
    getRandamPoints(
      size: number,
      extent?: Extent
    ): AwaitAble<PerformanceResult<Float64Array>>;
  }
>;
