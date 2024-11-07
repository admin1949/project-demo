import {
  XmindNode,
  XmindGraph,
  isX6GraphFreeNode,
  XmindToolGraph,
  isX6GraphNode,
  X6GraphVNode,
  XMIND_EVENT,
  Point,
  PositiondTree,
  CoveredTreeInfo,
} from "@eric/antv-xmind";
import { XmindCellData } from "@eric/antv-xmind/vue";
import { Edge, NodeView } from "@antv/x6";
import { Branch } from "../node/branch";
import { FreeNode } from "../node/freeNode";
import { useX6Graph } from "./useX6Graph";
import { TempAddNode } from "../node/TempAddNode";

export const useFreeNode = (config: {
  xmindGraph: XmindGraph;
  xmindToolGraph: XmindToolGraph;
}) => {
  const { xmindGraph, xmindToolGraph } = config;

  const allMoveNode = [Branch.type, FreeNode.type];

  const isCanMoveNode = (e: NodeView.PositionEventArgs<any>) => {
    const vnode = e.node.getData<XmindCellData>().getVNode?.();
    if (!isX6GraphNode(vnode)) {
      return false;
    }

    if (vnode.isEdit) {
      return false;
    }

    return allMoveNode.includes(vnode.type);
  };

  let isFirstMove = false;
  let moveNode: XmindNode[] = [];
  let touchNodeIdx = -1;
  let freezeNode: XmindNode[] = [];

  let positionTree: null | PositiondTree[] = null;
  let lastPosition: Point[] = [];

  let lastParent: X6GraphVNode | null = null;
  let willParent: X6GraphVNode | null = null;
  let coveredTreeInfo: CoveredTreeInfo | null = null;
  let tempAddNode: TempAddNode | null = null;

  // 开始拖动时，冻结当前节点及所有子节点，创建一个新的节点用于拖动展示
  const startMove = () => {
    if (isFirstMove) {
      return;
    }
    isFirstMove = true;
    const idx = touchNodeIdx;
    if (!freezeNode.length || idx < 0) {
      lastPosition = [];
      moveNode = [];
      freezeNode = [];
      touchNodeIdx = -1;
      return;
    }

    console.log("开始自由节点移动!");
    const positions: Point[] = [];
    moveNode = freezeNode.map((vnode, idx) => {
      const clone = vnode.copy();
      clone.parent = null;
      clone.layoutDone = true;
      clone.width = vnode.width;
      clone.height = vnode.height;

      clone.mount(xmindGraph, new Set(), false);
      clone.el?.setZIndex(10000);
      const { x, y } = vnode;
      positions[idx] = [x, y];
      vnode.freeze(true);
      clone.el?.setPosition(x, y);

      return clone;
    });

    lastPosition = positions;
    positionTree = [
      ...xmindGraph.layoutInstance.minaTreePosition,
      ...xmindGraph.layoutInstance.freeNodesPositonTrees,
    ];
  };

  const nodeMove = () => {
    const lastPoint = lastPosition[touchNodeIdx];
    const vnode = moveNode[touchNodeIdx];

    if (!moveNode.length || !freezeNode.length || !lastPoint || !vnode) {
      return;
    }
    const status = xmindGraph.layoutInstance.findChildPosition(
      positionTree,
      [
        lastPoint[0],
        lastPoint[1],
        lastPoint[0] + (vnode.width || 0),
        lastPoint[1] + (vnode.height || 0),
      ],
      freezeNode.map((i) => i.id)
    );

    if (!status) {
      if (coveredTreeInfo) {
        coveredTreeInfo = null;
      }

      if (willParent) {
        willParent.data.isWillParent = false;
        willParent = null;
      }

      if (tempAddNode) {
        tempAddNode.unMount(new Set());
        tempAddNode = null;
      }

      return;
    }

    coveredTreeInfo = status;
    if (!tempAddNode) {
      tempAddNode = new TempAddNode(
        TempAddNode.getTemplate(),
        status.coverTree.vnode
      );
      tempAddNode.nodePosition!.dir = coveredTreeInfo.dir;
      tempAddNode.mount(xmindGraph, new Set(), false);
      tempAddNode.connectToParent();
    } else {
      tempAddNode.setParetn(status.coverTree.vnode);
      tempAddNode.nodePosition!.dir = status.dir;
      tempAddNode.connectToParent();
    }

    if (tempAddNode.el) {
      const [x, y] = xmindGraph.layoutInstance.getTempNodePosition(
        tempAddNode,
        coveredTreeInfo
      );
      tempAddNode.el.setPosition({ x, y });
    }

    if (willParent === coveredTreeInfo.coverTree.vnode) {
      return;
    }

    willParent && (willParent.data.isWillParent = false);
    willParent = status.coverTree.vnode;
    willParent.data.isWillParent = true;
  };

  const endMove = () => {
    const copyNodes = moveNode;
    const touchNode = freezeNode[touchNodeIdx];
    if (!freezeNode.length || !copyNodes.length || !touchNode) {
      lastPosition = [];
      return;
    }

    if (tempAddNode) {
      tempAddNode.unMount(new Set());
      tempAddNode = null;
    }

    console.log("覆盖的节点：", willParent);
    if (lastParent) {
      lastParent.data.isLastParent = false;
      lastParent = null;
    }

    if (willParent) {
      willParent.data.isWillParent = false;
      willParent = null;
    }

    const vnodes = filterChild(freezeNode);
    vnodes.forEach((vnode) => vnode.unFreeze(true));
    copyNodes.forEach((vnode) => vnode.unMount(new Set()));

    // 当前节点移动的位置存在合理的父节点，将当前节点移动到此父节点
    if (coveredTreeInfo) {
      const childIdx = xmindGraph.layoutInstance.offsetChildIdx(
        vnodes,
        coveredTreeInfo
      );
      const changedIds = new Map<string, string>();

      const newNodes = vnodes.map((vnode) => {
        removeToParent(vnode);

        if (!isX6GraphFreeNode(vnode)) {
          vnode.parent = coveredTreeInfo!.coverTree.vnode;
          vnode.connectToParent();
          return vnode;
        } else {
          const newNode = FreeNode.transformToBasicNode(vnode);
          vnode.children = [];
          vnode.unMount(new Set());
          newNode.parent = coveredTreeInfo!.coverTree.vnode;
          newNode.mount(xmindGraph, new Set());
          changedIds.set(vnode.id, newNode.id);
          return newNode;
        }
      });

      xmindGraph.layoutInstance.addVnodeToParent(
        newNodes,
        coveredTreeInfo.coverTree.vnode,
        childIdx
      );

      if (changedIds.size) {
        xmindToolGraph.onChangeNodes(changedIds);
        xmindToolGraph.refreshToolGraph();
      }
      xmindGraph.refreshMap();
      xmindGraph.dispatch(XMIND_EVENT.NODE_CHANGE);
      return;
    }

    // 当前位置不存在合理的父节点，将此阶段转化为自由节点
    const freeNodeIds: string[] = [];
    const changedIds = new Map<string, string>();
    const removeEdges: Edge[] = [];

    vnodes.forEach((vnode) => {
      const idx = freezeNode.findIndex((node) => node.id === vnode.id);
      if (idx < 0) {
        console.warn("自由节点移动报错")
      }
      if (isX6GraphFreeNode(vnode)) {
        vnode.dropPoint = [...lastPosition[idx]];
        freeNodeIds.push(vnode.id);
        return;
      }

      const currentFreeNode = FreeNode.transformToFreeNode(vnode);
      removeToParent(vnode);

      vnode.children.forEach((child) => {
        if (child.toParentEdge) {
          removeEdges.push(child.toParentEdge);
          child.toParentEdge = null;
        }
      });

      vnode.children = [];
      vnode.unMount(new Set());
      currentFreeNode.mount(xmindGraph, new Set());
      const root = xmindGraph.getVodeTree();
      if (root) {
        root.children.push(currentFreeNode);
        currentFreeNode.parent = root;
        if (root.originInitData.children) {
          root.originInitData.children.push(currentFreeNode.originInitData);
        } else {
          root.originInitData.children = [currentFreeNode.originInitData];
        }
      }

      const node = currentFreeNode.el;
      const point = lastPosition[idx];
      if (node?.isNode()) {
        node.setPosition(point[0], point[1]);
      }
      currentFreeNode.dropPoint = [...point];
      freeNodeIds.push(currentFreeNode.id);
      changedIds.set(vnode.id, currentFreeNode.id);
    });

    if (changedIds.size) {
      xmindToolGraph.onChangeNodes(changedIds);
      xmindToolGraph.refreshToolGraph();
    }
    if (freeNodeIds.length) {
      xmindGraph.dropFreeNodeEnd(freeNodeIds);
    }
    if (removeEdges.length) {
      xmindGraph.getGraph()?.removeCells(removeEdges);
    }

    xmindGraph.dispatch(XMIND_EVENT.NODE_CHANGE);
    xmindGraph.layout();
  };

  const createFreeNode = (position: { x: number; y: number }) => {
    const root = xmindGraph.getData();
    const template = FreeNode.getTemplate();
    template.data = {
      text: "自由节点",
    };

    template.dropPoint = [position.x - 70, position.y - 27];

    if (root) {
      if (root.children) {
        root.children.push(template);
      } else {
        root.children = [template];
      }
    }

    xmindGraph.freeNodeIdDropHistory.push(template.id);
    xmindGraph.dispatch(XMIND_EVENT.NODE_CHANGE);
    xmindGraph.refreshMap();
  };

  useX6Graph(config, (graph) => {
    if (!graph) {
      return;
    }

    let offset: Point[] = [];

    graph.on("node:mousedown", (e) => {
      if (!isCanMoveNode(e)) {
        return;
      }

      const vnodes =
        graph
          .getSelectedCells()
          .filter((i) => i.isNode())
          .map((i) => i.getData<XmindCellData>()?.getVNode())
          .filter((i) => i && allMoveNode.includes(i.type)) || [];
      const current = e.node.getData<XmindCellData>().getVNode();
      if (!isX6GraphNode(current) || !allMoveNode.includes(current.type)) {
        return;
      }
      let idx = vnodes.findIndex((i) => i.id === current.id);
      if (!vnodes.length || idx === -1) {
        vnodes.push(current);
        idx = vnodes.length - 1;
      }
      freezeNode = vnodes;
      touchNodeIdx = idx;
      offset = freezeNode.map((i) => {
        return [i.x - e.x, i.y - e.y];
      });
    });

    graph.on("node:mousemove", (e) => {
      if (!isCanMoveNode(e)) {
        return;
      }
      startMove();
      lastPosition.forEach((point, idx) => {
        const x = e.x + offset[idx][0];
        const y = e.y + offset[idx][1];

        // 添加偏移量，保留当前节点的左上角距离鼠标的位置
        moveNode[idx].el?.setPosition(x, y);
        point[0] = x;
        point[1] = y;
      });
      nodeMove();
    });

    graph.on("node:mouseup", (e) => {
      if (!isCanMoveNode(e)) {
        return;
      }
      if (!isFirstMove) {
        return;
      }
      isFirstMove = false;
      endMove();
      // checkNodePosition(e.node.getBBox());
      positionTree = null;
    });

    graph.on("blank:dblclick", (e) => {
      createFreeNode(e);
    });
  });

  return {};
};

const removeToParent = (vnode: X6GraphVNode) => {
  const parent = vnode.parent;

  if (parent) {
    parent.children = parent.children.filter((node) => node.id !== vnode.id);
    parent.originInitData.children = (
      parent.originInitData.children || []
    ).filter((node) => {
      return node.id !== vnode.id;
    });
  }
};

const filterChild = <T extends X6GraphVNode>(list: T[]) => {
  const ids = new Set(list.map((i) => i.id));
  return list.filter((item) => {
    const used = new Set();
    used.add(item.id);
    let parent = item.parent;

    while (parent) {
      const id = parent.id;
      if (ids.has(id) || used.has(id)) {
        return false;
      }
      used.add(id);
      parent = parent.parent;
    }
    return true;
  });
};
