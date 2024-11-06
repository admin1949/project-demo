import { Graph } from "@antv/x6";
import { Branch } from "../branch";
import Topic from "../branch/Branch.vue";
import { XmindNode, XmindVNodeInit } from "@eric/antv-xmind";
import { bingOnlyKey } from "@/utils";

const ROOT_NODE_NAME = "TOPIC";

const rootId = bingOnlyKey("rootKey");

export class Root extends XmindNode {
  type = ROOT_NODE_NAME;
  static override type: string = ROOT_NODE_NAME;
  static override AUTO_CHILD_TYPE = Branch.type;
  static override component = Topic;
  static override getTemplate(): XmindVNodeInit {
    return {
      id: rootId.next().value,
      type: ROOT_NODE_NAME,
      width: 0,
      height: 0,
      data: {
        text: "中心主题",
      },
      children: [],
    };
  }

  render(graph: Graph) {
    this.el = graph.createNode({
      shape: ROOT_NODE_NAME,
      width: this.width,
      height: this.height,
      id: this.id,
    });
    super.connectVNodeToCell();
  }

  clone() {
    const node = new Root(this, this.parent);
    node.el = this.el;
    node.connectedGraph = this.connectedGraph;
    node.layoutDone = this.layoutDone;
    return node;
  }

  copy() {
    const newNode = new Root(this, null);
    newNode.id = rootId.next().value;
    newNode.data = {
      ...this.data,
    };
    return newNode;
  }
}
