import {
  shallowRef,
  InjectionKey,
  ShallowRef,
  provide,
  inject,
  Ref,
  ref,
  onScopeDispose,
} from "vue";
import { MapBrowserEvent, Map as OlMap } from "ol";
import { EventsKey } from "ol/events";
import { Layer, Vector } from "ol/layer";
import { CRSTypes, loop } from "../utils";
import type { OverviewMap } from "ol/control";
import { unByKey } from "ol/Observable";
import { useEvnet, useSafeOn, CustomEvent } from "@/hooks/useEvent";
import { FeatureLike } from "ol/Feature";
import type { SourceItem } from "../mock/index";

interface MapReadyCallBack {
  (instance: MapInstance): void;
}
type MapInstance = {
  map: OlMap;
  projection?: CRSTypes;
  mapContainer: Ref<HTMLElement | undefined>;
};
const mapInstanceKey: InjectionKey<ShallowRef<MapInstance | undefined>> =
  Symbol("mapInstance");
const mapUtilsKey: InjectionKey<{
  afterMapReady: (fn: MapReadyCallBack) => void;
  registerLayer: (code: string | symbol, layer: Layer) => () => void;
  registerOverViewLayer: (layer: Layer) => () => void;
  getlayers: (code?: string) => { layer: Layer; mounted: boolean }[];
  registerOverviewMap: (overviewMap: OverviewMap) => () => void;
  eventBus: ReturnType<typeof useEvnet>;
}> = Symbol("mapUtils");

const mapSourceControlKey: InjectionKey<
  ReturnType<typeof useMapSourceControl>
> = Symbol("mapSourceControl");

export const MAP_CLICK_FEATURE: CustomEvent<{
  layer: Layer;
  features: FeatureLike[];
  evt: MapBrowserEvent<any>;
}> = Symbol("MAP_CLICK_FEATURE");

export const VECTOR_LAYER = Symbol("VECTOR_LAYER");

export const useMapContainer = () => {
  let hasReady = false;
  let hasDispose = false;

  const mapInstance = shallowRef<MapInstance>();
  const overviewMapInstance = shallowRef<OverviewMap>();
  const mapReadyCallBack = Array<MapReadyCallBack>();
  const OVERVIEW_LAYER_CODE = Symbol("OVERVIEW_LAYER_CODE");

  provide(mapInstanceKey, mapInstance);

  const mapSourceControl = useMapSourceControl();
  provide(mapSourceControlKey, mapSourceControl);

  const onMapReady = (instance: MapInstance) => {
    if (hasDispose) {
      console.warn("map dispose after dsipose");
      instance.map?.dispose();
      return;
    }

    if (!hasReady) {
      hasReady = true;
    } else {
      console.warn("mulit init call map ready hook");
    }

    hasReady = true;
    mapInstance.value = instance;
    if (overviewMapInstance.value) {
      instance.map.addControl(overviewMapInstance.value);
    }

    layers.forEach((list, key) => {
      list.forEach((item) => {
        if (!item.mounted) {
          if (key === OVERVIEW_LAYER_CODE) {
            if (overviewMapInstance.value) {
              overviewMapInstance.value?.getOverviewMap().addLayer(item.layer);
              item.mounted = true;
            }
          } else {
            if (instance.map) {
              item.mounted = true;
              instance.map?.addLayer(item.layer);
            }
          }
        }
      });
    });
    mapReadyCallBack.forEach((fn) => {
      fn(instance);
    });
  };

  const waitClearEvents: EventsKey[] = [];
  const disposeMap = () => {
    hasDispose = true;
    mapReadyCallBack.length = 0;
    mapInstance.value?.map?.dispose();
    mapInstance.value = undefined;
    unByKey(waitClearEvents);
    waitClearEvents.length = 0;
  };

  const afterMapReady = (fn: MapReadyCallBack) => {
    mapReadyCallBack.push(fn);

    if (mapInstance.value) {
      fn(mapInstance.value);
    }
  };

  const layers = new Map<
    string | symbol,
    { layer: Layer; mounted: boolean }[]
  >();

  const registerLayer = (code: string | symbol, layer: Layer) => {
    if (hasDispose) {
      layer.dispose();
      console.log("add layer after map dispose");
      return loop;
    }
    let list = layers.get(code);
    if (!list) {
      list = [];
      layers.set(code, list);
    }
    const map = mapInstance.value?.map;
    const overviewMap = overviewMapInstance.value;
    const item = { layer, mounted: false };
    if (code === OVERVIEW_LAYER_CODE) {
      if (overviewMap) {
        overviewMap?.getOverviewMap()?.addLayer(layer);
        item.mounted = true;
      }
    } else {
      if (map) {
        map.addLayer(layer);
        item.mounted = true;
      }
    }
    list.push(item);
    return () => {
      unregisterLayer(code, layer);
    };
  };

  const unregisterLayer = (code: string | symbol, layer: Layer) => {
    let list = layers.get(code);
    if (!list) {
      return;
    }
    const item = list.find((i) => i.layer === layer);
    if (!item) {
      return;
    }
    const map = mapInstance.value?.map;
    const overviewMap = overviewMapInstance.value;
    if (item.mounted) {
      if (code === OVERVIEW_LAYER_CODE) {
        overviewMap?.getOverviewMap()?.removeLayer(layer);
      } else {
        map?.removeLayer(layer);
      }
    }
    list = list.filter((i) => i.layer !== layer);
    if (!list) {
      layers.delete(code);
    } else {
      layers.set(code, list);
    }
  };

  const registerOverViewLayer = (layer: Layer) => {
    return registerLayer(OVERVIEW_LAYER_CODE, layer);
  };

  const getlayers = (code?: string | symbol) => {
    if (!code) {
      const res: { layer: Layer; mounted: boolean }[] = [];
      layers.forEach((list) => {
        res.push.apply(res, list);
      });
      return res;
    }
    const list = layers.get(code) || [];
    return list;
  };

  const offOverviewMap = (overviewMap: OverviewMap) => {
    if (overviewMap !== overviewMapInstance.value) {
      return;
    }
    getlayers(OVERVIEW_LAYER_CODE).forEach((i) => {
      overviewMap.getOverviewMap().removeLayer(i.layer);
      i.mounted = false;
    });
    mapInstance.value?.map.removeControl(overviewMap);
    overviewMap.dispose();
  };

  const registerOverviewMap = (overviewMap: OverviewMap) => {
    if (overviewMapInstance.value === overviewMap) {
      return () => offOverviewMap(overviewMap);
    }

    if (overviewMapInstance.value) {
      offOverviewMap(overviewMapInstance.value);
    }

    getlayers(OVERVIEW_LAYER_CODE).forEach((i) => {
      overviewMap.getOverviewMap().addLayer(i.layer);
      i.mounted = true;
    });
    overviewMapInstance.value = overviewMap;
    mapInstance.value?.map.addControl(overviewMap);
    return () => offOverviewMap(overviewMap);
  };

  const eventBus = useEvnet();
  afterMapReady(({ map }) => {
    const e1 = map.on("click", (evt) => {
      if (evt.dragging) {
        return;
      }
      const list: { layer: Layer; mounted: boolean }[] = [];
      layers.forEach((arr) => {
        list.push.apply(
          list,
          arr.filter((i) => i.mounted && i.layer instanceof Vector)
        );
      });
      if (!list.length) {
        return;
      }
      const getLayerIndex = (layer: Layer) => {
        return layer.getZIndex() || 0;
      };
      const visbielList = list
        .filter((i) => i.layer.getVisible())
        .sort((i, j) => getLayerIndex(j.layer) - getLayerIndex(i.layer));

      const actions = visbielList.map(async ({ layer }) => {
        const features = await layer.getFeatures(evt.pixel);
        return { layer, features };
      });
      doActions(actions, ({ layer, features }) => {
        if (!features.length) {
          return false;
        }
        eventBus.dispatch(MAP_CLICK_FEATURE, { layer, features, evt });
        return true;
      });
    });
    waitClearEvents.push(e1);
  });

  provide(mapUtilsKey, {
    afterMapReady,
    registerLayer,
    getlayers,
    registerOverViewLayer,
    registerOverviewMap,
    eventBus,
  });

  onScopeDispose(disposeMap);

  return {
    onMapReady,
    disposeMap,
    mapInstance,
    mapSourceControl,
  };
};

const useMapSourceControl = () => {
  const sourceList = ref<SourceItem[]>([]);
  const activeSourceId = ref<SourceItem["id"]>();
  const updateMapSource = (mapSources: SourceItem[]) => {
    sourceList.value = mapSources;
    activeSourceId.value = mapSources[0]?.id;
  };
  const handleSelectMapSource = (id: SourceItem["id"]) => {
    activeSourceId.value = id;
  };

  return {
    sourceList,
    activeSourceId,
    updateMapSource,
    handleSelectMapSource,
  };
};

export const useMap = () => {
  const mapInstance = inject(mapInstanceKey)!;
  const mapUtils = inject(mapUtilsKey)!;
  const mapSourceControl = inject(mapSourceControlKey)!;
  const { afterMapReady: originafterMapReady, eventBus, ...reset } = mapUtils;

  let hasDispose = false;
  const waitOffMapEvents: EventsKey[] = [];
  onScopeDispose(() => {
    hasDispose = true;
    if (waitOffMapEvents.length) {
      unByKey(waitOffMapEvents);
      waitOffMapEvents.length = 0;
    }
  });

  const onMapEvent = useSafeOn(eventBus.on);

  const afterMapReady = (
    fn: (instance: MapInstance) => void | EventsKey | EventsKey[]
  ) => {
    originafterMapReady((instance) => {
      if (hasDispose) {
        return;
      }
      const events = fn(instance);
      if (!events) {
        return;
      }
      if (Array.isArray(events)) {
        waitOffMapEvents.push.apply(waitOffMapEvents, events);
        return;
      }
      waitOffMapEvents.push(events);
    });
  };

  return {
    mapInstance,
    ...reset,
    afterMapReady,
    mapSourceControl,
    onMapEvent,
  };
};

async function doActions<T>(
  arr: Promise<T>[],
  cb: (data: T) => boolean | void
) {
  for (let i = 0; i < arr.length; i++) {
    const res = await arr[i];
    const status = cb(res) ?? true;
    if (status) {
      break;
    }
  }
}
