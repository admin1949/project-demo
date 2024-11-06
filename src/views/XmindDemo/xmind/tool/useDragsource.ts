import { Cell, NodeView } from "@antv/x6";
import { XmindGraph } from "@eric/antv-xmind";
import { useX6Graph } from "./useX6Graph";

interface IDropSource<T = any> {
  position: {
    top: number;
    left: number;
  };
  data: T;
}

interface ISourceItem {
  fileType: string;
  fileName: string;
  fileId: string;
}

interface IDropCardSource {
  type: "case" | "alarm";
  info: {
    id: string;
  };
}

export const useDragSource = (config: { xmindGraph: XmindGraph }) => {
  const nodeList = ref<Cell[]>([]);
  const isDraging = ref(false);
  const { xmindGraph } = config;

  const exitDragModel = () => {
    isDraging.value = false;
    nodeList.value.length = 0;
  };

  const initDragModel = () => {
    isDraging.value = true;
    nodeList.value.length = 0;
  };

  const onSourceEnter = (e: CustomEvent<IDropSource<ISourceItem>>) => {
    const { position, data } = e.detail;
    console.log("source enter", position, data);
    initDragModel();
  };
  const onSourceLeave = (e: CustomEvent<IDropSource<ISourceItem>>) => {
    const { position, data } = e.detail;
    console.log("source leave", position, data);
    exitDragModel();
  };
  const onSourceMove = (e: CustomEvent<IDropSource<ISourceItem>>) => {
    const { position, data } = e.detail;
    console.log("source move", position, data);
  };

  const isCreateNewSourceChild = true;
  const onSourceDrop = (
    e: CustomEvent<IDropSource<ISourceItem | IDropCardSource>>
  ) => {
    const lock = false;
    if (lock) {
      return;
    }
    const { position, data } = e.detail;
    console.log("source drop", position, data);
    const graph = xmindGraph.getGraph();

    if (!graph) {
      return exitDragModel();
    }
    if (!nodeList.value.length) {
      // 默认不开启创建游离的文件节点
      // const point = graph.value.clientToLocal(position.left, position.top);
      // graph.value.addNode({
      //     x: point.x,
      //     y: point.y,
      //     shape: "vue-shape",
      //     component: "basic-cell",
      //     data: {
      //         source: [data],
      //     },
      // })
      return exitDragModel();
    }
    const node = nodeList.value.pop();
    if (!node) {
      return;
    }
    if (isCreateNewSourceChild) {
      // const res = addChildNode(graph, node.id, 'topic-child', opt);
      // if (res) {
      //     layout().then(() => {
      //         graph.value?.addEdge(res[1]);
      //         const nodeData = graph.value?.getCellById(res[0].id).getData<{source: ISourceItem[]}>();
      //         if(isSource(data)) {
      //             res[0].data.push(data);
      //             nodeData?.source.push(data);
      //         }
      //     })
      // }
      return exitDragModel();
    }

    return exitDragModel();
  };
  const onNodeMouseEnter = (e: NodeView.MouseEventArgs<any>) => {
    if (!isDraging.value) {
      return;
    }
    console.log("enter");
    nodeList.value.push(e.node);
  };
  const onNodeMouseLeave = () => {
    if (!isDraging.value) {
      return;
    }
    console.log("leave");
    nodeList.value.pop();
  };

  useX6Graph(config, (graph) => {
    if (!graph) {
      return;
    }
    graph.on("node:customevent", (e) => {
      if (e.name === "sourceenter") {
        onNodeMouseEnter(e);
        return;
      }
      if (e.name === "sourceleave") {
        onNodeMouseLeave();
      }
    });
  });

  return {
    onSourceEnter,
    onSourceLeave,
    onSourceMove,
    onSourceDrop,
  };
};
