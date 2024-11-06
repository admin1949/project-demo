declare module "projzh" {
  export type Transfromer = (
    input: number[],
    opt_output?: number[],
    opt_dimension?: number
  ) => number[];

  const projzh: {
    datum: {
      bd09: {
        toWGS84: Transfromer;
        fromWGS84: Transfromer;
      };
      gcj02: {
        toWGS84: Transfromer;
        fromWGS84: Transfromer;
      };
    };
    projection: {
      baiduMercator: {
        forward: Transfromer;
        inverse: Transfromer;
      };
      sphericalMercator: {
        forward: Transfromer;
        inverse: Transfromer;
      };
    };

    smerc2bmerc: Transfromer;
    bmerc2smerc: Transfromer;
    bmerc2ll: Transfromer;
    ll2bmerc: Transfromer;

    ll2smerc: Transfromer;
    smerc2ll: Transfromer;
  };

  export default projzh;
}
