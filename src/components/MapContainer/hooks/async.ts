type Awaitable<T> = T | Promise<T>;

export const CANCLE = "cancle";
export const ERROR = "error";
export const SUCCESS = "success";

export const lastAsync = <A extends unknown[], R>(
  fn: (...args: A) => Awaitable<R>
) => {
  let id = 0;
  return async (
    ...arg: A
  ): Promise<
    { type: "cancle" | "error"; data: null } | { type: "success"; data: R }
  > => {
    const selfId = ++id;
    try {
      const res = await fn(...arg);
      if (id !== selfId) {
        return { type: CANCLE, data: null };
      }
      return { type: SUCCESS, data: res };
    } catch (err) {
      console.log("run async function errr", err);
      return { type: ERROR, data: null };
    }
  };
};
