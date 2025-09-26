import React, { useState, useEffect } from "react";
import styled from "styled-components";
import UrlInput from "./UrlInput";
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

const OptionSection = styled.div`
  background-color: ${(props) => (props.$disabled ? "#2d2d2d" : "#1e1e1e")};
  border: 1px solid ${(props) => (props.$disabled ? "#555" : "#3e3e42")};
  border-radius: 6px;
  padding: 16px;
  opacity: ${(props) => (props.$disabled ? "0.6" : "1")};
  transition: opacity 0.2s;
`;

const OptionTitle = styled.h3`
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

// 自訂選項樣式組件
const CustomOptionsToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const CustomOptionsSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  background-color: ${(props) => (props.$enabled ? "#007acc" : "#555")};
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
`;

const CustomOptionsInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const CustomOptionsSlider = styled.span`
  position: absolute;
  top: 2px;
  left: ${(props) => (props.$enabled ? "22px" : "2px")};
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  transition: left 0.2s;
`;

const CustomOptionsLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #cccccc;
  cursor: pointer;
`;

const DetectButton = styled.button`
  background: #007acc;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
  margin-bottom: 16px;

  &:hover:not(:disabled) {
    background: #005a9e;
  }

  &:disabled {
    background: #555;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

function DownloadTab({ toolsStatus }) {
  const [url, setUrl] = useState("");
  const [options, setOptions] = useState({
    format: "mp4",
    quality: "1080p",
  });
  const [audioOnly, setAudioOnly] = useState(false);
  const [audioFormat, setAudioFormat] = useState("mp3");
  const [downloadPath, setDownloadPath] = useState("");
  const [status, setStatus] = useState("ready");
  const [logs, setLogs] = useState(["準備就緒，請輸入 URL 並選擇下載位置"]);
  const [isDetectingFormats, setIsDetectingFormats] = useState(false);
  const [formatOptions, setFormatOptions] = useState([]);
  const [isFormatDetected, setIsFormatDetected] = useState(false);
  const [enableCustomOptions, setEnableCustomOptions] = useState(true);

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
      setLogs((prev) => [...prev, errorMsg]);
      return;
    }

    try {
      const result = await window.electronAPI.selectDownloadPath();
      if (result.success) {
        setDownloadPath(result.path);
        const successMsg = `下載位置已設定: ${result.path}`;
        setLogs((prev) => [...prev, successMsg]);
      }
    } catch (error) {
      setStatus("error");
      const errorMsg = `選擇位置失敗: ${error.message}`;
      setLogs((prev) => [...prev, errorMsg]);
    }
  };

  const handleDetectFormats = async () => {
    if (!url || !window.electronAPI) {
      return;
    }

    setIsDetectingFormats(true);
    setLogs((prev) => [...prev, "正在偵測可用的串流格式..."]);

    try {
      const result = await window.electronAPI.detectStreamFormats(url);
      if (result.success) {
        setLogs((prev) => [...prev, "原始格式輸出:", result.formats]);
        const parsedFormats = parseFormats(result.formats);
        setLogs((prev) => [
          ...prev,
          `解析到 ${parsedFormats.length} 個格式選項`,
        ]);
        setFormatOptions(parsedFormats);
        setIsFormatDetected(true);
        setLogs((prev) => [...prev, "串流格式偵測完成！已生成格式選項。"]);
      } else {
        setLogs((prev) => [...prev, `偵測失敗: ${result.error}`]);
      }
    } catch (error) {
      setLogs((prev) => [...prev, `偵測失敗: ${error.message}`]);
    } finally {
      setIsDetectingFormats(false);
    }
  };

  // 解析 yt-dlp 格式輸出
  const parseFormats = (formatOutput) => {
    const lines = formatOutput.split("\n");
    const formats = [];

    for (const line of lines) {
      // 跳過標題行和分隔線
      if (
        line.includes("ID  EXT") ||
        line.includes("---") ||
        line.trim() === ""
      ) {
        continue;
      }

      // 尋找包含 "video only" 或 "audio only" 的行
      if (line.includes("video only") || line.includes("audio only")) {
        // 使用更簡單的解析方式
        const parts = line.trim().split(/\s+/);

        if (parts.length >= 3) {
          const id = parts[0];
          const ext = parts[1];
          const resolution = parts[2];
          const type = line.includes("video only")
            ? "video only"
            : "audio only";

          // 對於影片格式，檢查解析度
          if (
            type === "video only" &&
            resolution.includes("x") &&
            !isNaN(parseInt(resolution.split("x")[0]))
          ) {
            const resHeight = resolution.split("x")[1];
            const quality = resHeight ? `${resHeight}p` : resolution;

            // 提取檔案大小
            const sizeMatch = line.match(/(\d+\.?\d*[kMG]?B)/);
            const filesize = sizeMatch ? sizeMatch[1] : "未知大小";

            // 提取畫質描述 (例如: 144p, 720p60)
            const qualityMatch = line.match(/(\d+p\d*)/);
            const qualityDesc = qualityMatch ? qualityMatch[1] : quality;

            formats.push({
              id,
              ext: ext.toUpperCase(),
              resolution,
              quality: qualityDesc,
              filesize,
              type,
              label: `${ext.toUpperCase()}(${id}) ${resolution} ${qualityDesc} video only`,
            });
          }
          // 對於音檔格式
          else if (type === "audio only") {
            // 提取檔案大小
            const sizeMatch = line.match(/(\d+\.?\d*[kMG]?B)/);
            const filesize = sizeMatch ? sizeMatch[1] : "未知大小";

            // 提取音質描述
            const qualityMatch = line.match(/(low|medium|high)/);
            const qualityDesc = qualityMatch ? qualityMatch[1] : "未知音質";

            formats.push({
              id,
              ext: ext.toUpperCase(),
              resolution: "audio",
              quality: qualityDesc,
              filesize,
              type,
              label: `${ext.toUpperCase()}(${id}) ${qualityDesc} audio only`,
            });
          }
        }
      }
    }

    // 按解析度高度排序（從高到低）
    return formats.sort((a, b) => {
      const aHeight = parseInt(a.resolution.split("x")[1]) || 0;
      const bHeight = parseInt(b.resolution.split("x")[1]) || 0;
      return bHeight - aHeight;
    });
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      setStatus("error");
      const errorMsg = "請輸入有效的 URL";
      setLogs((prev) => [...prev, errorMsg]);
      return;
    }

    if (!downloadPath) {
      setStatus("error");
      const errorMsg = "請先選擇下載位置";
      setLogs((prev) => [...prev, errorMsg]);
      return;
    }

    // 如果是影片下載且未偵測格式，則要求先偵測
    if (!audioOnly && !isFormatDetected) {
      setStatus("error");
      const errorMsg = "請先點擊「偵測串流格式」來獲取可用的格式選項";
      setLogs((prev) => [...prev, errorMsg]);
      return;
    }

    if (!window.electronAPI) {
      setStatus("error");
      const errorMsg = "請在 Electron 應用程式中使用此功能";
      setLogs((prev) => [...prev, errorMsg]);
      return;
    }

    if (!toolsStatus.ytdlp.installed) {
      setStatus("error");
      const errorMsg = "請先安裝 yt-dlp";
      setLogs((prev) => [...prev, errorMsg]);
      return;
    }

    setStatus("downloading");
    const startMsg = "開始下載...";
    setLogs((prev) => [...prev, startMsg]);

    try {
      const downloadOptions = { ...options };

      // 如果選擇只要音檔
      if (audioOnly) {
        downloadOptions.format = "bestaudio";
        downloadOptions.audioFormat = audioFormat;
      }

      // 顯示即將執行的命令
      const commandMsg = `執行命令: yt-dlp --output "${downloadPath}/%(title)s.%(ext)s" --no-playlist${
        downloadOptions.format && downloadOptions.format !== "auto"
          ? ` -f ${downloadOptions.format}`
          : ""
      }${
        downloadOptions.quality
          ? ` --format-sort res:${downloadOptions.quality}`
          : ""
      }${
        downloadOptions.audioFormat
          ? ` --extract-audio --audio-format ${downloadOptions.audioFormat}`
          : ""
      } ${url}`;
      setLogs((prev) => [...prev, commandMsg]);

      const result = await window.electronAPI.downloadVideo(
        url,
        downloadOptions,
        downloadPath
      );
      setStatus("success");
      const successMsg = `下載完成！檔案已儲存至: ${result.downloadPath}`;
      setLogs((prev) => [...prev, successMsg]);
    } catch (error) {
      setStatus("error");
      const errorMsg = `下載失敗: ${error.message}`;
      setLogs((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <TabContent>
      <UrlInput
        value={url}
        onChange={setUrl}
        placeholder="請輸入 YouTube 或其他影片網站的 URL"
        required
      />

      <OptionSection>
        <OptionTitle>
          自訂影片選項<span>:請先輸入網址以獲取可用的串流格式</span>
        </OptionTitle>
        <CustomOptionsToggle>
          <CustomOptionsSwitch $enabled={enableCustomOptions}>
            <CustomOptionsInput
              type="checkbox"
              checked={enableCustomOptions}
              onChange={(e) => setEnableCustomOptions(e.target.checked)}
            />
            <CustomOptionsSlider $enabled={enableCustomOptions} />
          </CustomOptionsSwitch>
          <CustomOptionsLabel
            onClick={() => setEnableCustomOptions(!enableCustomOptions)}
          >
            自訂影片選項
          </CustomOptionsLabel>
        </CustomOptionsToggle>

        {enableCustomOptions && (
          <>
            <DetectButton
              onClick={handleDetectFormats}
              disabled={!url || isDetectingFormats}
            >
              {isDetectingFormats ? "偵測中..." : "🔍 偵測串流格式"}
            </DetectButton>

            {isFormatDetected && (
              <FormatSelectionPanel
                videoFormats={formatOptions.filter(
                  (f) => f.type === "video only"
                )}
                audioFormats={formatOptions.filter(
                  (f) => f.type === "audio only"
                )}
                options={options}
                onChange={setOptions}
              />
            )}
          </>
        )}
      </OptionSection>
      <OptionSection $disabled={enableCustomOptions}>
        <OptionTitle>音檔選項</OptionTitle>
        <AudioToggle>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={audioOnly}
              onChange={(e) => setAudioOnly(e.target.checked)}
              disabled={enableCustomOptions}
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
              disabled={!audioOnly || enableCustomOptions}
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
              disabled={!audioOnly || enableCustomOptions}
            />
            WAV
          </FormatOption>
        </AudioFormatOptions>
      </OptionSection>

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

      <StatusPanel status={status} progress={logs.join("\n")} />
    </TabContent>
  );
}

// 格式選擇面板樣式組件
const FormatSelectionContainer = styled.div`
  background-color: #252526;
  border: 1px solid #3e3e42;
  border-radius: 8px;
  padding: 16px;
`;

const FormatSelectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
`;

const FormatColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const FormatColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FormatToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormatToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  background-color: ${(props) => (props.$enabled ? "#007acc" : "#555")};
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
`;

const FormatToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const FormatToggleSlider = styled.span`
  position: absolute;
  top: 2px;
  left: ${(props) => (props.$enabled ? "22px" : "2px")};
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  transition: left 0.2s;
`;

const FormatLabel = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: #cccccc;
  cursor: pointer;
`;

const FormatSelect = styled.select`
  background-color: #3c3c3c;
  border: 1px solid #555555;
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
  padding: 8px 12px;
  outline: none;

  &:focus {
    border-color: #007acc;
  }

  &:disabled {
    background-color: #2d2d2d;
    color: #666666;
    cursor: not-allowed;
  }
`;

const AudioFormatOption = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #cccccc;
  cursor: pointer;
`;

// 格式選擇面板組件
const FormatSelectionPanel = ({
  videoFormats,
  audioFormats,
  options,
  onChange,
}) => {
  const [enableVideo, setEnableVideo] = useState(false);
  const [enableAudio, setEnableAudio] = useState(false);
  const [selectedVideoFormat, setSelectedVideoFormat] = useState("");
  const [selectedAudioFormat, setSelectedAudioFormat] = useState("");
  const [audioOutputFormat, setAudioOutputFormat] = useState("mp3");

  const handleVideoToggle = (enabled) => {
    setEnableVideo(enabled);
    if (!enabled) {
      setSelectedVideoFormat("");
    }
  };

  const handleAudioToggle = (enabled) => {
    setEnableAudio(enabled);
    if (!enabled) {
      setSelectedAudioFormat("");
    }
  };

  const handleVideoFormatChange = (e) => {
    const formatId = e.target.value;
    setSelectedVideoFormat(formatId);
    onChange({
      ...options,
      videoFormat: formatId,
      enableVideo: enableVideo,
      enableAudio: enableAudio,
      audioFormat: selectedAudioFormat,
      audioOutputFormat: audioOutputFormat,
    });
  };

  const handleAudioFormatChange = (e) => {
    const formatId = e.target.value;
    setSelectedAudioFormat(formatId);
    onChange({
      ...options,
      videoFormat: selectedVideoFormat,
      enableVideo: enableVideo,
      enableAudio: enableAudio,
      audioFormat: formatId,
      audioOutputFormat: audioOutputFormat,
    });
  };

  return (
    <FormatSelectionContainer>
      <FormatSelectionTitle>格式選擇</FormatSelectionTitle>
      <FormatColumns>
        {/* 左側：影片格式 */}
        <FormatColumn>
          <FormatToggle>
            <FormatToggleSwitch $enabled={enableVideo}>
              <FormatToggleInput
                type="checkbox"
                checked={enableVideo}
                onChange={(e) => handleVideoToggle(e.target.checked)}
              />
              <FormatToggleSlider $enabled={enableVideo} />
            </FormatToggleSwitch>
            <FormatLabel onClick={() => handleVideoToggle(!enableVideo)}>
              影片格式
            </FormatLabel>
          </FormatToggle>

          {enableVideo && (
            <FormatSelect
              value={selectedVideoFormat}
              onChange={handleVideoFormatChange}
            >
              <option value="">選擇影片格式</option>
              {videoFormats.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.label}
                </option>
              ))}
            </FormatSelect>
          )}
        </FormatColumn>

        {/* 右側：音檔格式 */}
        <FormatColumn>
          <FormatToggle>
            <FormatToggleSwitch $enabled={enableAudio}>
              <FormatToggleInput
                type="checkbox"
                checked={enableAudio}
                onChange={(e) => handleAudioToggle(e.target.checked)}
              />
              <FormatToggleSlider $enabled={enableAudio} />
            </FormatToggleSwitch>
            <FormatLabel onClick={() => handleAudioToggle(!enableAudio)}>
              音檔格式
            </FormatLabel>
          </FormatToggle>

          {enableAudio && (
            <>
              <FormatSelect
                value={selectedAudioFormat}
                onChange={handleAudioFormatChange}
              >
                <option value="">選擇音檔格式</option>
                {audioFormats.map((format) => (
                  <option key={format.id} value={format.id}>
                    {format.label}
                  </option>
                ))}
              </FormatSelect>
            </>
          )}
        </FormatColumn>
      </FormatColumns>
    </FormatSelectionContainer>
  );
};

export default DownloadTab;
