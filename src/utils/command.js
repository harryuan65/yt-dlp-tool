function buildCommandArgs({ options, downloadPath, url }) {
  let args = [`--output`, `${downloadPath}/%(title)s.%(ext)s`];

  // 處理自訂格式選項
  if (
    options.enableVideo &&
    options.enableAudio &&
    options.videoFormat &&
    options.audioFormat
  ) {
    // 影片+音檔組合
    args.push(`-f`, `${options.videoFormat}+${options.audioFormat}`);
  } else if (options.enableVideo && options.videoFormat) {
    // 只要影片
    args.push(`-f`, options.videoFormat);
  } else if (options.enableAudio && options.audioFormat) {
    // 只要音檔
    args.push(`-f`, options.audioFormat);
    if (options.audioOutputFormat) {
      args.push(`--extract-audio`, `--audio-format`, options.audioOutputFormat);
    }
  } else if (options.format && options.format !== "auto") {
    // 傳統格式選項
    args.push(`-f`, options.format);
  }

  if (!options.enableVideo && !options.enableAudio && options.audioFormat) {
    args.push(`--extract-audio`, `--audio-format`, options.audioFormat);
  }

  args.push(url);

  return args;
}

// 也支援 CommonJS require（給 Electron 主進程使用）
module.exports = { buildCommandArgs };
