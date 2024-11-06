<template>
  <div>
    <ElButton @click="showDialog = true">图层配置</ElButton>
    <ElDialog title="编辑数据源图层" v-model="showDialog" width="1200px">
      <ElButton type="primary" @click="handleAddTab">新增图层</ElButton>
      <div style="margin-bottom: 12px"></div>
      <ElTabs
        v-if="tabList.length"
        type="card"
        v-model="activeTab"
        closable
        @tab-remove="handleRemoveTab"
      >
        <template v-for="i in tabList" :key="i.name">
          <ElTabPane :label="i.name" :name="i.name">
            <ElForm label-width="120px" inline label-suffix="：">
              <ElFormItem label="数据坐标系">
                <ElSelect placeholder="请选择数据坐标系" v-model="i.proj">
                  <ElOption
                    :value="CRSTypes.BD09LL"
                    label="百度坐标系"
                  ></ElOption>
                  <ElOption
                    :value="CRSTypes.WGS84"
                    label="WGS84坐标系"
                  ></ElOption>
                  <ElOption
                    :value="CRSTypes.GCJ02"
                    label="国测局02坐标系"
                  ></ElOption>
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="图层层级">
                <ElInputNumber
                  v-model="i.zIndex"
                  :min="0"
                  :step="1"
                  :step-strictly="true"
                ></ElInputNumber>
              </ElFormItem>
              <ElFormItem label="显示图层">
                <ElSwitch
                  v-model="i.visible"
                  active-text="展示"
                  inactive-text="隐藏"
                ></ElSwitch>
              </ElFormItem>
              <ElFormItem>
                <ElButton
                  style="margin-left: 20px"
                  type="primary"
                  plain
                  @click="handleAddSource(i.name)"
                >
                  新增数据源
                </ElButton>
              </ElFormItem>
            </ElForm>
            <ElScrollbar height="400px">
              <template v-for="(j, idx) in i.source">
                <ElForm inline label-width="120px" label-suffix="：">
                  <ElFormItem label="数据源">
                    <ElSelect v-model="j.type" placeholder="请选择数据源类型">
                      <ElOption label="点" :value="SourceType.POINT"></ElOption>
                      <ElOption
                        label="线段"
                        :value="SourceType.LINE"
                      ></ElOption>
                      <ElOption
                        label="多边形"
                        :value="SourceType.POLYGON"
                      ></ElOption>
                      <ElOption
                        label="圆"
                        :value="SourceType.CIRCLE"
                      ></ElOption>
                      <ElOption
                        label="点（集合）"
                        :value="SourceType.POINT_COLLECTION"
                      ></ElOption>
                      <ElOption
                        label="线段（集合）"
                        :value="SourceType.LINE_COLLECTION"
                      ></ElOption>
                      <ElOption
                        label="多边形（集合）"
                        :value="SourceType.POlYGON_COLLECTION"
                      ></ElOption>
                      <ElOption
                        label="圆（集合）"
                        :value="SourceType.CIRCLE_COLLECTION"
                      ></ElOption>
                    </ElSelect>
                  </ElFormItem>
                  <ElFormItem label="样式ID">
                    <ElSelect
                      v-model="j.styleId"
                      placeholder="请选择或输入样式Id"
                      filterable
                      allow-create
                    >
                      <ElOption
                        v-for="k in resolveStyleOptions(j.type)"
                        :key="k.value"
                        :value="k.value"
                        >{{ k.label }}（{{ k.value }}）</ElOption
                      >
                    </ElSelect>
                  </ElFormItem>
                  <ElFormItem label="操作">
                    <ElButton
                      type="danger"
                      plain
                      @click="handleDeleteSource(i.name, idx)"
                      >删除</ElButton
                    >
                  </ElFormItem>
                  <ElFormItem label="数据">
                    <ElInput
                      v-model="j.source"
                      style="width: 800px"
                      type="textarea"
                      :autosize="{ minRows: 3, maxRows: 6 }"
                    ></ElInput>
                  </ElFormItem>
                </ElForm>
              </template>
            </ElScrollbar>
          </ElTabPane>
        </template>
      </ElTabs>
      <div class="btns">
        <ElButton @click="closeDialog">取消</ElButton>
        <ElButton type="primary" plain @click="handleSubmit">保存</ElButton>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElScrollbar,
  ElSelect,
  ElSwitch,
  ElTabPane,
  ElTabs,
} from "element-plus";
import { ref, shallowRef } from "vue";
import { CRSTypes, LayerSource, StaticSourceItem, SourceType } from "../utils";
import { MapStyle, StyleId } from "../MapStyle";

const props = defineProps<{
  mapStyle: MapStyle;
  layerSource: LayerSource[];
}>();
const emit = defineEmits<{
  (event: "update:layerSource", data: LayerSource[]): void;
}>();

const showDialog = ref(false);
const closeDialog = () => {
  showDialog.value = false;
};
const createEmptyLayerSource = (name: string) => {
  return {
    name,
    proj: CRSTypes.BD09,
    zIndex: 1,
    visible: true,
    source: [
      {
        type: SourceType.POINT,
        source: "[]",
        styleId: "",
      },
    ],
  };
};
const parseLayerSource = (list: LayerSource[]) => {
  return list.map((item) => {
    return {
      name: item.name,
      proj: item.proj,
      zIndex: item.zIndex,
      visible: item.visible,
      source: item.source.map((j) => {
        return {
          type: j.type,
          styleId: j.styleId.toString(),
          source: JSON.stringify(j.source, undefined, 2),
        };
      }),
    };
  });
};

const tabList = ref(parseLayerSource(props.layerSource));
const activeTab = shallowRef(tabList.value[0]?.name);
const handleRemoveTab = async (name: string | number) => {
  const statsu = await ElMessageBox.confirm(
    `是否删除数据源 “${name}” ？`
  ).catch(() => false);
  if (!statsu) {
    ElMessage.info("取消删除");
    return;
  }
  const idx = tabList.value.findIndex((i) => i.name === name);
  if (idx < 0) {
    return;
  }
  tabList.value = tabList.value.filter((i) => i.name !== name);
  if (name === activeTab.value) {
    activeTab.value = (tabList.value[idx] || tabList.value[idx - 1])?.name;
  }
};

const handleAddTab = async () => {
  const res = await ElMessageBox.prompt("新增数据源", {
    inputPlaceholder: "请输入数据源名称",
    inputValidator: (name) => {
      if (!name) {
        return "请输入数据源名称";
      }

      const hasRepeat = tabList.value.some((i) => i.name === name);
      if (hasRepeat) {
        return "数据源名称不能重复，请修改";
      }

      return true;
    },
    cancelButtonText: "取消",
    confirmButtonText: "新增",
  }).catch(() => ({ action: "cancel", value: "" }));
  if (res?.action !== "confirm") {
    ElMessage.info("取消添加");
    return;
  }
  tabList.value = [createEmptyLayerSource(res?.value), ...tabList.value];
  activeTab.value = res?.value;
};

const handleAddSource = (name: string) => {
  const item = tabList.value.find((i) => i.name === name);
  if (!item) {
    return;
  }
  item.source.unshift({
    type: SourceType.POINT,
    source: "[]",
    styleId: "",
  });
};

const handleDeleteSource = (name: string, idx: number) => {
  const item = tabList.value.find((i) => i.name === name);
  if (!item) {
    return;
  }
  item.source.splice(idx, 1);
};

const parseConfig = (list: [StyleId, Function | { desc?: string }][]) => {
  const res: { label: string; value: string }[] = [];
  return list.reduce((list, i) => {
    if (typeof i[1] === "function" || typeof i[0] === "symbol") {
      return list;
    }
    list.push({
      label: (i[1]?.desc || i[0]).toString(),
      value: i[0].toString(),
    });
    return list;
  }, res);
};

const resolveStyleOptions = (type: StaticSourceItem["type"]) => {
  switch (type) {
    case SourceType.POINT:
    case SourceType.POINT_COLLECTION:
      return parseConfig(props.mapStyle.icons.getAllStyle());
    case SourceType.LINE:
    case SourceType.LINE_COLLECTION:
      return parseConfig(props.mapStyle.lines.getAllStyle());
    case SourceType.POLYGON:
    case SourceType.POlYGON_COLLECTION:
      return parseConfig(props.mapStyle.polygon.getAllStyle());
    case SourceType.CIRCLE:
    case SourceType.CIRCLE_COLLECTION:
      return parseConfig(props.mapStyle.circle.getAllStyle());
    default:
      return [];
  }
};

const handleSubmit = () => {
  try {
    const list = tabList.value.map((item) => {
      return {
        ...item,
        source: item.source.map((i) => {
          return {
            ...i,
            source: JSON.parse(i.source),
          };
        }),
      };
    }) as LayerSource[];
    emit("update:layerSource", list);
    closeDialog();
  } catch (err) {
    ElMessage.error("parse JSON error, 请检查:" + err);
  }
};
</script>

<style lang="scss" scoped>
.btns {
  text-align: right;
}
</style>
