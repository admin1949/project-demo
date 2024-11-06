import { Graph } from "@antv/x6";
import BranchComponent from "./Branch.vue";
import { XmindNode, XmindVNodeInit } from "@eric/antv-xmind";
import { bingOnlyKey } from "@/utils";

const NODE_NAME = "topic-branch";

const id = bingOnlyKey("branchKey");
export class Branch extends XmindNode {
  type = NODE_NAME;

  static override type: string = NODE_NAME;
  static override AUTO_CHILD_TYPE = NODE_NAME;
  static component = BranchComponent;

  static override getTemplate(): XmindVNodeInit {
    return {
      id: id.next().value,
      type: NODE_NAME,
      width: 0,
      height: 0,
      data: {
        text: "主题",
      },
      children: [],
    };
  }

  isTransformToFreeNode = false;

  render(graph: Graph) {
    this.el = graph.createNode({
      shape: NODE_NAME,
      width: this.width,
      height: this.height,
      id: this.id,
      zIndex: 2,
    });
    super.connectVNodeToCell();
  }

  afterFirstLayout(): void {
    super.afterFirstLayout();
    if (this.isTransformToFreeNode) {
      this.isTransformToFreeNode = false;
      // this.showChildren();
      this.children.forEach((child) => {
        child.connectToParent();
      });
    }
  }

  clone() {
    const node = new Branch(this, this.parent);
    node.el = this.el;
    node.connectedGraph = this.connectedGraph;
    node.layoutDone = this.layoutDone;
    return node;
  }

  copy() {
    const newNode = new Branch(this, null);
    newNode.id = id.next().value;
    newNode.data = {
      ...this.data,
    };
    return newNode;
  }
}
