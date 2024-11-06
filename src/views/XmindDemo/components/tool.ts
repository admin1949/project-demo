// import IconToolUndo from "@/assets/svg/icon-canvas-tool-undo.svg?component";
// import IconToolRedo from "@/assets/svg/icon-canvas-tool-redo.svg?component";
import IconToolNodeNext from "@/assets/svg/icon-canvas-tool-node-next.svg?component";
import IconToolNodeSame from "@/assets/svg/icon-canvas-tool-node-same.svg?component";
// import IconToolConnect from "@/assets/svg/icon-canvas-tool-connect.svg?component";
import IconToolOutline from "@/assets/svg/icon-canvas-tool-outline.svg?component";
import IconToolGeneralize from "@/assets/svg/icon-canvas-tool-generalize.svg?component";
import IconToolDelete from "@/assets/svg/icon-canvas-tool-delete.svg?component";
import { WindPower } from "@element-plus/icons-vue";

const tools = [
  // {
  //   content: "后退",
  //   type: "BACKOFF",
  //   icon: IconToolUndo,
  //   operation: true, //  css 能否点击
  // },
  // {
  //   content: "重做",
  //   type: "FORWARD",
  //   icon: IconToolRedo,
  //   operation: true,
  // },
  {
    content: "增加root",
    type: "CREATE_ROOT",
    icon: WindPower,
    operation: true,
  },
  {
    content: "增加子级",
    type: "CHILDREN",
    icon: IconToolNodeNext,
    operation: true,
  },
  {
    content: "增加同级",
    type: "SIBLING",
    icon: IconToolNodeSame,
    operation: true,
  },
  // {
  //   content: "连接线",
  //   type: "CONNECTLINE",
  //   icon: IconToolConnect,
  //   operation: true,
  // },
  {
    content: "外框",
    type: "OUTERFRAME",
    icon: IconToolOutline,
    operation: true,
  },
  {
    content: "概要",
    type: "OUTLINE",
    icon: IconToolGeneralize,
    operation: true,
  },
  {
    content: "删除",
    type: "DELETE",
    icon: IconToolDelete,
    operation: true,
  },
];

export const useToolList = () => {
  const drewTools = markRaw(tools);

  return {
    drewTools,
  };
};
