import { loop } from "@/utils";
import { onScopeDispose } from "vue";

export interface CustomEvent<_T = void> extends Symbol {}

interface FnOn {
  <T>(event: CustomEvent<T>, cb: (data: T) => void): () => void;
  (event: string, cb: (data: unknown) => void): () => void;
}

class EventBus {
  eventMap = new Map<string | CustomEvent, ((data: any) => void)[]>();
  private hasDisposed = false;

  constructor() {
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.once = this.once.bind(this);
    this.dispatch = this.dispatch.bind(this);
  }

  dispatch(event: CustomEvent<void>): void;
  dispatch<T>(event: CustomEvent<T>, data: T): void;
  dispatch(event: string, data?: any): void;
  dispatch<T = any>(event: string | CustomEvent<T>, data?: T) {
    const { hasDisposed, eventMap } = this;
    if (hasDisposed) {
      return;
    }

    const event_list = eventMap.get(event);
    try {
      event_list?.slice().forEach((fn) => fn(data));
    } catch (err) {
      console.log(`call event ${event.toString()} error`, err);
    }
  }

  on<T>(event: CustomEvent<T>, callback: (data: T) => void): () => void;
  on(event: string, callback: (data: unknown) => void): () => void;
  on<T>(
    event: string | CustomEvent<T>,
    callback: (data: any) => void
  ): () => void {
    const { eventMap, hasDisposed } = this;
    if (hasDisposed) {
      return loop;
    }
    const event_list = eventMap.get(event);
    if (!event_list) {
      eventMap.set(event, [callback]);
      return () => this.off(event, callback);
    }
    if (event_list.includes(callback)) {
      console.warn("重复的添加同一个事件的触发器");
    }
    event_list.push(callback);
    return () => this.off(event, callback);
  }

  once<T>(event: CustomEvent<T>, callback: (data: T) => void): () => void;
  once(event: string, callback: (data: unknown) => void): () => void;
  once<T>(
    event: string | CustomEvent<T>,
    callback: (data: any) => void
  ): () => void {
    const off = this.on(event as any, (data) => {
      callback(data);
      off();
    });

    return off;
  }

  off(event: string | CustomEvent, callback?: (data?: any) => void) {
    const { eventMap } = this;
    let event_list = eventMap.get(event);
    if (!event_list) {
      return;
    }
    event_list = event_list.filter((fn) => fn !== callback);
    if (!event_list.length) {
      eventMap.delete(event);
      return;
    }
    eventMap.set(event, event_list);
  }

  dispose() {
    this.hasDisposed = true;
    this.eventMap.clear();
  }
}

export const useEvnet = () => {
  const eventBus = new EventBus();

  onScopeDispose(() => {
    eventBus.dispose();
  });

  return {
    dispatch: eventBus.dispatch,
    on: eventBus.on,
    once: eventBus.once,
  };
};

export const useSafeOn = (on: FnOn) => {
  const waitOff: (() => void)[] = [];
  const safeOn: FnOn = (
    event: string | CustomEvent,
    cb: (data?: any) => void
  ) => {
    const off = on(event as any, cb);
    waitOff.push(off);
    return () => {
      off();
      const idx = waitOff.findIndex((i) => i === off);
      waitOff.splice(idx, 1);
    };
  };

  onScopeDispose(() => {
    waitOff.forEach((fn) => fn());
    waitOff.length = 0;
  });

  return safeOn;
};

export const eventBus = new EventBus();
