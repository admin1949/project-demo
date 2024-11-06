import { useAsync } from "@/hooks/useAsync";
import { safeParseJson } from "@/utils";
import { downloadFile } from "@/utils/fs";
import { XmindGraph, XmindToolGraph } from "@eric/antv-xmind";
import { ElMessage, UploadInstance, UploadProps } from "element-plus";
import pako from "pako";
import { cssList, layoutList } from "../tool/useGraphStyle";

export const useExport = (config: {
  xmindGraph: XmindGraph;
  xmindToolGraph: XmindToolGraph;
}) => {
  const handleExport = () => {
    const exportData: ExportInfo = {
      ...config.xmindGraph.export(),
      tools: config.xmindToolGraph.export(),
    };
    const data = JSON.stringify(exportData);
    const now = Date.now();
    downloadFile(pako.gzip(data), `画板${now}.x6mind`);
  };

  return {
    handleExport,
  };
};

type ExportInfo = ReturnType<XmindGraph["export"]> & {
  tools: ReturnType<XmindToolGraph["export"]>;
};
export const useImport = (config: {
  xmindGraph: XmindGraph;
  xmindToolGraph: XmindToolGraph;
}) => {
  const fileList = ref<UploadProps["fileList"]>([]);
  const instance = useTemplateRef<UploadInstance>("uploadIntance");
  const onFileChange: UploadProps["onChange"] = (file, files) => {
    files.forEach((f) => {
      if (f.uid !== file.uid) {
        instance.value?.handleRemove(f);
      }
    });
  };

  const setGraphData = (data: ExportInfo) => {
    const style =
      cssList.find((i) => i.creater.type === data.css) || cssList[0];
    const layout =
      layoutList.find((i) => i.layout.type === data.layout) || layoutList[0];
    const nodes = data.nodes || [];
    const tools = data.tools || [];
    const history = data.freeNodeIdDropHistory || [];
    const zoom = data.zoom || 1;
    const center = data.center || [0, 0];
    const { xmindGraph, xmindToolGraph } = config;

    xmindGraph.setData(nodes);
    xmindGraph.freeNodeIdDropHistory = history;
    xmindGraph.setLayoutInstance(layout.layout);
    xmindGraph.setNodeCssCreater(style.creater);
    xmindToolGraph.resetGraphToolByData(tools);
    const graph = xmindGraph.getGraph();
    if (!graph) {
      return;
    }
    graph.zoomTo(zoom);
    graph.transform.translate(center[0], center[1]);
  };

  const showImport = ref(false);
  const { load: handleSubmit, loading } = useAsync(async () => {
    const file = fileList.value[0].raw!;
    if (!file) {
      ElMessage.warning("解析文件错误！");
      return;
    }
    const buffer = await file.arrayBuffer();
    const data = pako.ungzip(buffer);
    const coder = new TextDecoder();
    const json = safeParseJson<ExportInfo>(coder.decode(data));
    if (!json) {
      ElMessage.warning("解析文件错误！");
      return;
    }
    setGraphData(json);
    ElMessage.success("导入成功！");
    showImport.value = false;
  });

  return {
    fileList,
    onFileChange,
    handleSubmit,
    showImport,
    loading,
  };
};
