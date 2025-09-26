const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const { buildCommand } = require("../src/utils/command");

// 保持對視窗物件的全域引用
let mainWindow;

function createWindow() {
  // 建立瀏覽器視窗
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
    titleBarStyle: "hiddenInset", // 隱藏標題列但保留系統控制按鈕
    trafficLightPosition: { x: 20, y: 20 }, // 將系統控制按鈕移到左上角
    backgroundColor: "#1e1e1e", // 深色背景
    show: false, // 先不顯示，等載入完成再顯示
  });

  // 載入 React 應用程式
  // 在開發模式下，我們總是載入 localhost:3000
  mainWindow.loadURL("http://localhost:3000");

  // 開發模式下開啟開發者工具
  mainWindow.webContents.openDevTools();

  // 當視窗準備好時顯示
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // 當視窗被關閉時
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// 當 Electron 完成初始化並準備建立瀏覽器視窗時呼叫此方法
app.whenReady().then(createWindow);

// 當所有視窗都關閉時退出應用程式
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC 處理器 - 處理來自渲染進程的請求
ipcMain.handle("check-ytdlp", async () => {
  try {
    const { exec } = require("child_process");
    return new Promise((resolve) => {
      exec("yt-dlp --version", (error, stdout) => {
        resolve({ installed: !error, version: stdout.trim() });
      });
    });
  } catch (error) {
    return { installed: false, error: error.message };
  }
});

ipcMain.handle("check-ffmpeg", async () => {
  try {
    const { exec } = require("child_process");
    return new Promise((resolve) => {
      exec("ffmpeg -version", (error, stdout) => {
        resolve({ installed: !error, version: stdout.split("\n")[0] });
      });
    });
  } catch (error) {
    return { installed: false, error: error.message };
  }
});

// 獲取預設下載位置
function getDefaultDownloadPath() {
  const homeDir = os.homedir();
  const platform = os.platform();

  if (platform === "darwin") {
    // macOS
    return path.join(homeDir, "Downloads");
  } else if (platform === "win32") {
    // Windows
    return path.join(homeDir, "Downloads");
  } else {
    // Linux 或其他
    return path.join(homeDir, "Downloads");
  }
}

// 選擇下載位置
ipcMain.handle("select-download-path", async () => {
  try {
    const defaultPath = getDefaultDownloadPath();

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
      title: "選擇下載位置",
      defaultPath: defaultPath,
    });

    if (result.canceled) {
      return { success: false, error: "使用者取消選擇" };
    }

    return { success: true, path: result.filePaths[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 獲取預設下載位置
ipcMain.handle("get-default-download-path", () => {
  return { success: true, path: getDefaultDownloadPath() };
});

// 偵測串流格式
ipcMain.handle("detect-stream-formats", async (event, url) => {
  return new Promise((resolve) => {
    const ytdlp = spawn("yt-dlp", ["--list-formats", url]);
    let output = "";
    let errorOutput = "";

    ytdlp.stdout.on("data", (data) => {
      output += data.toString();
    });

    ytdlp.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    ytdlp.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true, formats: output });
      } else {
        resolve({ success: false, error: errorOutput });
      }
    });

    ytdlp.on("error", (error) => {
      resolve({ success: false, error: error.message });
    });
  });
});

ipcMain.handle(
  "download-video",
  async (event, { url, options, downloadPath }) => {
    return new Promise((resolve, reject) => {
      // 如果沒有提供下載路徑，讓使用者選擇
      if (!downloadPath) {
        dialog
          .showOpenDialog(mainWindow, {
            properties: ["openDirectory"],
            title: "選擇下載位置",
          })
          .then((result) => {
            if (result.canceled) {
              reject(new Error("使用者取消選擇"));
              return;
            }
            downloadPath = result.filePaths[0];
            startDownload();
          })
          .catch(reject);
      } else {
        startDownload();
      }

      function startDownload() {
        const fullCommand = buildCommand({ options, downloadPath, url });
        mainWindow.webContents.send(
          "download-progress",
          `\n完整命令: ${fullCommand}\n`
        );

        const ytdlp = spawn("yt-dlp", ytdlpArgs);
        let output = "";
        let errorOutput = "";

        ytdlp.stdout.on("data", (data) => {
          output += data.toString();
          // 發送進度更新到渲染進程
          mainWindow.webContents.send("download-progress", data.toString());
        });

        ytdlp.stderr.on("data", (data) => {
          errorOutput += data.toString();
        });

        ytdlp.on("close", (code) => {
          if (code === 0) {
            resolve({ success: true, output, downloadPath });
          } else {
            reject(new Error(`下載失敗: ${errorOutput}`));
          }
        });

        ytdlp.on("error", (error) => {
          reject(error);
        });
      }
    });
  }
);

ipcMain.handle("open-folder", async (event, folderPath) => {
  shell.showItemInFolder(folderPath);
});

// 轉檔功能
ipcMain.handle(
  "convert-files",
  async (event, { files, conversionType, outputFormat }) => {
    return new Promise((resolve, reject) => {
      // 讓使用者選擇輸出位置
      dialog
        .showOpenDialog(mainWindow, {
          properties: ["openDirectory"],
          title: "選擇輸出位置",
        })
        .then((result) => {
          if (result.canceled) {
            reject(new Error("使用者取消選擇"));
            return;
          }

          const outputPath = result.filePaths[0];
          const convertPromises = files.map((file) => {
            return new Promise((resolveFile, rejectFile) => {
              const inputPath = file.path;
              const fileName = path.parse(file.name).name;
              const outputFile = path.join(
                outputPath,
                `${fileName}.${outputFormat}`
              );

              let ffmpegArgs = ["-i", inputPath];

              // 根據轉檔類型添加參數
              if (conversionType === "image") {
                ffmpegArgs.push("-q:v", "2"); // 高品質
              } else if (conversionType === "video") {
                ffmpegArgs.push("-c:v", "libx264", "-c:a", "aac"); // 使用 H.264 編碼
              } else if (conversionType === "audio") {
                ffmpegArgs.push("-c:a", "libmp3lame"); // MP3 編碼
              }

              ffmpegArgs.push(outputFile);

              // 發送完整的命令到渲染進程
              const fullCommand = `ffmpeg ${ffmpegArgs.join(" ")}`;
              mainWindow.webContents.send(
                "conversion-progress",
                `\n完整命令: ${fullCommand}\n`
              );

              const ffmpeg = spawn("ffmpeg", ffmpegArgs);
              let output = "";
              let errorOutput = "";

              ffmpeg.stdout.on("data", (data) => {
                output += data.toString();
                mainWindow.webContents.send(
                  "conversion-progress",
                  data.toString()
                );
              });

              ffmpeg.stderr.on("data", (data) => {
                errorOutput += data.toString();
                // ffmpeg 的進度資訊通常在 stderr
                mainWindow.webContents.send(
                  "conversion-progress",
                  data.toString()
                );
              });

              ffmpeg.on("close", (code) => {
                if (code === 0) {
                  resolveFile({ success: true, outputFile, output });
                } else {
                  rejectFile(new Error(`轉檔失敗: ${errorOutput}`));
                }
              });

              ffmpeg.on("error", (error) => {
                rejectFile(error);
              });
            });
          });

          Promise.all(convertPromises)
            .then((results) => {
              resolve({ success: true, results, outputPath });
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }
);

// 視窗控制處理器
ipcMain.handle("close-window", () => {
  mainWindow.close();
});

ipcMain.handle("minimize-window", () => {
  mainWindow.minimize();
});

ipcMain.handle("maximize-window", () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});
