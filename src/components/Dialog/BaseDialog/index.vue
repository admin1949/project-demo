<script lang="ts">
import { dialogProps, dialogEmits, ElDialog } from "element-plus";
import { defineComponent, h } from "vue";

export default defineComponent({
  props: dialogProps,
  emits: dialogEmits,

  setup(props, { slots, emit, attrs }) {
    const BASE_DIALOG_CLASS = "base-dialog";

    const CUSTOM_EVENT = {
      "onUpdate:modelValue"(val: boolean) {
        emit("update:modelValue", val);
      },
      onClose() {
        emit("close");
      },
      onClosed() {
        emit("closed");
      },
      onCloseAutoFocus() {
        emit("closeAutoFocus");
      },
      onOpen() {
        emit("open");
      },
      onOpened() {
        emit("opened");
      },
      onOpenAutoFocus() {
        emit("openAutoFocus");
      },
    };

    return () => {
      return h(
        ElDialog,
        {
          ...props,
          ...attrs,
          appendToBody: props.appendToBody ?? true,
          class: BASE_DIALOG_CLASS + " " + (attrs.class || ""),
          modalClass:
            props.modal === false ? "no-modal-dialog-overlay" : void 0,
          ...CUSTOM_EVENT,
        },
        slots
      );
    };
  },
});
</script>

<style lang="scss">
.base-dialog {
  --el-dialog-padding-primary: 10px;
  pointer-events: initial;
  font-size: 14px;
  color: #2a2e3f;

  background: #ffffff;
  border: 1px solid rgba(220, 223, 230, 1);
  box-shadow: 0px 0px 20px 0px rgba(6, 10, 28, 0.15);
  border-radius: 3px;

  .el-dialog__header {
    --el-dialog-title-font-size: 14px;
    padding-top: 10px;
    border-bottom: 1px solid rgba(220, 223, 230, 1);
    margin-right: 0;
    padding-right: 16px;

    .el-dialog__headerbtn {
      width: 40px;
      height: 40px;
    }
  }

  .el-dialog__body {
    padding: 12px 10px;
  }
}

.no-modal-dialog-overlay {
  pointer-events: none;
}
</style>
