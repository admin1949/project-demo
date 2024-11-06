import { bingOnlyKey } from "@/utils";
import { Graph } from "@antv/x6";
import { BaseGraph, XmindToolNode, XmindToolVNodeInit } from "@eric/antv-xmind";

const id = bingOnlyKey("group");
const NODE_NAME = "tool-group";
export class GroupTool extends XmindToolNode {
  static type = NODE_NAME;
  type = NODE_NAME;

  static getTemplate(): XmindToolVNodeInit {
    return {
      connectNodeIds: [],
      id: id.next().value,
      type: NODE_NAME,
      width: 0,
      height: 0,
      data: {
        text: "",
      },
    };
  }

  clone() {
    const newNode = new GroupTool(this, null);
    newNode.connectedGraph = this.connectedGraph;
    newNode.el = this.el;
    return newNode;
  }

  copy() {
    const newNode = new GroupTool(this, null);
    newNode.id = id.next().value;
    return newNode;
  }

  render(graph: Graph) {
    const bbox = this.getChildrenBBox();
    this.bbox = bbox;
    if (!bbox) {
      return;
    }
    // console.log(bbox);
    const zoomValue = graph.zoom();
    if (!zoomValue) {
      return;
    }

    const bg = this.connectedGraph?.nodeCssCreater.getBackground() || "#E7F1FF";
    this.el = graph.createNode({
      x: bbox[0] - Math.floor(10 * zoomValue),
      y: bbox[1] - Math.floor(10 * zoomValue),
      width: bbox[2] - bbox[0] + Math.floor(10 * zoomValue),
      height: bbox[3] - bbox[1] + Math.floor(-20 * zoomValue),
      id: this.id,
      label: this.data.text || "",
      zIndex: -1,
      attrs: {
        body: {
          class: "group-rect",
          fill: bg,
          stroke: "#3388FF",
          strokeDasharray: "4, 4",
          style: "rx: 10; ry: 10",
        },
      },
    });
    super.connectVNodeToCell();
  }

  refresh(baseGraph: BaseGraph) {
    if (!this.el && !this.isUnMounted) {
      if (this.connectedGraph) {
        this.mount(this.connectedGraph, new Set());
        return;
      }
    }
    const bbox = this.getChildrenBBox();
    this.bbox = bbox;
    if (!bbox) {
      if (this.el) {
        this.el.hide();
      }
      return;
    }
    if (!this.el?.isNode()) {
      return;
    }
    const zoomValue = baseGraph.getGraph()?.zoom();
    if (!zoomValue) {
      return;
    }
    const bg = this.connectedGraph?.nodeCssCreater.getBackground();

    const px = 10;
    const py = 4;
    bbox[0] -= px;
    bbox[1] -= py;
    bbox[2] += px;
    bbox[3] += py;

    this.el
      .setPosition({ x: bbox[0], y: bbox[1] })
      .setAttrByPath(["body", "fill"], bg)
      .setSize({
        width: bbox[2] - bbox[0],
        height: bbox[3] - bbox[1],
      })
      .show();
  }
}
