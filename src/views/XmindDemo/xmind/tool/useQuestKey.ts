import { useNode } from "./useNode";
import { CellView, Graph } from "@antv/x6";
import {
  ICellData,
  isX6GraphNode,
  XmindGraph,
  XmindToolGraph,
  isX6GraphFreeNode,
  VectroyRootNode,
  BaseNode,
  X6GraphVNode,
  showNode,
} from "@eric/antv-xmind";
import { useX6Graph } from "./useX6Graph";
import { Root } from "../node/topic";

const getActiveSheetLock = () => false;
enum MOVE_DIR {
  UP,
  RIGHT,
  DOWN,
  LEFT,
}
const findBrother = (node: BaseNode, isUp = true) => {
  let parent = node.parent;
  let i = 1;
  const offset = isUp ? -1 : 1;
  let nextIdx = 0;

  while (parent) {
    const childs =
      parent.type === VectroyRootNode.type
        ? parent.children.filter((i) => !isX6GraphFreeNode(i))
        : parent.children;
    const idx = childs.findIndex((i) => i.id === node.id);
    const len = childs.length;

    nextIdx = idx + offset;
    if (nextIdx >= 0 && nextIdx < len) {
      break;
    }
    node = parent;
    parent = parent.parent;
    i++;
  }

  if (!parent) {
    return null;
  }

  while (i > 0) {
    const childs: X6GraphVNode[] =
      parent.type === VectroyRootNode.type
        ? parent.children.filter((i) => !isX6GraphFreeNode(i))
        : parent.children;
    const brother = childs[nextIdx];

    if (!brother) {
      return null;
    }

    const len = brother.children.length;
    if (!len) {
      return brother;
    }

    nextIdx = isUp ? len - 1 : 0;
    parent = brother;
    i--;
  }

  return parent;
};

const getNextNode = (graph: Graph, dir: MOVE_DIR) => {
  const selected = graph
    .getSelectedCells()
    .filter((cell) => cell.isNode())
    .map((i) => i.getData<ICellData>()?.getVNode())
    .filter((i) => isX6GraphNode(i));

  if (selected.length !== 1) {
    return null;
  }
  const node = selected[0];
  if (dir === MOVE_DIR.UP) {
    return findBrother(node, true);
  }

  if (dir === MOVE_DIR.RIGHT) {
    const len = node.children.length;
    if (!len) {
      return null;
    }
    if (len === 1) {
      return node.children[0];
    }
    if (len % 2) {
      return node.children[Math.floor(len / 2)];
    }
    return node.children[Math.floor(len / 2) - 1];
  }

  if (dir === MOVE_DIR.LEFT) {
    if (isX6GraphFreeNode(node)) {
      return null;
    }
    const parent = node.parent;
    if (!parent || parent.type === VectroyRootNode.type) {
      return null;
    }
    return parent;
  }

  if (dir === MOVE_DIR.DOWN) {
    return findBrother(node, false);
  }
  return null;
};

const moveSelect = (graph: Graph, dir: MOVE_DIR) => {
  const nextNode = getNextNode(graph, dir);
  if (!nextNode) {
    return;
  }

  if (nextNode.el) {
    graph.resetSelection(nextNode.el);
    showNode(graph, nextNode.el);
  }
};

export const useQuestKey = (config: {
  xmindGraph: XmindGraph;
  xmindToolGraph: XmindToolGraph;
}) => {
  const {
    addChild,
    addSublin,
    deleteCells,
    copyCells,
    pasteCells,
    cutCells,
    editCell,
  } = useNode(config);

  useX6Graph(config, (graph) => {
    if (!graph) {
      return;
    }
    graph.bindKey(["backspace", "delete"], () => {
      const lock = getActiveSheetLock();
      if (lock) {
        return;
      }
      deleteCells();
    });
    /**
     * 交互逻辑
     * 选中主题，无限添加子主题
     */
    graph.bindKey(["tab", "ins"], (e) => {
      const lock = getActiveSheetLock();
      if (lock) {
        return;
      }
      e.preventDefault();
      addChild();
    });
    /**
     * 交互逻辑
     * 选中节点f2,进入节点编辑
     */
    graph.bindKey(["f2", "e"], () => {
      editCell();
    });
    /**
     * 交互逻辑
     * 选中主题，一级主题添加二级主题，二级主题添加同级主题
     */
    graph.bindKey("enter", (e) => {
      const lock = getActiveSheetLock();
      if (lock) {
        return;
      }
      e.preventDefault();
      const selectedNodes = graph
        .getSelectedCells()
        .filter((item) => item.isNode());
      if (selectedNodes.length) {
        const node = selectedNodes[0];
        const vnode = node.getData<ICellData>()?.getVNode();
        if (vnode.type === Root.type) {
          addChild();
        } else {
          addSublin();
        }
      }
    });
    /**
     * 交互逻辑
     * 拷贝 选中及之后的所有主题
     */
    graph.bindKey(["command+c", "ctrl+c"], (e) => {
      const lock = getActiveSheetLock();
      if (lock) {
        return;
      }
      e.preventDefault();
      copyCells();
    });
    /**
     * 交互逻辑
     * 粘贴拷贝 的主题到当前选中的主题内
     */
    graph.bindKey(["command+v", "ctrl+v"], (e) => {
      const lock = getActiveSheetLock();
      if (lock) {
        return;
      }
      e.preventDefault();
      pasteCells();
    });
    /**
     * 交互逻辑
     * 拷贝删除 选中的主题及之后的所有主题
     */
    graph.bindKey(["command+x", "ctrl+x"], (e) => {
      const lock = getActiveSheetLock();
      if (lock) {
        return;
      }
      e.preventDefault();
      cutCells();
    });

    graph.bindKey(["w", "up"], () => {
      moveSelect(graph, MOVE_DIR.UP);
    });
    graph.bindKey(["a", "left"], () => {
      moveSelect(graph, MOVE_DIR.LEFT);
    });
    graph.bindKey(["s", "down"], () => {
      moveSelect(graph, MOVE_DIR.DOWN);
    });
    graph.bindKey(["d", "right"], () => {
      moveSelect(graph, MOVE_DIR.RIGHT);
    });

    // 节点编辑之后自动保存
    graph.on(
      "cell:customevent",
      (
        e: CellView.MousePositionEventArgs<any> & {
          value: string;
          name: string;
        }
      ) => {
        if (e.name === "node-edit-label") {
          const node = e.cell?.getData<ICellData>();
          if (!node) {
            return;
          }
          if (e.cell.isNode()) {
            // dataItem.node.label = e.value
            // saveUpdate(graphRef);
          }
        }
      }
    );
  });
};
