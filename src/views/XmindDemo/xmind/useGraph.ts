import { Graph, Edge } from "@antv/x6";
import { shallowRef, onMounted, onUnmounted, nextTick, onActivated } from "vue";
import { Selection } from "@antv/x6-plugin-selection";
import { Keyboard } from "@antv/x6-plugin-keyboard";
import { Snapline } from "@antv/x6-plugin-snapline";
import { History } from "@antv/x6-plugin-history";
import {
  showNode,
  XMIND_EVENT,
  XmindGraph,
  XmindToolGraph,
  XmindToolVNodeInit,
  XmindVNodeInit,
} from "@eric/antv-xmind";

// 引入资源文件
import "./node";
import "./graphToolNode";

export interface GraphData {
  nodes: XmindVNodeInit[];
  edges: Edge.Properties[];
  tools: XmindToolVNodeInit[];
  zoom?: number;
  center?: [number, number];
  freeNodeHistory?: string[];
}

export const useXmindGraph = (isLightMode = true) => {
  const container = useTemplateRef<HTMLDivElement>("container");
  const graphRef = shallowRef<Graph>();

  const xmindGraph = new XmindGraph();
  xmindGraph.isLightMode = isLightMode;
  xmindGraph.focusNode = (node) => {
    const graph = xmindGraph.getGraph();

    if (!graph) {
      return;
    }

    if (node.el) {
      graph.resetSelection(node.el);
      xmindGraph.once(XMIND_EVENT.ALL_NODE_LAYOUT_END, () => {
        showNode(graph, node.el!);
      });
    }
  };
  const xmindToolGraph = new XmindToolGraph(xmindGraph);

  onMounted(() => {
    if (!container.value) {
      throw Error("element must bind an element!");
    }
    graphRef.value = new Graph({
      container: container.value,
      connecting: {
        connectionPoint: "anchor",
      },
      moveThreshold: 10,
      grid: {
        size: 1,
        visible: false,
      },
      interacting: {
        nodeMovable: false,
      },
      autoResize: true,
      panning: {
        enabled: true,
        eventTypes: ["rightMouseDown", "mouseWheel"],
      },
      mousewheel: {
        enabled: true,
        modifiers: ["ctrl"],
      },
      scaling: {
        min: 0.3,
        max: 3,
      },
    });
    graphRef.value
      .use(
        new Selection({
          enabled: true,
          rubberband: true,
          movable: false,
          showNodeSelectionBox: false,
        })
      )
      .use(
        new Keyboard({
          enabled: true,
        })
      )
      .use(
        new Snapline({
          enabled: true,
        })
      )
      .use(
        new History({
          enabled: true,
        })
      );
    graphRef.value.centerPoint(250, 0);
    xmindGraph.setGraph(graphRef.value);
  });

  onActivated(() => {
    console.log("grtaph actived");
    nextTick(() => {
      const parent = container.value?.parentElement;
      if (parent) {
        graphRef.value?.resize(parent.clientWidth, parent.clientHeight);
      }
    });
  });

  onUnmounted(() => {
    graphRef.value?.dispose();
    graphRef.value = undefined;

    xmindGraph.dispose();
    // xmindToolGraph.dispose();
  });

  const initGraphData = (data?: GraphData) => {
    return new Promise<void>((resolve) => {
      if (!data) {
        resolve();
        return console.log("init none data graph: ", data);
      }

      xmindGraph.rsetFreeNodeIdDropHistory(data.freeNodeHistory || []);
      xmindGraph.setData(data.nodes);

      setTimeout(() => {
        // Todo: Id相同节点存在的连接线不会被移除
        graphRef.value?.addEdges(data.edges || []);
        resolve();
      }, 100);
    });
  };

  return {
    graphRef,
    xmindGraph,
    xmindToolGraph,
    initGraphData,
  };
};
