import { XmindGraph } from "@eric/antv-xmind";

export const useEdit = (
  config: {
    xmindGraph: XmindGraph;
  },
  canEdit = true
) => {
  const { xmindGraph } = config;
  const setGraphCanEdit = () => {
    if (!xmindGraph) {
      return;
    }
    xmindGraph.canEdit = canEdit;
  };

  const toggleCanEdit = () => {
    if (!xmindGraph) {
      return;
    }
    canEdit = !canEdit;
    setGraphCanEdit();
  };

  setGraphCanEdit();

  return {
    toggleCanEdit,
  };
};
