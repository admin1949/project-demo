declare module "@antv/hierarchy" {
  // eslint-disable-next-line import/no-duplicates
  import type { Node } from "@antv/x6";
  interface Obj {
    children?: Obj[];
    [k: string]: any;
  }

  type ChildsKey<T extends Obj> = {
    [K in keyof T]: T[K] extends any[] ? K & string : null;
  }[keyof T];

  /** 树的构建工具类型 */
  export type Tree<
    T extends Obj,
    K extends ChildsKey<T>,
    R extends boolean = false
  > = T &
    (R extends false
      ? {
          [key in K & string]?: Tree<T, K, R>[];
        }
      : {
          [key in K & string]: Tree<T, K, R>[];
        });

  export interface HierarchyResult<T> {
    id: string;
    x: number;
    y: number;
    data: T;
    children: HierarchyResult<T>[];
  }

  export interface ExecOptions<M, T> {
    direction: M;
    getHeight: (d: T) => number;
    getWidth: (d: T) => number;
    getHGap: (d: T) => number;
    getVGap: (d: T) => number;
    getSide: () => "right" | "left" | "top" | "buttom";
  }

  type execFunction<M> = <T>(
    data: Tree<T>,
    opt: ExecOptions<M, T>
  ) => HierarchyResult;

  export type CompactBoxDirs = "LR" | "RL" | "H" | "TB" | "BT" | "V";

  export const mindmap: execFunction<"H" | "LR" | "TB">;

  export const compactBox: execFunction<CompactBoxDirs>;
  export const dendrogram: execFunction<"LR" | "RL" | "H" | "TB" | "BT" | "V">;
  export const indented: execFunction<"LR" | "RL" | "H">;
}
