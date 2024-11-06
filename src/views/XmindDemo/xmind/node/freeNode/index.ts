import { Edge, Graph } from "@antv/x6";
import { Branch } from "../branch";
import FreeNodeView from "../branch/Branch.vue";
import { XmindFreeNode, XmindVNodeInit, XmindNode } from "@eric/antv-xmind";
import { bingOnlyKey } from "@/utils";

const FREE_NODE_TYPE = "FREE_NODE";
const freeNodeId = bingOnlyKey("freeNodeId");

export class FreeNode extends XmindFreeNode {
  type: string = FREE_NODE_TYPE;

  static override AUTO_CHILD_TYPE: string = Branch.type;
  static override type: string = FREE_NODE_TYPE;
  static override component = FreeNodeView;
  static override getTemplate(): XmindVNodeInit {
    return {
      id: freeNodeId.next().value,
      type: FREE_NODE_TYPE,
      width: 0,
      height: 0,
      data: {
        source: [],
        text: "",
      },
      children: [],
    };
  }

  static transformToFreeNode(node: XmindNode) {
    const newNode = new FreeNode(
      {
        id: freeNodeId.next().value,
        type: FREE_NODE_TYPE,
        data: node.data,
        width: node.width,
        height: node.height,
        children: [],
      },
      null
    );

    node.children.forEach((child) => {
      child.parent = newNode;
    });

    newNode.children = node.children;
    newNode.hideChild = node.hideChild;
    newNode.originInitData.children = node.originInitData.children;
    node.originInitData.children = [];
    return newNode;
  }

  static transformToBasicNode(node: XmindNode) {
    const template = Branch.getTemplate();
    template.data = { ...node.data };
    const newNode = new Branch(template, null);
    node.children.forEach((child) => {
      child.parent = newNode;
    });

    newNode.isTransformToFreeNode = true;
    newNode.children = node.children;
    newNode.hideChild = node.hideChild;
    newNode.originInitData.children = node.originInitData.children;
    node.originInitData.children = [];
    return newNode;
  }

  afterFirstLayout(): void {
    // 自由节点创建完成后，链接其子节点
    const tobeCreateEdges: Edge[] = [];
    this.children.forEach((child) => {
      const graph = this.connectedGraph?.getGraph();
      if (!graph) {
        return;
      }
      child.connectToParent();
    });
    if (!this.hideChild) {
      this.showChildren();
    }
    this.connectedGraph?.nextTickAddEdges(tobeCreateEdges);
  }

  clone(): FreeNode {
    const node = new FreeNode(this, this.parent);
    node.el = this.el;
    node.connectedGraph = this.connectedGraph;
    node.layoutDone = this.layoutDone;
    return node;
  }

  render(graph: Graph): void {
    this.el = graph.createNode({
      shape: FREE_NODE_TYPE,
      width: this.width,
      height: this.height,
      id: this.id,
    });
    super.connectVNodeToCell();
  }

  copy(): FreeNode {
    const node = new FreeNode(this, null);
    node.id = freeNodeId.next().value;
    node.data = {
      ...node.data,
    };
    return node;
  }
}
