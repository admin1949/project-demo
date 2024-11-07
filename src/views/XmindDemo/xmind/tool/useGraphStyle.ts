import {
  LogicMapLayout,
  MindMapLayout,
  OrganizationalStructureLayout,
  X6GraphLayout,
  XMIND_EVENT,
  XmindGraph,
} from "@eric/antv-xmind";
import {
  CodeNodeCssCreater,
  NodeCssCreater,
  RainbowNodeCssCreater,
  UniverseCssCreater,
} from "@eric/antv-xmind/vue";

export const cssList = [
  {
    name: "彩虹🌈",
    creater: new RainbowNodeCssCreater(),
  },
  {
    name: "代码",
    creater: new CodeNodeCssCreater(),
  },
  {
    name: "宇宙🛸",
    creater: new UniverseCssCreater(),
  },
];

export const useGraphCss = ({ xmindGraph }: { xmindGraph: XmindGraph }) => {
  const selectedCssName = ref("");
  const getTypeByGraph = () => {
    const type = xmindGraph.nodeCssCreater.type;
    const item = cssList.find((i) => i.creater.type === type) || cssList[0];
    selectedCssName.value = item.name;
  };

  getTypeByGraph();
  const setCssCreater = (item: { name: string; creater: NodeCssCreater }) => {
    selectedCssName.value = item.name;
    xmindGraph.setNodeCssCreater(item.creater);
  };
  onScopeDispose(
    xmindGraph.on(XMIND_EVENT.NODE_CSS_CREATER_CHANGE, getTypeByGraph)
  );
  return {
    cssList,
    selectedCssName,
    setCssCreater,
  };
};

export const layoutList = [
  {
    name: "思维导图",
    layout: new MindMapLayout(),
  },
  {
    name: "逻辑图",
    layout: new LogicMapLayout(),
  },
  {
    name: "组织架构图",
    layout: new OrganizationalStructureLayout(),
  },
];

export const useGraphLayout = ({ xmindGraph }: { xmindGraph: XmindGraph }) => {
  const selectedLayoutName = ref("");
  const getTypeByGraph = () => {
    const type = xmindGraph.layoutInstance.type;
    const item =
      layoutList.find((i) => i.layout.type === type) || layoutList[0];
    selectedLayoutName.value = item.name;
  };

  getTypeByGraph();
  const setLayout = (item: { name: string; layout: X6GraphLayout }) => {
    selectedLayoutName.value = item.name;
    xmindGraph.setLayoutInstance(item.layout);
  };
  
  onScopeDispose(
    xmindGraph.on(XMIND_EVENT.LAYOUT_INSTANCE_CHANGE, getTypeByGraph)
  );
  return {
    layoutList,
    selectedLayoutName,
    setLayout,
  };
};
