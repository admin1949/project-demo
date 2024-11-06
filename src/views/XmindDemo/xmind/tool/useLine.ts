import { Edge, Cell, Registry } from "@antv/x6";
import type {
  ClickEvent,
  MouseEnterEvent,
} from "@antv/x6-common/lib/dom/event";
import { XMIND_EVENT, XmindGraph } from "@eric/antv-xmind";
import { useX6Graph } from "./useX6Graph";

Registry.Router.registry.register("connectline", function () {
  return [];
});

export const useLine = (config: { xmindGraph: XmindGraph }) => {
  const isLineMode = ref(false);
  const hasCreateLine = ref(false);
  const { xmindGraph } = config;

  const curretNode: Cell[] = [];
  const toggleLineMode = () => {
    if (isLineMode.value) {
      exitLineMode();
      return;
    }
    const selectedNodes = xmindGraph.getGraph()?.getSelectedCells();
    if (selectedNodes?.length === 1) {
      curretNode[0] = selectedNodes[0];
    }
    isLineMode.value = true;
  };

  const end = () => {
    hasCreateLine.value = false;
    edge = null;
    curretNode.forEach((node) => {
      node.removeTool("boundary");
    });
    curretNode.length = 0;
  };

  const exitLineMode = () => {
    if (edge) {
      xmindGraph.getGraph()?.removeEdge(edge);
    }
    isLineMode.value = false;
    end();
  };

  const createLine = (node: Cell, event: MouseEnterEvent | ClickEvent) => {
    const graph = xmindGraph.getGraph();
    if (!graph) {
      return;
    }
    const { clientX, clientY } = event;
    const target = graph.clientToLocal({
      x: clientX,
      y: clientY,
    });
    edge = graph.addEdge({
      source: {
        cell: node,
        anchor: {
          name: "midSide",
          args: {
            padding: -3,
          },
        },
      },
      target: target,
      router: "connectline",
      connector: { name: "smooth" },
      zIndex: 9999,
      data: {
        type: "CONNECTLINE",
      },
      attrs: {
        line: {
          stroke: "#3388FF",
          strokeWidth: 3,
          strokeDasharray: "10, 4",
        },
      },
      shape: "edge",
    });
    hasCreateLine.value = true;
  };

  const mouseMove = (e: MouseEvent) => {
    if (!isLineMode.value) {
      return;
    }
    if (!hasCreateLine.value || !edge) {
      return;
    }
    const { clientX, clientY } = e;
    const target = xmindGraph
      .getGraph()
      ?.clientToLocal(clientX - 16, clientY - 16);
    if (target) {
      edge.setTarget(target);
    }
  };

  let edge: Edge | null = null;

  useX6Graph(config, (graph) => {
    if (!graph) {
      return;
    }
    graph.container.addEventListener("mousemove", mouseMove);
    graph
      .on("graph:mouseenter", (e) => {
        if (!isLineMode.value) {
          return;
        }
        if (edge) {
          return;
        }
        if (curretNode.length === 1) {
          createLine(curretNode[0], e.e);
        }
      })
      .on("node:click", (node) => {
        if (!isLineMode.value) {
          return;
        }
        if (curretNode.length === 1) {
          if (curretNode[0] === node.node) {
            return;
          }
          curretNode.push(node.node);
          edge?.setTarget(node.node, {
            anchor: {
              name: "midSide",
              args: {
                padding: -3,
              },
            },
          });
          if (edge) {
            xmindGraph.dispatch(XMIND_EVENT.NODE_CHANGE);
          }
          end();
          exitLineMode();
          return;
        }
        if (curretNode.length === 0) {
          curretNode.push(node.node);
          createLine(node.node, node.e);
          return;
        }
        curretNode.length = 0;
      })
      .on("node:mouseenter", (node) => {
        if (!isLineMode.value) {
          return;
        }
        node.node.addTools("boundary");
      })
      .on("node:mouseleave", (node) => {
        if (!isLineMode.value) {
          return;
        }
        node.node.removeTool("boundary");
      });
    return () => {
      graph.container.removeEventListener("mousemove", mouseMove);
    };
  });

  return {
    toggleLineMode,
    isLineMode,
  };
};
