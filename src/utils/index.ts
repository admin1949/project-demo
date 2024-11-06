import type { MessageBoxData } from "element-plus";

export const loop = () => {};

export const NULL = () => null;

export const resolveMessageBoxData = async (
  response: Promise<MessageBoxData>
) => {
  try {
    const res = await response;
    const action = res.action || res;
    const value = res.value || "";
    return { action, value };
  } catch {
    return {
      action: "cancel" as const,
      value: "",
    };
  }
};

export const useNextTicketFn = <T extends any[], S, R>(
  fn: (this: S, ...args: T) => R
) => {
  let waitRun = false;
  let res: Promise<R>;
  function run(this: S, ...args: T) {
    if (waitRun) {
      return res;
    }
    res = new Promise((resolve) => {
      waitRun = true;
      Promise.resolve().then(() => {
        resolve(fn.apply(this, args));
        waitRun = false;
      });
    });
    return res;
  }
  return run;
};

export const safeParseJson = <T = unknown>(str: string): T | null => {
  try {
    return JSON.parse(str) as T;
  } catch (err) {
    return null;
  }
};

const onlyKey = `${Math.random().toString(32).slice(2)}_${Date.now()}`;
export const bingOnlyKey = function* (key: string) {
  let idx = 0;
  while (true) {
    yield `${onlyKey}_${key}_${idx++}`;
  }
};
