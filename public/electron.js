const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const {
  buildYtDlpCommandArgs,
  buildFfmpegCommandArgs,
} = require("../src/utils/command");

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
function getDefaultDownloadPath() {
  const homeDir = os.homedir();
  // const platform = os.platform();

  return path.join(homeDir, "Downloads");
}

// 獲取預設下載位置
ipcMain.handle("get-default-download-path", () => {
  return getDefaultDownloadPath();
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
        const commandArgs = buildYtDlpCommandArgs({
          options,
          downloadPath,
          url,
        });

        // 顯示完整命令
        const fullCommand = `yt-dlp ${commandArgs.join(" ")}`;
        mainWindow.webContents.send(
          "download-progress",
          `\n完整命令: ${fullCommand}\n`
        );

        const ytdlp = spawn("yt-dlp", commandArgs);
        let output = "";
        let errorOutput = "";

        ytdlp.stdout.on("data", (data) => {
          output += data.toString();
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
  "convert-file",
  async (event, { filePath, conversionType, outputFormat, outputDir }) => {
    return new Promise((resolve, reject) => {
      startConversion();

      function startConversion() {
        // 使用批次轉換
        const ffmpegArgs = buildFfmpegCommandArgs({
          filePath,
          conversionType,
          outputFormat,
          outputDir,
        });

        console.log("ffmpegArgs", ffmpegArgs);
        // 發送完整的命令到渲染進程
        const fullArgsString = ffmpegArgs.join(" ");
        mainWindow.webContents.send(
          "conversion-progress",
          `\n完整命令: ffmpeg ${fullArgsString}\n`
        );

        const ffmpeg = spawn("ffmpeg", ffmpegArgs);
        let output = "";
        let errorOutput = "";

        ffmpeg.stdout.on("data", (data) => {
          output += data.toString();
          mainWindow.webContents.send("conversion-progress", data.toString());
        });

        ffmpeg.stderr.on("data", (data) => {
          errorOutput += data.toString();
          mainWindow.webContents.send("conversion-progress", data.toString());
        });

        ffmpeg.on("close", (code) => {
          if (code === 0) {
            resolve({ success: true, outputDir });
          } else {
            reject(new Error(`轉檔失敗: ${errorOutput}`));
          }
        });

        ffmpeg.on("error", (error) => {
          reject(new Error(`轉檔錯誤: ${error.message}`));
        });
      }
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

// 開啟資料夾處理器
ipcMain.handle("open-folder", async (event, folderPath) => {
  try {
    await shell.openPath(folderPath);
    return { success: true };
  } catch (error) {
    console.error("開啟資料夾失敗:", error);
    return { success: false, error: error.message };
  }
});
