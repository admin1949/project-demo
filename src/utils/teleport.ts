const OUTER_DIALOG_CONTAINER_ID = "runtime-dialog-content-parent";

export const getContainer = () => {
  const document = self.document;
  let parent = document.getElementById(OUTER_DIALOG_CONTAINER_ID);
  if (!parent) {
    parent = document.createElement("div");
    parent.id = OUTER_DIALOG_CONTAINER_ID;
    document.body.appendChild(parent);
  }
  const container = document.createElement("div");
  parent.appendChild(container);
  return container;
};

export const removeSelf = (el: Element) => {
  const parent = el.parentElement;
  if (!parent) {
    return;
  }
  parent.removeChild(el);
};
