export function buildCommand({ options, downloadPath, url }) {
  const ytdlpArgs = [
    "--output",
    `${downloadPath}%(title)s.%(ext)s`,
    "--no-playlist",
  ];

  // 根據新的格式選擇邏輯添加參數
  if (options.enableVideo && options.enableAudio) {
    // 影片+音檔組合
    ytdlpArgs.push("-f", `${options.videoFormat}+${options.audioFormat}`);
  } else if (options.enableVideo) {
    // 只要影片
    ytdlpArgs.push("-f", options.videoFormat);
  } else if (options.enableAudio) {
    // 只要音檔
    ytdlpArgs.push("-f", options.audioFormat);
    ytdlpArgs.push("--extract-audio");
    ytdlpArgs.push("--audio-format", options.audioOutputFormat);
  } else {
    // 預設行為
    ytdlpArgs.push("-f", "best");
  }

  // URL 放在最後
  ytdlpArgs.push(url);

  // 發送完整的命令到渲染進程
  const fullCommand = `yt-dlp ${ytdlpArgs.join(" ")}`;

  return fullCommand;
}
