import AboutComponent from "./Summary.vue";
import {
  BaseGraph,
  DIRECTION,
  Extent,
  X6GraphVNode,
  XmindNode,
  XmindToolNode,
  XmindToolVNodeInit,
} from "@eric/antv-xmind";
import { Graph, Node } from "@antv/x6";
import { createPath } from "./createPath";
import { bingOnlyKey } from "@/utils";

const SUMMARY_NODE_KEY = "about";

const id = bingOnlyKey("summary");
export class Summary extends XmindToolNode {
  constructor(config: XmindToolVNodeInit, parent: XmindNode | null) {
    super(config, parent);
    this.width = this.width || 66;
    this.height = this.height || 43;
    this.data.nodePosition = {
      dir: DIRECTION.TO_RIGHT,
      isFreeNode: false,
      level: 3,
      rootChildVisibleIdx: -1,
      visibleChildIdx: 0,
    };
  }

  static override type = SUMMARY_NODE_KEY;
  static override component = AboutComponent;
  type = SUMMARY_NODE_KEY;

  static override getTemplate(): XmindToolVNodeInit {
    return {
      connectNodeIds: [],
      id: id.next().value,
      type: SUMMARY_NODE_KEY,
      width: 100,
      height: 100,
      data: {
        text: "概要",
      },
    };
  }

  clone() {
    const newNode = new Summary(this, null);
    newNode.connectedGraph = this.connectedGraph;
    newNode.el = this.el;
    return newNode;
  }

  copy() {
    const newNode = new Summary(this, null);
    newNode.id = id.next().value;
    return newNode;
  }

  getSymbolOpt(
    bbox: Extent,
    dir: DIRECTION
  ): { d: string | null; refD: string | null } {
    const [width, height] = this.getSymbolSize(bbox, dir);
    const path = createPath(dir === DIRECTION.TO_BOTTOM ? width : height, dir);

    if (dir === DIRECTION.TO_BOTTOM) {
      if (width > 100) {
        return {
          // 指定 d 属性，pathData 不随图形的大小缩放
          d: path,
          refD: null,
        };
      }

      return {
        d: null,
        // 指定 refD 属性，pathData 不随图形的大小缩放
        refD: path,
      };
    }

    if (height > 100) {
      return {
        d: path,
        refD: null,
      };
    }

    return {
      d: null,
      refD: path,
    };
  }

  getSymbolPosition(extent: Extent, dir: DIRECTION) {
    const width = this.getSymbolSize(extent, dir)[0];
    switch (dir) {
      case DIRECTION.TO_BOTTOM:
        return { x: extent[0], y: extent[3] };
      case DIRECTION.TO_LEFT:
        return { x: extent[0] - width, y: extent[1] };
      default:
        return { x: extent[2], y: extent[1] };
    }
  }

  getSymbolSize(bbox: Extent, dir = DIRECTION.TO_RIGHT) {
    if (dir === DIRECTION.TO_BOTTOM) {
      const width = bbox[2] - bbox[0];
      const heightScale = width > 100 ? 1 : width / 100;
      return [width, 30 * heightScale];
    }

    const height = bbox[3] - bbox[1];
    const widthScale = height > 100 ? 1 : height / 100;
    const width = 30 * widthScale;
    return [width, height];
  }

  getElPosition(bbox: Extent, dir: DIRECTION = DIRECTION.TO_RIGHT) {
    const [symbolWidth, symbolHeight] = this.getSymbolSize(bbox, dir);
    const { width = 0, height = 0 } = this;
    switch (dir) {
      case DIRECTION.TO_LEFT:
        return {
          x: bbox[0] - symbolWidth - width,
          y: (bbox[3] + bbox[1] - height) / 2,
        };
      case DIRECTION.TO_BOTTOM:
        return {
          x: (bbox[2] + bbox[0] - width) / 2,
          y: bbox[3] + symbolHeight,
        };
    }
    const x = bbox[2] + symbolWidth;
    const y = (bbox[3] + bbox[1] - height) / 2;
    return { x, y };
  }

  getDir() {
    const { connectNodeIds, connectedGraph } = this;
    if (!connectedGraph) {
      return DIRECTION.TO_RIGHT;
    }
    const { nodePositionMap, freeNodePositionMap } =
      connectedGraph.layoutInstance;
    for (let i = 0; i < connectNodeIds.length; i++) {
      const id = connectNodeIds[i];
      const node = nodePositionMap.get(id) || freeNodePositionMap.get(id);
      if (node) {
        return node.dir;
      }
    }
    return DIRECTION.TO_RIGHT;
  }

  render(graph: Graph) {
    const bbox = this.getChildrenBBox();
    const dir = this.getDir();
    this.renderSybmol(graph, bbox, dir);

    this.bbox = bbox;
    if (this.nodePosition) {
      this.setNodePosition({
        ...this.nodePosition,
        dir,
      });
    }
    if (!bbox) {
      return;
    }

    this.bbox = bbox;
    const { x, y } = this.getElPosition(bbox, dir);
    if (this.el) {
      this.el.setPosition(x, y);
      return;
    }
    this.el = graph.createNode({
      shape: SUMMARY_NODE_KEY,
      width: this.width,
      height: this.height,
      x,
      y,
      id: this.id,
      zIndex: 3,
    });
    super.connectVNodeToCell();
  }

  symbolEl: Node | null = null;
  renderSybmol(graph: Graph, bbox: Extent | null, dir: DIRECTION) {
    if (!bbox) {
      return;
    }
    if (this.symbolEl) {
      if (this.connectedGraph) {
        this.refreshSymbol(this.connectedGraph, bbox, dir);
      }
      return;
    }

    this.bbox = bbox;
    const zoomValue = graph.zoom();
    if (!zoomValue) {
      return null;
    }
    const [width, height] = this.getSymbolSize(bbox, dir);
    const opt = this.getSymbolOpt(bbox, dir);
    this.symbolEl = graph.createNode({
      shape: "path",
      ...this.getSymbolPosition(bbox, dir),
      width: width,
      height: height,
      zIndex: -1,
      attrs: {
        body: {
          fill: "#D75A4A",
          stroke: "none",
          ...opt,
        },
      },
    });
    graph.addCell(this.symbolEl);
  }

  refreshSymbol(xmind: BaseGraph, bbox: Extent | null, dir: DIRECTION) {
    const { symbolEl, isUnMounted } = this;
    const graph = xmind.getGraph();
    if (isUnMounted || !graph) {
      return;
    }

    if (!symbolEl) {
      this.renderSybmol(graph, bbox, dir);
      return;
    }

    const oldBbox = this.bbox;
    if (!bbox) {
      symbolEl.hide();
      return;
    }
    symbolEl.show();
    if (isSameExtent(bbox, oldBbox)) {
      return;
    }

    const { x, y } = this.getSymbolPosition(bbox, dir);
    symbolEl.setPosition(x, y);
    const [width, height] = this.getSymbolSize(bbox, dir);
    symbolEl.setSize(width, height);
    symbolEl.setAttrs({
      body: this.getSymbolOpt(bbox, dir),
    });
  }

  refresh(xmind: BaseGraph) {
    const { el, isUnMounted } = this;
    const dir = this.getDir();
    if (isUnMounted) {
      return;
    }
    const bbox = this.getChildrenBBox();
    this.refreshSymbol(xmind, bbox, dir);

    if (!el) {
      this.mount(xmind, new Set());
      return;
    }

    this.bbox = bbox;
    if (!bbox) {
      el.hide();
      return;
    }
    el.show().setPosition(this.getElPosition(bbox, dir));
  }

  unMount(removeedCellSet: Set<X6GraphVNode>): void {
    super.unMount(removeedCellSet);
    if (this.symbolEl) {
      this.symbolEl.remove();
      this.symbolEl = null;
    }
  }
}

const isSameExtent = (e1: Extent, e2: Extent | null) => {
  if (!e2) {
    return false;
  }
  return (
    e1[0] === e2[0] && e1[1] === e2[1] && e1[2] === e2[2] && e1[3] === e2[3]
  );
};
