import {
  isX6GraphFreeNode,
  isX6GraphToolNode,
  XmindToolGraph,
  XmindNode,
  isX6GraphNode,
  XmindCellData
} from "@eric/antv-xmind";
import { GroupTool } from "../graphToolNode/group";
import { Summary } from "../graphToolNode/summary";
import { Root } from "../node/topic";

export const useToolNode = (config: { xmindToolGraph: XmindToolGraph }) => {
  const { xmindToolGraph } = config;

  const resolveSelecteGroup = (): XmindNode[][] => {
    const selectedCells = xmindToolGraph.xmindGraph
      ?.getGraph()
      ?.getSelectedCells()
      .filter((i) => i.isNode())
      .map((node) => {
        return node.getData<XmindCellData>().getVNode?.();
      })
      .filter((vnode) => {
        // 过滤工具节点
        return isX6GraphNode(vnode) && !isX6GraphToolNode(vnode);
      });

    if (!selectedCells) {
      return [];
    }

    // 根据父节点分组
    const selectedVNodes = selectedCells.filter((vnode) => {
      const id = vnode.id;
      if (isX6GraphFreeNode(vnode)) {
        return true;
      }

      return !selectedCells.some((otherVNode) => {
        // 跳过本身
        if (otherVNode.id === id) {
          return false;
        }

        // 递归其他节点父节点，如果当前节点是某个其他节点的后代，则过滤掉当前节点
        let parent = vnode.parent;
        while (parent) {
          if (parent.id === otherVNode.id) {
            return true;
          }
          parent = parent.parent;
        }
        return false;
      });
    });

    const res: XmindNode[][] = [];
    selectedVNodes.forEach((vnode) => {
      const hasSameParent = res.some((vnodes) => {
        if (isX6GraphFreeNode(vnode)) {
          return false;
        }
        if (isX6GraphFreeNode(vnodes[0])) {
          return false;
        }
        const parent = vnode.parent;
        if (
          parent &&
          parent.type !== Root.type &&
          vnodes[0].parent?.id === vnode.parent?.id
        ) {
          vnodes.push(vnode);
          return true;
        }
        return false;
      });

      if (hasSameParent) {
        return;
      }

      res.push([vnode]);
    });
    return res;
  };

  // 不能跨父节点创建群组
  const createGroup = () => {
    const selectedGroup = resolveSelecteGroup();
    if (!selectedGroup.length) {
      return;
    }

    selectedGroup.forEach((group) => {
      const meatData = GroupTool.getTemplate();
      meatData.connectNodeIds = group.map((i) => i.id);
      xmindToolGraph.addTool(meatData);
    });
  };

  // 不能跨父节点创建概要
  const createSummary = () => {
    const selectedGroup = resolveSelecteGroup();
    if (!selectedGroup.length) {
      return;
    }
    selectedGroup.forEach((group) => {
      const meatData = Summary.getTemplate();
      meatData.connectNodeIds = group.map((i) => i.id);
      xmindToolGraph?.addTool(meatData);
    });
  };

  return {
    createGroup,
    createSummary,
  };
};
