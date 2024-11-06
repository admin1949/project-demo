import { App, Directive } from "vue";

// eslint-disable-next-line @typescript-eslint/no-empty-function
function loop() {}
const dragDataMap = new WeakMap<
  HTMLElement,
  {
    key: string;
    data: any;
  }
>();

const DROP_TARGE_ALL = "*";
const resolveDragData = (value: any) => {
  const res = {
    key: DROP_TARGE_ALL,
    data: null,
  };
  if (typeof value !== "object") {
    res.data = value;
  } else {
    const { key, data } = value;
    if (!key) {
      res.data = value;
    } else {
      res.data = data;
      res.key = key;
    }
  }
  return res;
};

const dropTargeMap = new WeakMap<
  HTMLElement,
  {
    off: () => void;
    setKey: (key: string) => void;
  }
>();
const resolveDropData = (value = DROP_TARGE_ALL) => {
  const type = typeof value;
  if (!["string", "number", "symbol"].includes(type)) {
    if (!Array.isArray(value)) {
      throw new Error(
        "drop key type can only string, number, symbol, Array, get:" + type
      );
    }
  }
  return value;
};

const baseDispatchEvent = (name: string, target: EventTarget, data: any) => {
  const event = new CustomEvent(name, { detail: data });
  event.stopPropagation = event.preventDefault;
  return !target.dispatchEvent(event);
};

const dispatchEvent = (name: string, event: DragEvent) => {
  let hasStoped = false;
  if (data) {
    const { clientY: top, clientX: left } = event;
    hasStoped = baseDispatchEvent(name, event.currentTarget!, {
      data: data.data,
      dropKye: data.key,
      position: {
        top,
        left,
      },
    });
  }
  if (hasStoped) {
    event.stopPropagation();
  }
};

/**
 *
 * @param {Element} el
 * @param {string} dropTargetKey
 * @returns
 */
const bindDropTarget = (el: HTMLElement, dropTargetKey: string | string[]) => {
  let canDrop = false;
  let hasEnter = false;
  /**
   *
   * @param {DragEvent} event
   */
  const cheakCanDrop = () => {
    if (typeof dropTargetKey === "string") {
      if (dropTargetKey === DROP_TARGE_ALL) {
        return true;
      }
    } else if (dropTargetKey.includes(DROP_TARGE_ALL)) {
      return true;
    }
    if (!data) {
      return true;
    }
    const { key } = data;
    if (key === DROP_TARGE_ALL) {
      return true;
    }
    if (typeof dropTargetKey !== "string") {
      return dropTargetKey.includes(key);
    }
    return dropTargetKey === key;
  };
  const dragover = (event: DragEvent) => {
    if (canDrag && canDrop) {
      event.preventDefault();
      dispatchEvent("sourceover", event);
    }
  };
  let lastel: EventTarget | null = null;
  const dragenter = (event: DragEvent) => {
    lastel = event.target;
    if (hasEnter) {
      return;
    }
    canDrop = cheakCanDrop();
    if (canDrag && canDrop) {
      dispatchEvent("sourceenter", event);
      hasEnter = true;
    }
    // highlight potential drop target when the draggable element enters it
  };
  const dragleave = (event: DragEvent) => {
    if (!hasEnter) {
      return;
    }
    const isSelf = event.target === lastel;
    if (canDrag && canDrop && isSelf) {
      dispatchEvent("sourceleave", event);
      canDrop = false;
      hasEnter = false;
    }
  };
  const drop = (event: DragEvent) => {
    if (canDrag && canDrop) {
      event.preventDefault();
      dispatchEvent("sourcedrop", event);
      canDrop = false;
      hasEnter = false;
    }
  };
  /* 发生在接收拖动的元素上 */
  el.addEventListener("dragover", dragover, false);
  el.addEventListener("dragenter", dragenter, false);
  el.addEventListener("dragleave", dragleave, false);
  el.addEventListener("drop", drop, false);

  const off = () => {
    el.removeEventListener("dragover", dragover, false);
    el.removeEventListener("dragenter", dragenter, false);
    el.removeEventListener("dragleave", dragleave, false);
    el.removeEventListener("drop", drop, false);
  };
  const setKey = (value: string) => {
    dropTargetKey = value;
  };
  return {
    off,
    setKey,
  };
};

const cheakCanDrag = (event: DragEvent) => {
  const canDrag = dragDataMap.has(event.target as HTMLElement);
  return canDrag;
};
let canDrag = false;
let data: any = null;
/* 发生在触发拖动的元素上 */
document.addEventListener("drag", loop, false);

document.addEventListener(
  "dragstart",
  function (event) {
    canDrag = cheakCanDrag(event);
    if (canDrag) {
      data = dragDataMap.get(event.target as HTMLElement);
    } else {
      data = null;
    }
  },
  false
);

document.addEventListener("dragend", loop, false);

export const drag: Directive = {
  mounted(el: HTMLElement, binding: any) {
    dragDataMap.set(el, resolveDragData(binding.value));
    el.setAttribute("draggable", "true");
  },
  unmounted(el: HTMLElement) {
    dragDataMap.delete(el);
  },
  beforeUpdate(el: HTMLElement, binding) {
    dragDataMap.set(el, resolveDragData(binding.value));
  },
};

export const drop: Directive = {
  mounted(el: HTMLElement, binding: any) {
    dropTargeMap.set(el, bindDropTarget(el, resolveDropData(binding.value)));
  },
  unmounted(el: HTMLElement) {
    if (dropTargeMap.has(el)) {
      const { off } = dropTargeMap.get(el)!;
      off();
      dropTargeMap.delete(el);
    }
  },
  beforeUpdate(el: HTMLElement, binding) {
    if (dropTargeMap.has(el)) {
      const { setKey } = dropTargeMap.get(el)!;
      setKey(resolveDropData(binding.value));
    }
  },
};

export const install = (app: App) => {
  app.directive("drag", drag);
  app.directive("drop", drop);
};
