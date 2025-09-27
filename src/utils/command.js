function buildCommandArgs({ options, downloadPath, url }) {
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

// 也支援 CommonJS require（給 Electron 主進程使用）
module.exports = { buildCommandArgs };
