import { bingOnlyKey } from "@/utils";
import { Graph } from "@antv/x6";
import { X6GraphVNode, XmindNode, XmindVNodeInit } from "@eric/antv-xmind";

const NODE_NAME = "TempAddNode";
const id = bingOnlyKey(NODE_NAME);

export class TempAddNode extends XmindNode {
  static getTemplate(): XmindVNodeInit {
    return {
      id: id.next().value,
      type: NODE_NAME,
      width: 80,
      height: 28,
    };
  }

  constructor(config: XmindVNodeInit, parent: X6GraphVNode | null) {
    super(config, parent);
    this.layoutDone = true;
    this.setParetn(parent);
    this.nodeStyle = ["#50a14f", "#50a14f", "#50a14f"];
  }

  setParetn(parent: X6GraphVNode | null) {
    const nodePosition = parent && parent.nodePosition;
    this.parent = parent;
    if (nodePosition) {
      this.nodePosition = {
        ...nodePosition,
        level: nodePosition.level + 1,
        isFreeNode: false,
        visibleChildIdx: parent.children.length,
      };
    }
  }

  clone(): XmindNode {
    throw new Error("TempAddNode should not be clone.");
  }
  copy(): XmindNode {
    const node = new TempAddNode(this, null);
    node.id = id.next().value;
    return node;
  }

  type: string = NODE_NAME;

  render(graph: Graph): void {
    this.el = graph.createNode({
      x: 0,
      y: 0,
      id: this.id,
      width: this.width,
      height: this.height,
      label: "",
      zIndex: 999,
      attrs: {
        body: {
          fill: "#50a14f",
          style: "rx: 8; ry: 8",
          stroke: "#50a14f",
        },
      },
    });
  }
}
