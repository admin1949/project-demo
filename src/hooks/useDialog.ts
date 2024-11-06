import { resolveMessageBoxData } from "@/utils";
import { getContainer, removeSelf } from "@/utils/teleport";
import { DialogProps, ElMessageBox } from "element-plus";
import { AppContext, render } from "vue";
import BaseDialog from "@/components/Dialog/BaseDialog/index.vue";

type Keys<P, T> = {
  [key in keyof P]: P[key] extends T ? key : void;
}[keyof P];

export const useDialog = <P, K extends Keys<P, boolean> & string>(
  props: P,
  key: K,
  name?: string
) => {
  const ctx = getCurrentInstance();

  const showDialog = computed<boolean>({
    get: () => props[key as keyof P] as unknown as boolean,
    set: (val) => ctx?.emit("update:" + key, val),
  });
  const beforeClose = async (done: (cancle: boolean) => void) => {
    try {
      const { action } = await resolveMessageBoxData(
        ElMessageBox.confirm(`确认取消${name}？`)
      );
      if (action !== "confirm") {
        return;
      }
      done(false);
    } catch (err) {
      done(true);
    }
  };
  const closeDialog = () => {
    showDialog.value = false;
  };
  const closeDialogWithConfirm = () => {
    beforeClose((cancle) => {
      if (!cancle) {
        showDialog.value = false;
      }
    });
  };
  return {
    beforeClose,
    showDialog,
    closeDialogWithConfirm,
    closeDialog,
  };
};

export const openBaseDialog = (
  child: () => VNode,
  opt: Partial<Omit<DialogProps, "modelValue">> & { onClosed?: () => void },
  context?: AppContext,
  containerCreater: () => HTMLElement = getContainer
) => {
  const container = containerCreater();
  const onClosed = () => {
    render(null, container);
    removeSelf(container);
    opt.onClosed?.();
  };

  let hasDestory = false;
  const renderDialog = (showDialog: boolean) => {
    if (hasDestory) {
      return;
    }
    const vnode = h(
      BaseDialog,
      {
        ...opt,
        modelValue: showDialog,
        onClosed,
        "onUpdate:modelValue": (val: boolean) => {
          renderDialog(val);
          if (!val) {
            hasDestory = val;
          }
        },
      },
      {
        default: () => child(),
      }
    );
    vnode.appContext = context || null;
    render(vnode, container);
  };

  renderDialog(true);
  return () => renderDialog(false);
};
