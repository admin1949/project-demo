export const downloadFile = (data: BlobPart, fileName: string) => {
  const blob = new Blob([data], { type: "" });
  const url = window.URL.createObjectURL(blob);
  downloadFileUrl(url, fileName);
};

export const downloadFileUrl = (url: string, fileName: string) => {
  const aLinkElement = document.createElement("a");
  aLinkElement.setAttribute("href", url);
  aLinkElement.setAttribute("downLoad", fileName);
  aLinkElement.click();
  aLinkElement.remove();
};
