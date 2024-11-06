import {
  ChildVisibleButtom,
  XmindGraph,
  TOOL_CELL_MOUSE_EVENT,
} from "@eric/antv-xmind";
import { useX6Graph } from "./useX6Graph";
import { Cell } from "@antv/x6";

export const useHideChild = (config: { xmindGraph: XmindGraph }) => {
  const refreshToolStatus = (
    cell: Cell,
    opt: {
      hover?: boolean;
      selected?: boolean;
    }
  ) => {
    const hasTool = cell.hasTool(ChildVisibleButtom.type);
    if (hasTool) {
      cell.trigger(TOOL_CELL_MOUSE_EVENT, opt);
    }
  };
  useX6Graph(config, (graph) => {
    if (!graph) {
      return;
    }

    graph.on("node:mouseenter", (e) => {
      refreshToolStatus(e.cell, {
        hover: true,
      });
    });
    graph.on("node:selected", (e) => {
      refreshToolStatus(e.cell, {
        selected: true,
      });
    });
    graph.on("node:unselected", (e) => {
      refreshToolStatus(e.cell, {
        selected: false,
      });
    });
    graph.on("node:mouseleave", (e) => {
      refreshToolStatus(e.cell, {
        hover: false,
      });
    });
  });
};
