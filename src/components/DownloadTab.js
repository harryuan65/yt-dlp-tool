import React, { useState, useEffect } from "react";
import styled from "styled-components";
import UrlInput from "./UrlInput";
import OptionsPanel from "./OptionsPanel";
import DownloadButton from "./DownloadButton";
import StatusPanel from "./StatusPanel";

const TabContent = styled.div`
  background-color: #252526;
  border: 1px solid #3e3e42;
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const AudioOptions = styled.div`
  background-color: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 6px;
  padding: 16px;
`;

const AudioTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
`;

const AudioToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #007acc;
  }

  &:checked + span:before {
    transform: translateX(20px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #5a5a5a;
  transition: 0.2s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.2s;
    border-radius: 50%;
  }
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  color: #cccccc;
`;

const AudioFormatOptions = styled.div`
  display: flex;
  gap: 12px;
  opacity: ${(props) => (props.$enabled ? 1 : 0.5)};
  transition: opacity 0.2s ease;
`;

const FormatOption = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 12px;
  color: #cccccc;
`;

const RadioInput = styled.input`
  margin: 0;
`;

const DownloadPathSection = styled.div`
  background-color: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 6px;
  padding: 16px;
`;

const PathTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
`;

const PathContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const PathDisplay = styled.div`
  flex: 1;
  padding: 8px 12px;
  background-color: #2d2d30;
  border: 1px solid #5a5a5a;
  border-radius: 4px;
  color: #cccccc;
  font-size: 12px;
  min-height: 20px;
  display: flex;
  align-items: center;
`;

const PathButton = styled.button`
  padding: 8px 16px;
  background-color: #007acc;
  border: none;
  border-radius: 4px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: #0086d1;
  }
`;

function DownloadTab({ toolsStatus }) {
  const [url, setUrl] = useState("");
  const [options, setOptions] = useState({
    format: "best",
    quality: "1080p",
  });
  const [audioOnly, setAudioOnly] = useState(false);
  const [audioFormat, setAudioFormat] = useState("mp3");
  const [downloadPath, setDownloadPath] = useState("");
  const [status, setStatus] = useState("ready");
  const [progress, setProgress] = useState(
    "準備就緒，請輸入 URL 並選擇下載位置"
  );
  const [logs, setLogs] = useState(["準備就緒，請輸入 URL 並選擇下載位置"]);

  // 初始化預設下載位置
  useEffect(() => {
    if (!window.electronAPI) {
      return;
    }

    const setDefaultPath = async () => {
      try {
        const result = await window.electronAPI.getDefaultDownloadPath();
        if (result.success) {
          setDownloadPath(result.path);
          const msg = `預設下載位置: ${result.path}`;
          setLogs((prev) => [...prev, msg]);
        }
      } catch (error) {
        console.error("獲取預設下載位置失敗:", error);
      }
    };

    setDefaultPath();
  }, []);

  // 監聽下載進度
  useEffect(() => {
    if (!window.electronAPI) {
      return;
    }

    const handleProgress = (event, data) => {
      setProgress((prev) => prev + data);
      setLogs((prev) => [...prev, data.toString()]);
    };

    window.electronAPI.onDownloadProgress(handleProgress);

    return () => {
      window.electronAPI.removeDownloadProgressListener(handleProgress);
    };
  }, []);

  const handleSelectPath = async () => {
    if (!window.electronAPI) {
      setStatus("error");
      const errorMsg = "請在 Electron 應用程式中使用此功能";
      setProgress(errorMsg);
      setLogs((prev) => [...prev, errorMsg]);
      return;
    }

    try {
      const result = await window.electronAPI.selectDownloadPath();
      if (result.success) {
        setDownloadPath(result.path);
        const successMsg = `下載位置已設定: ${result.path}`;
        setProgress(successMsg);
        setLogs((prev) => [...prev, successMsg]);
      }
    } catch (error) {
      setStatus("error");
      const errorMsg = `選擇位置失敗: ${error.message}`;
      setProgress(errorMsg);
      setLogs((prev) => [...prev, errorMsg]);
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      setStatus("error");
      const errorMsg = "請輸入有效的 URL";
      setProgress(errorMsg);
      setLogs((prev) => [...prev, errorMsg]);
      return;
    }

    if (!downloadPath) {
      setStatus("error");
      const errorMsg = "請先選擇下載位置";
      setProgress(errorMsg);
      setLogs((prev) => [...prev, errorMsg]);
      return;
    }

    if (!window.electronAPI) {
      setStatus("error");
      const errorMsg = "請在 Electron 應用程式中使用此功能";
      setProgress(errorMsg);
      setLogs((prev) => [...prev, errorMsg]);
      return;
    }

    if (!toolsStatus.ytdlp.installed) {
      setStatus("error");
      const errorMsg = "請先安裝 yt-dlp";
      setProgress(errorMsg);
      setLogs((prev) => [...prev, errorMsg]);
      return;
    }

    setStatus("downloading");
    const startMsg = "開始下載...";
    setProgress(startMsg);
    setLogs((prev) => [...prev, startMsg]);

    try {
      const downloadOptions = { ...options };

      // 如果選擇只要音檔
      if (audioOnly) {
        downloadOptions.format = "bestaudio";
        downloadOptions.audioFormat = audioFormat;
      }

      // 顯示即將執行的命令
      const commandMsg = `執行命令: yt-dlp ${url} --output "${downloadPath}/%(title)s.%(ext)s" --no-playlist${
        downloadOptions.format ? ` -f ${downloadOptions.format}` : ""
      }${
        downloadOptions.quality
          ? ` --format-sort res:${downloadOptions.quality}`
          : ""
      }${
        downloadOptions.audioFormat
          ? ` --extract-audio --audio-format ${downloadOptions.audioFormat}`
          : ""
      }`;
      setLogs((prev) => [...prev, commandMsg]);

      const result = await window.electronAPI.downloadVideo(
        url,
        downloadOptions,
        downloadPath
      );
      setStatus("success");
      const successMsg = `下載完成！檔案已儲存至: ${result.downloadPath}`;
      setProgress(successMsg);
      setLogs((prev) => [...prev, successMsg]);
    } catch (error) {
      setStatus("error");
      const errorMsg = `下載失敗: ${error.message}`;
      setProgress(errorMsg);
      setLogs((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <TabContent>
      <UrlInput
        value={url}
        onChange={setUrl}
        placeholder="請輸入 YouTube 或其他影片網站的 URL"
      />

      <OptionsPanel options={options} onChange={setOptions} />

      <AudioOptions>
        <AudioTitle>音檔選項</AudioTitle>
        <AudioToggle>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={audioOnly}
              onChange={(e) => setAudioOnly(e.target.checked)}
            />
            <ToggleSlider />
          </ToggleSwitch>
          <ToggleLabel>只要音檔</ToggleLabel>
        </AudioToggle>

        <AudioFormatOptions $enabled={audioOnly}>
          <FormatOption>
            <RadioInput
              type="radio"
              name="audioFormat"
              value="mp3"
              checked={audioFormat === "mp3"}
              onChange={(e) => setAudioFormat(e.target.value)}
              disabled={!audioOnly}
            />
            MP3
          </FormatOption>
          <FormatOption>
            <RadioInput
              type="radio"
              name="audioFormat"
              value="wav"
              checked={audioFormat === "wav"}
              onChange={(e) => setAudioFormat(e.target.value)}
              disabled={!audioOnly}
            />
            WAV
          </FormatOption>
        </AudioFormatOptions>
      </AudioOptions>

      <DownloadPathSection>
        <PathTitle>下載位置</PathTitle>
        <PathContainer>
          <PathDisplay>{downloadPath || "尚未選擇下載位置"}</PathDisplay>
          <PathButton onClick={handleSelectPath}>📁 選擇位置</PathButton>
        </PathContainer>
      </DownloadPathSection>

      <DownloadButton
        onClick={handleDownload}
        disabled={status === "downloading"}
      />

      <StatusPanel status={status} progress={logs.join("")} />
    </TabContent>
  );
}

export default DownloadTab;
