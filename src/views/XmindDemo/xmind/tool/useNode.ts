import { Branch } from "../node/branch";
import {
  isXmindToolNode,
  XmindGraph,
  XmindToolGraph,
  isX6GraphFreeNode,
  createNodeMeatData,
  XmindNode,
  isX6GraphNode,
  resolveAutoChildenNodeType,
  VectroyRootNode,
  eachChild,
  XmindCellData, XmindToolData
} from "@eric/antv-xmind";
import { Root } from "../node/topic";
import { FreeNode } from "../node/freeNode";

const resolveChildIds = (node: XmindNode, allIds = new Set<string>()) => {
  eachChild([node], () => {
    allIds.add(node.id);
  });
  return allIds;
};

const deepCopyVNode = (
  node: XmindNode,
  parent: XmindNode,
  idMap: Map<string, string>
) => {
  const newNode = node.copy();
  newNode.parent = parent;

  idMap.set(node.id, newNode.id);
  newNode.children = node.children
    .filter((node) => !isX6GraphFreeNode(node))
    .map((child) => deepCopyVNode(child, newNode, idMap));
  return newNode;
};

export const useNode = (config: {
  xmindGraph: XmindGraph;
  xmindToolGraph: XmindToolGraph;
}) => {
  const { xmindGraph, xmindToolGraph } = config;

  const addRoot = () => {
    const data = xmindGraph.getData();
    if (!data) {
      return;
    }
    if (!data.children) {
      data.children = [Root.getTemplate()];
    } else {
      data.children.push(Root.getTemplate());
    }
    xmindGraph.refreshMap();
  };

  const createAutoChild = (parent: XmindNode | null) => {
    if (!parent) {
      return;
    }

    const childName = resolveAutoChildenNodeType(parent);
    if (!childName) {
      console.log("can not find this node children", parent);
      return;
    }

    const meatData = createNodeMeatData(childName);
    if (!meatData) {
      return;
    }
    let text = "主题";
    if (parent.type === Root.type) {
      text = "分支主题";
    } else if (parent.type === FreeNode.type || parent.type === Branch.type) {
      text = "子主题";
    }
    if (meatData.data) {
      meatData.data.text = text + (parent.children.length + 1);
    } else {
      meatData.data = {
        text: text + (parent.children.length + 1),
      };
    }

    if (parent.originInitData.children) {
      parent.originInitData.children.push(meatData);
    } else {
      parent.originInitData.children = [meatData];
    }
    if (parent.hideChild) {
      parent.hideChild = false;
      parent.showChildren();
    }
    xmindGraph.refreshMap();
  };

  const addChild = () => {
    const graph = xmindGraph.getGraph();
    if (!graph) {
      console.log("no Graph Item");
      return;
    }
    const selectedNode = graph
      .getSelectedCells()
      .filter((cell) => cell.isNode());
    if (!selectedNode.length) {
      console.log("no selected Nodes");
      return;
    }
    [selectedNode[0]].forEach((node) => {
      const data = node.getData<XmindCellData>();
      createAutoChild(data?.getVNode());
    });
  };

  const addSublin = () => {
    const graph = xmindGraph.getGraph();
    if (!graph) {
      console.log("no Graph Item");
      return;
    }
    const selectedNode = graph
      .getSelectedCells()
      .filter((cell) => cell.isNode());
    if (!selectedNode.length) {
      console.log("no selected Nodes");
      return;
    }
    [selectedNode[0]].forEach((node) => {
      const data = node.getData<XmindCellData>();
      createAutoChild(data?.getVNode().parent as XmindNode);
    });
  };

  const deleteCells = () => {
    console.log("startDelete Cell");
    const graph = xmindGraph.getGraph();
    if (!graph) {
      return;
    }

    const selectedNodes = graph
      .getSelectedCells()
      .filter((item) => item && item.isNode());

    const selectOther = graph
      .getSelectedCells()
      .filter((item) => item && !item.isNode());

    selectOther?.forEach((cell) => {
      // 备注：目前删除连接线，后期扩展可能会有异常
      if (cell.data?.type === "CONNECTLINE") {
        cell.remove();
      }
    });

    if (selectedNodes.length) {
      const deleteIds: Set<string> = new Set();
      let hasChangeNode = false;
      let hasChangeToolNode = false;
      selectedNodes.forEach((item) => {
        const { getVNode } = item.getData<XmindCellData | XmindToolData>();
        const vnode = getVNode();
        let idx = -1;
        if (!isXmindToolNode(vnode)) {
          resolveChildIds(vnode, deleteIds);
          if (!vnode.parent) {
            return;
          }
          vnode.parent.originInitData.children = (
            vnode.parent.originInitData.children || []
          ).filter((i) => i.id !== vnode.id);
          hasChangeNode = true;
        } else {
          if (!xmindToolGraph?.data) {
            return;
          }
          idx = xmindToolGraph.data.findIndex((tool) => tool.id === vnode.id);
          xmindToolGraph?.data.splice(idx, 1);
          hasChangeToolNode = true;
        }
      });

      if (hasChangeNode) {
        xmindToolGraph.onDeleteNodes(deleteIds);
        xmindGraph.refreshMap();
      }

      if (hasChangeToolNode) {
        xmindToolGraph.refreshToolGraph();
      }
    }
  };

  const editCell = () => {
    const graph = xmindGraph.getGraph();
    const selectedNodes = graph
      ?.getSelectedCells()
      .filter((item) => item.isNode());

    if (!selectedNodes?.length) {
      return;
    }

    selectedNodes.some((item) => {
      const vnode = item.getData<XmindCellData>()?.getVNode();
      if (isX6GraphNode(vnode)) {
        if (vnode.enterEdit) {
          if (vnode.isEdit) {
            return true;
          }

          setTimeout(() => {
            vnode.enterEdit!();
          }, 16);
          return true;
        }
      }
      return false;
    });
  };

  let useSelectedNodes: XmindNode[] | null = [];
  let isCut = false;

  const copyCells = () => {
    console.log("copied Cells");
    const graph = xmindGraph.getGraph();
    // 获取当前主题及之后的所有主题
    const selectedNodes = graph
      ?.getSelectedCells()
      .filter((item) => item.isNode());

    if (!selectedNodes || !selectedNodes.length) {
      return;
    }

    const idSet = new Set<string>();
    useSelectedNodes = selectedNodes
      .map((node) => {
        const vnode = node.getData<XmindCellData>().getVNode();
        console.log("基础复制节点");
        resolveChildIds(vnode, idSet);
        return vnode;
      })
      .filter((vnode) => isX6GraphNode(vnode));
  };

  const pasteCells = () => {
    if (!useSelectedNodes || !useSelectedNodes.length) {
      return;
    }

    console.log("paste Cells");
    const graph = xmindGraph.getGraph();
    const selectedNodes = graph
      ?.getSelectedCells()
      .filter((item) => item.isNode());

    if (!selectedNodes || !selectedNodes.length) {
      return;
    }

    const copyIds = new Map<string, string>();
    selectedNodes.forEach((node) => {
      if (!useSelectedNodes?.length) {
        return;
      }
      const parent = node.getData<XmindCellData>()?.getVNode();
      if (!parent) {
        return;
      }

      const waitAppendChilds = useSelectedNodes.map((node) => {
        if (!isX6GraphFreeNode(node)) {
          const newNode = deepCopyVNode(node, parent, copyIds).toJson();
          newNode.data = {
            text: newNode.data?.text || "",
          };
          return newNode;
        }

        const template = Branch.getTemplate();
        template.data = {
          text: node.data.text || "",
        };

        const newVNode = new Branch(template, parent);
        newVNode.children = node.children;
        const res = deepCopyVNode(newVNode, parent, copyIds).toJson();
        const rootId = copyIds.get(newVNode.id)!;
        copyIds.delete(newVNode.id);
        copyIds.set(node.id, rootId);
        return res;
      });

      parent.originInitData.children = [
        ...(parent.originInitData.children || []),
        ...waitAppendChilds,
      ];
    });

    if (isCut) {
      useSelectedNodes.forEach(({ parent, id }) => {
        if (!parent) {
          return;
        }
        parent.originInitData.children = (
          parent.originInitData.children || []
        ).filter((i) => i.id !== id);
      });
    }

    xmindGraph.refreshMap();
    xmindToolGraph.onCopyNodes(copyIds);
    setTimeout(() => {
      xmindToolGraph.refreshToolGraph();
    }, 16);
    // 此处控制是否只能粘贴一次
    if (isCut) {
      isCut = false;
      useSelectedNodes = null;
    }
  };

  const cutCells = () => {
    console.log("shear Cells");
    const graph = xmindGraph.getGraph();
    const selectedNodes = graph
      ?.getSelectedCells()
      .filter((item) => item?.isNode());
    if (!selectedNodes?.length) {
      return;
    }
    isCut = true;

    const idSet = new Set<string>();
    const selectedVNode = selectedNodes
      .filter((node) => {
        const vnode = node.getData<XmindCellData>().getVNode();
        const parent = vnode.parent;
        // 根节点不能剪切
        if (
          !parent ||
          parent.type === VectroyRootNode.type ||
          !isX6GraphNode(vnode)
        ) {
          return false;
        }
        return true;
      })
      .map((node) => {
        const vnode = node.getData<XmindCellData>().getVNode();
        return vnode;
      });

    useSelectedNodes = selectedVNode;

    selectedVNode.forEach((vnode) => {
      resolveChildIds(vnode, idSet);
      vnode.data.willCut = true;
    });
  };

  return {
    addChild,
    addRoot,
    addSublin,
    deleteCells,
    copyCells,
    pasteCells,
    cutCells,
    editCell,
  };
};
