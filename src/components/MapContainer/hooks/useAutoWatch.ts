import { onUnmounted, watch } from "vue";

type MethodName<T extends string> = `set${Capitalize<T>}`;
type SimpleType = number | string | boolean | undefined | null | RegExp;

type MethodKey<T, K extends Record<string, any>> = {
  [key in keyof T]: key extends string
    ? K[MethodName<key>] extends (val: NonNullable<T[key]>) => any
      ? key
      : null
    : null;
}[keyof T];

type Value<
  O extends Record<string, any>,
  K extends string
> = O[MethodName<K>] extends (val: infer R) => any ? R : void;

// type Getter<P, T extends Object, K extends keyof P & string, R = Value<T, K & string>> = R extends SimpleType
//   ? R | (() => R)
//   : () => R;

type DefaultValue<
  P,
  I extends Object,
  L extends NonNullable<MethodKey<P, I>>
> = {
  [K in NonNullable<L>]?: Value<I, K> extends SimpleType
    ? Value<I, K> | (() => Value<I, K>)
    : () => Value<I, K>;
};

export const autoWatch = <
  T extends Object,
  K extends Object,
  L extends NonNullable<MethodKey<T, K>>
>(
  props: T,
  instance: K | null | undefined,
  watch_map: DefaultValue<T, K, L>
) => {
  const getMethodName = (key: L) => {
    return `set${key[0].toUpperCase()}${key.slice(1)}` as keyof K;
  };
  const get_default_value = (default_value: any) => {
    if (typeof default_value === "function") {
      return default_value();
    }
    return default_value;
  };

  const off_List = Object.entries(watch_map).map(([key, default_value]) => {
    return watch(
      () => props[key as keyof T],
      (val) => {
        const fn = instance?.[getMethodName(key as L)];
        if (typeof fn === "function") {
          (fn as Function).call(
            instance,
            val ?? get_default_value(default_value)
          );
        }
      }
    );
  });

  const stopWatch = () => {
    off_List.forEach((fn) => fn());
    off_List.length = 0;
  };

  onUnmounted(stopWatch);

  return {
    stopWatch,
  };
};
