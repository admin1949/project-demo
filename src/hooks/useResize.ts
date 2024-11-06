import { Ref, watch, onUnmounted } from "vue";

const resizeObserver = new ResizeObserver((entrys) => {
  for (const entry of entrys) {
    const callbacks = eventMap.get(entry.target) ?? [];
    try {
      callbacks.forEach((cb) => cb());
    } catch (err) {
      console.log(err);
    }
  }
});

interface Callback {
  (): void;
}

const eventMap = new WeakMap<Element, Set<Callback>>();
const add = (dom: Element, cb: Callback) => {
  let callbacks = eventMap.get(dom);
  if (!callbacks) {
    resizeObserver.observe(dom);
    callbacks = new Set<Callback>();
    callbacks.add(cb);
    eventMap.set(dom, callbacks);
  } else {
    callbacks.add(cb);
  }
  resizeObserver.observe(dom);
};

const off = (dom: Element, cb?: Callback) => {
  if (!cb) {
    eventMap.delete(dom);
    return;
  }
  const callbacks = eventMap.get(dom);
  if (callbacks?.has(cb)) {
    callbacks.delete(cb);
  }
};

export const useResize = (dom: Ref<Element | undefined>, cb: Callback) => {
  const unWatch = watch(dom, (newDom, oldDom) => {
    if (oldDom) {
      off(oldDom, cb);
    }
    if (newDom) {
      add(newDom, cb);
    }
  });

  onUnmounted(() => {
    if (dom.value) {
      off(dom.value, cb);
    }
  });
  const offCurrent = () => {
    unWatch();
    if (dom.value) {
      off(dom.value, cb);
    }
  };
  return offCurrent;
};
