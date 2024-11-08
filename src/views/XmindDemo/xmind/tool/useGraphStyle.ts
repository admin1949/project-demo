import {
  XMIND_EVENT,
  XmindGraph,
  NodeCssCreater
} from "@eric/antv-xmind";
import {
  CodeNodeCssCreater,
  RainbowNodeCssCreater,
  UniverseCssCreater,
} from "@eric/antv-xmind-style";
import {
  LogicMapLayout,
  MindMapLayout,
  OrganizationalStructureLayout,
  XmindLayout,
  IndentedLRLayout,
  IndentedRLLayout
} from "@eric/antv-xmind-layout";

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
  {
    name: "树形图右",
    layout: new IndentedLRLayout(),
  },
  {
    name: "树形图左",
    layout: new IndentedRLLayout(),
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
  const setLayout = (item: { name: string; layout: XmindLayout }) => {
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
