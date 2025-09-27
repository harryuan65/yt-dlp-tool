function buildYtDlpCommandArgs({ options, downloadPath, url }) {
  let args = [`--output`, `${downloadPath}/%(title)s.%(ext)s`];

  // 處理自訂格式選項
  if (
    options.enableVideo &&
    options.enableAudio &&
    options.videoFormat &&
    options.audioFormat
  ) {
    args.push(`-f`, `${options.videoFormat}+${options.audioFormat}`);
  } else if (options.enableVideo && options.videoFormat) {
    args.push(`-f`, options.videoFormat);
  } else if (options.enableAudio && options.audioFormat) {
    args.push(`-f`, options.audioFormat);
  } else if (options.format && options.format !== "auto") {
    args.push(`-f`, options.format);
  }

  if (options.audioOnly && options.audioOutputFormat) {
    args.push(`--extract-audio`, `--audio-format`, options.audioOutputFormat);
  }

  args.push(url);

  return args;
}

function buildFfmpegCommandArgs({
  filePath,
  conversionType,
  outputFormat,
  outputDir,
}) {
  let args = [`-i`, filePath];

  // 根據轉換類型設定編碼參數
  if (conversionType === "image") {
    args.push(`-q:v`, "2");
  } else if (conversionType === "video") {
    args.push(`-c:v`, "libx264");
    args.push(`-c:a`, "aac");
  } else if (conversionType === "audio") {
    args.push(`-c:a`, "libmp3lame");
  }

  const fileName = filePath.split("/").pop();
  const originalName = fileName.replace(/\.[^/.]+$/, ""); // 移除原副檔名
  const outputPath = `${outputDir}/${originalName}.${outputFormat}`;

  args.push(outputPath);

  console.log("args", args);
  return args;
}

// 也支援 CommonJS require（給 Electron 主進程使用）
module.exports = {
  buildYtDlpCommandArgs,
  buildFfmpegCommandArgs,
};
