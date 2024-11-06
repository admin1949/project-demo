type ChildKey = "children" | "rwTaskSubs" | "taskComments";

/** 树的构建工具类型 */
export type Tree<
  T = object,
  K extends ChildKey = "children",
  R extends boolean = false
> = T &
  (R extends false
    ? {
        [key in K]?: Tree<T, K, R>[];
      }
    : {
        [key in K]: Tree<T, K, R>[];
      });

/** 深度优先遍历树 */
export function depthFirst<T, K extends ChildKey>(
  tree: Tree<T, K>[],
  traversal: (
    item: Tree<T, K>,
    controll: { break?: boolean }
  ) => boolean | void,
  childKey: K,
  controll?: { break?: boolean }
): boolean {
  const key = (childKey || "children") as K;
  controll = controll || {
    break: false,
  };

  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];
    const doNext = traversal(tree[i], controll);
    if (controll.break) {
      return true;
    }
    const child = item[key];
    if (child && child.length && !(typeof doNext === "boolean" && !doNext)) {
      if (depthFirst(child, traversal, childKey, controll)) {
        return true;
      }
    }
  }
  return false;
}

/** 广度优先遍历树 */
export function breadthFirst<T, K extends ChildKey>(
  tree: Tree<T, K>[],
  traversal: (
    item: Tree<T, K>,
    controll: { break?: boolean }
  ) => boolean | void,
  childKey: K,
  controll?: { break?: boolean }
): boolean {
  controll = controll || {
    break: false,
  };

  const key = (childKey || "children") as K;
  const status = new Array(tree.length);
  for (let i = 0; i < tree.length; i++) {
    status[i] = traversal(tree[i], controll);
    if (controll.break) {
      return true;
    }
  }

  for (let i = 0; i < status.length; i++) {
    const item = tree[i];
    const doNext = status[i];
    const child = item[key];
    if (child && child.length && !(typeof doNext === "boolean" && !doNext)) {
      if (breadthFirst(child, traversal, childKey, controll)) {
        return true;
      }
    }
  }
  return false;
}
