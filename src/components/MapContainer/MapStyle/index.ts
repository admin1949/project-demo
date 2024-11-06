import { Fill, Style } from "ol/style";
import { InjectionKey } from "vue";
import { IconConfig, createIconStyle } from "./Icon";
import { LineConfig, createLineStyle } from "./Line";
import { PolygonConfig, createPolygonStyle } from "./Polygon";
import { CircleConfig, createCircleStyle } from "./Circle";
import { ClusterConfig, createClusterStyle } from "./Cluster";
import { createTextStyle } from "./Text";
import { Feature } from "ol";
import { Circle, LineString, Point, Polygon } from "ol/geom";
import { FeatureLike } from "ol/Feature";
import { SourceType } from "../utils";

export type StyleId = string | symbol | number;
export const MAP_STYLE_INJECT_KEY: InjectionKey<MapStyle> = Symbol(
  "MAP_STYLE_INJECT_KEY"
);

type OnStyleChangeCallback = (styleId: StyleId[]) => void;
type StyleBuilder<T, P> = (
  config?: T,
  feature?: P,
  resolution?: number
) => Style | Style[] | void;
type StyleCreater<P> = (
  feature?: P,
  resolution?: number
) => Style | Style[] | void;

export class StyleCollection<T, P> {
  private styles = new Map<StyleId, T | StyleCreater<P>>();

  private listener = new Array<OnStyleChangeCallback>();

  constructor(private styleBuilder: StyleBuilder<T, P>) {}

  private freeze = false;
  private changeIds = new Set<StyleId>();

  setFreeze() {
    this.freeze = true;
  }

  unfreeze() {
    this.freeze = false;
    if (this.changeIds.size) {
      this.dispathStyleChange([...this.changeIds]);
      this.changeIds.clear();
    }
  }

  private dispathStyleChange(key: StyleId[]) {
    if (!this.freeze) {
      this.listener.forEach((fn) => fn(key));
      return;
    }
    key.forEach((id) => {
      this.changeIds.add(id);
    });
  }

  onMapStyleChange(fn: OnStyleChangeCallback) {
    this.listener.push(fn);
    return () => {
      this.listener = this.listener.filter((i) => i !== fn);
    };
  }

  registry(key: StyleId, config: T | StyleCreater<P>) {
    this.styles.set(key, config);
    this.dispathStyleChange([key]);
  }

  update(key: StyleId, config: T, oldKey?: StyleId) {
    const changeIds = [key];
    if (oldKey && oldKey !== key) {
      const flag = this.styles.delete(oldKey);
      if (flag) {
        changeIds.push(oldKey);
      }
    }
    this.styles.set(key, config);
    this.dispathStyleChange(changeIds);
  }

  unregister(key: StyleId) {
    const hasCurrentStyle = this.styles.delete(key);
    if (hasCurrentStyle) {
      this.dispathStyleChange([key]);
    }
  }

  get(key?: StyleId, feature?: P, resolution?: number) {
    const config = key ? this.styles.get(key) : void 0;
    if (typeof config === "function") {
      return (config as StyleCreater<P>)(feature, resolution);
    }
    return this.styleBuilder(config, feature, resolution);
  }

  getAllStyle() {
    return [...this.styles.entries()];
  }
}

export class MapStyle {
  icons = new StyleCollection(createIconStyle);

  lines = new StyleCollection(createLineStyle);

  polygon = new StyleCollection(createPolygonStyle);

  circle = new StyleCollection(createCircleStyle);

  cluster = new StyleCollection(createClusterStyle);

  text = new StyleCollection(createTextStyle);

  jsonItem(item: StyleCollection<any, any>) {
    return item
      .getAllStyle()
      .filter(
        ([key, val]) => typeof val !== "function" && typeof key !== "symbol"
      );
  }

  toJson() {
    return {
      icons: this.jsonItem(this.icons),
      lines: this.jsonItem(this.lines),
      polygon: this.jsonItem(this.polygon),
      circle: this.jsonItem(this.circle),
      cluster: this.jsonItem(this.cluster),
    };
  }

  updateItem<T, P>(
    item: StyleCollection<T, P>,
    list?: [key: StyleId, val: T | StyleCreater<P>][]
  ) {
    if (!list || !list.length) {
      return;
    }

    item.setFreeze();
    for (const [key, val] of list) {
      item.registry(key, val);
    }
    item.unfreeze();
  }
  formJson(
    json: {
      icons?: [
        key: StyleId,
        config: IconConfig | StyleCreater<Feature<Point>>
      ][];
      lines?: [
        key: StyleId,
        config: LineConfig | StyleCreater<Feature<LineString>>
      ][];
      polygon?: [
        key: StyleId,
        config: PolygonConfig | StyleCreater<Feature<Polygon>>
      ][];
      circle?: [
        key: StyleId,
        config: CircleConfig | StyleCreater<Feature<Circle>>
      ][];
      cluster?: [key: StyleId, config: ClusterConfig | StyleCreater<Feature>][];
    } = {}
  ) {
    this.updateItem(this.icons, json.icons);
    this.updateItem(this.lines, json.lines);
    this.updateItem(this.polygon, json.polygon);
    this.updateItem(this.circle, json.circle);
    this.updateItem(this.cluster, json.cluster);
  }
}

export const createStyleFectory = (mapStyle: MapStyle) => {
  return (feature: FeatureLike, resolution: number): Style | Style[] | void => {
    const type = feature.get("featureType");
    const key = feature.get("styleId");
    switch (type) {
      case SourceType.POINT:
        return mapStyle.icons.get(key, feature as Feature<Point>, resolution);
      case SourceType.LINE:
        return mapStyle.lines.get(
          key,
          feature as Feature<LineString>,
          resolution
        );
      case SourceType.POLYGON:
        return mapStyle.polygon.get(
          key,
          feature as Feature<Polygon>,
          resolution
        );
      case SourceType.CIRCLE:
        return mapStyle.circle.get(key, feature as Feature<Circle>, resolution);

      case SourceType.TEXT:
        return mapStyle.text.get(key, feature as Feature<Point>, resolution);
      default:
        return new Style({
          fill: new Fill({
            color: "#000",
          }),
        });
      // IS_DEVELOPMENT && console.warn("unknown type feature", feature);
    }
  };
};

export { SourceType } from "../utils";
