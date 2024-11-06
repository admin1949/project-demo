import { Graph } from "@antv/x6";
import { XMIND_EVENT, XmindGraph } from "@eric/antv-xmind";

export const useX6Graph = (
  {
    xmindGraph,
  }: {
    xmindGraph: XmindGraph;
  },
  callback: (graph: Graph | null) => (() => void) | void
) => {
  const graph = xmindGraph.getGraph();
  let clean: (() => void) | null = null;
  if (graph) {
    clean = callback(graph) || null;
  }

  const off = xmindGraph.on(XMIND_EVENT.SET_GRAPH, (opt) => {
    clean && clean();
    clean = callback(opt.graph) || null;
  });

  const stop = () => {
    clean && clean();
    off();
    clean = null;
  };
  onScopeDispose(stop);

  return stop;
};
