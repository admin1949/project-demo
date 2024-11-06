import { CRSTypes, MAP_TYPE, WMTSConfig } from "../utils";
import demo_url from "../assets/map-demo.jpg";

export interface SourceItem {
  name: string | number;
  id: string | number;
  gcoord: CRSTypes;
  demo_url: string;
  layers: (
    | {
        sort?: number;
        url: string;
        maxZoom?: number;
        mapType:
          | MAP_TYPE.BAI_DU
          | MAP_TYPE.GAO_DE
          | MAP_TYPE.TMS
          | MAP_TYPE.WGS_84
          | MAP_TYPE.TMS_GJC02;
      }
    | {
        sort?: number;
        url: string;
        mapType: MAP_TYPE.GEO_WMTS;
        config: WMTSConfig;
        maxZoom?: number;
      }
  )[];
}
export const querySourceList = () => {
  return Promise.resolve<{ data: SourceItem[] }>({
    data: [
      {
        name: "高德",
        id: "GAO_DE",
        gcoord: CRSTypes.AMap,
        demo_url,
        layers: [
          {
            mapType: MAP_TYPE.GAO_DE,
            sort: 0,
            url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7",
          },
        ],
      },
      {
        name: "百度",
        id: "BaiduOnline",
        gcoord: CRSTypes.BD09LL,
        demo_url,
        layers: [
          {
            mapType: MAP_TYPE.BAI_DU,
            sort: 0,
            url: "http://online{1-4}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&udt=20151021&scaler=2&p1=1",
          },
        ],
      },
      {
        name: "高德卫星",
        id: "GAODEWX",
        gcoord: CRSTypes.AMap,
        demo_url,
        layers: [
          {
            mapType: MAP_TYPE.GAO_DE,
            sort: 0,
            url: "https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
          },
          {
            mapType: MAP_TYPE.GAO_DE,
            sort: 1,
            url: "https://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8&ltype=11",
          },
        ],
      },
    ],
  });
};
