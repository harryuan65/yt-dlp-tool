const { contextBridge, ipcRenderer } = require("electron");

// 暴露安全的 API 給渲染進程
contextBridge.exposeInMainWorld("electronAPI", {
  // 檢查工具是否已安裝
  checkYtdlp: () => ipcRenderer.invoke("check-ytdlp"),
  checkFfmpeg: () => ipcRenderer.invoke("check-ffmpeg"),

  // 獲取預設下載位置
  getDefaultDownloadPath: () => ipcRenderer.invoke("get-default-download-path"),

  // 偵測串流格式
  detectStreamFormats: (url) =>
    ipcRenderer.invoke("detect-stream-formats", url),

  // 選擇下載位置
  selectDownloadPath: () => ipcRenderer.invoke("select-download-path"),

  // 下載影片
  downloadVideo: (url, options, downloadPath) =>
    ipcRenderer.invoke("download-video", { url, options, downloadPath }),

  // 開啟資料夾
  openFolder: (path) => ipcRenderer.invoke("open-folder", path),

  // 監聽下載進度
  onDownloadProgress: (callback) => {
    ipcRenderer.on("download-progress", callback);
  },

  // 移除監聽器
  removeDownloadProgressListener: (callback) => {
    ipcRenderer.removeListener("download-progress", callback);
  },

  // 轉檔功能
  convertFile: (options) => ipcRenderer.invoke("convert-file", options),

  // 監聽轉檔進度
  onConversionProgress: (callback) => {
    ipcRenderer.on("conversion-progress", callback);
  },

  // 移除轉檔進度監聽器
  removeConversionProgressListener: (callback) => {
    ipcRenderer.removeListener("conversion-progress", callback);
  },

  // 視窗控制
  closeWindow: () => ipcRenderer.invoke("close-window"),
  minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
  maximizeWindow: () => ipcRenderer.invoke("maximize-window"),
});
