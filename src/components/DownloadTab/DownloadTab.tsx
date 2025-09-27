import React, { useState, useEffect } from "react";
import styled from "styled-components";
import UrlInput from "../UrlInput";
import DownloadButton from "../DownloadButton";
import StatusPanel from "../StatusPanel";
import { buildCommandArgs } from "../../utils/command.js";
import type { DownloadOptions, FormatOption } from "./DownloadTab.interface";
import { FormatSelectionPanel } from "./FormatSelectionPanel";

const TabContent = styled.div`
  background-color: #252526;
  border: 1px solid #3e3e42;
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
`;

const DownloadPathSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PathRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PathButton = styled.button`
  padding: 12px 16px;
  background-color: #007acc;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0; /* 防止按鈕被壓縮 */
  white-space: nowrap; /* 防止文字換行 */

  &:hover {
    background-color: #005a9e;
  }

  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const PathDisplay = styled.span`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  font-size: 12px;
  color: #cccccc;
  flex: 1; /* 佔據剩餘空間 */
  min-width: 0; /* 允許文字截斷 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const OptionSection = styled.div<{ $disabled?: boolean }>`
  background-color: ${(props: any) => (props.$disabled ? "#2d2d2d" : "#1e1e1e")};
  border: 1px solid ${(props: any) => (props.$disabled ? "#555" : "#3e3e42")};
  border-radius: 6px;
  padding: 16px;
  opacity: ${(props: any) => (props.$disabled ? "0.6" : "1")};
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
  gap: 8px;
  margin-bottom: 16px;
`;

const ToggleSwitch = styled.label<{ $enabled: boolean }>`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  background-color: ${(props: any) => (props.$enabled ? "#007acc" : "#555")};
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const ToggleSlider = styled.span<{ $enabled: boolean }>`
  position: absolute;
  top: 2px;
  left: ${(props: any) => (props.$enabled ? "22px" : "2px")};
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  transition: left 0.2s;
`;

const ToggleLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #cccccc;
  cursor: pointer;
`;

const AudioFormatOptions = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const FormatOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RadioInput = styled.input`
  margin: 0;
`;

const RadioLabel = styled.label`
  font-size: 14px;
  color: #cccccc;
  cursor: pointer;
`;

// 自訂選項樣式組件
const CustomOptionsToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const CustomOptionsSwitch = styled.label<{ $enabled: boolean }>`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  background-color: ${(props: any) => (props.$enabled ? "#007acc" : "#555")};
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
`;

const CustomOptionsInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const CustomOptionsSlider = styled.span<{ $enabled: boolean }>`
  position: absolute;
  top: 2px;
  left: ${(props: any) => (props.$enabled ? "22px" : "2px")};
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

const DetectHint = styled.span`
  margin-left: 12px;
  font-size: 12px;
  color: #cccccc;
`;

interface ToolsStatus {
  ytdlp: boolean;
  ffmpeg: boolean;
}

function DownloadTab({ toolsStatus }: { toolsStatus: ToolsStatus }) {
  const [url, setUrl] = useState("");
  const [downloadPath, setDownloadPath] = useState("");
  const [status, setStatus] = useState("ready");
  const [logs, setLogs] = useState(["準備就緒，請輸入 URL 並選擇下載位置"]);
  const [isDetectingFormats, setIsDetectingFormats] = useState(false);
  const [formatOptions, setFormatOptions] = useState<FormatOption[]>([]);
  const [isFormatDetected, setIsFormatDetected] = useState(false);
  const [enableCustomOptions, setEnableCustomOptions] = useState(true);
  const [options, setOptions] = useState<DownloadOptions>({
    enableVideo: false,
    enableAudio: false,
    videoFormat: "",
    audioFormat: "",
    audioOnly: false,
    audioOutputFormat: "mp3",
  });

  // 設定預設下載路徑
  useEffect(() => {
    if (!window.electronAPI) {
      return;
    }

    const setDefaultDownloadPath = async () => {
      try {
        const defaultPath = await window.electronAPI.getDefaultDownloadPath();
        setDownloadPath(defaultPath);
      } catch (error) {
        console.error("無法獲取預設下載路徑:", error);
      }
    };

    setDefaultDownloadPath();
  }, []);

  // 監聽下載進度
  useEffect(() => {
    if (!window.electronAPI) {
      return;
    }

    const handleProgress = (event: any, data: any) => {
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
      if (result.canceled) {
        return;
      }
      setDownloadPath(result.path);
      const successMsg = `下載位置已設定: ${result.path}`;
      setLogs((prev) => [...prev, successMsg]);
    } catch (error: any) {
      setStatus("error");
      const errorMsg = `選擇位置失敗: ${error.message}`;
      setLogs((prev) => [...prev, errorMsg]);
    }
  };

  const parseFormats = (formatOutput: string): FormatOption[] => {
    const lines = formatOutput.split("\n");
    const formats: FormatOption[] = [];

    for (const line of lines) {
      // 跳過標題行和分隔線
      if (line.includes("ID  EXT") || line.includes("---") || line.trim() === "") {
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
          const type = line.includes("video only") ? "video only" : "audio only";

          // 對於影片格式，檢查解析度
          if (type === "video only" && resolution.includes("x") && !isNaN(parseInt(resolution.split("x")[0]))) {
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

  const handleDetectFormats = async () => {
    if (!url) {
      setStatus("error");
      const errorMsg = "請輸入有效的 URL";
      setLogs((prev) => [...prev, errorMsg]);
      return;
    }

    if (!window.electronAPI) {
      setStatus("error");
      const errorMsg = "請在 Electron 應用程式中使用此功能";
      setLogs((prev) => [...prev, errorMsg]);
      return;
    }

    setIsDetectingFormats(true);
    setLogs((prev) => [...prev, "正在偵測串流格式..."]);
    setStatus("detecting");

    try {
      const result = await window.electronAPI.detectStreamFormats(url);
      if (result.success) {
        setLogs((prev) => [...prev, "原始格式輸出:", result.formats]);
        const parsedFormats = parseFormats(result.formats);
        setFormatOptions(parsedFormats);
        setIsFormatDetected(true);
        setLogs((prev) => [...prev, `解析到 ${parsedFormats.length} 個格式選項串流格式偵測完成！已生成格式選項。`]);
        setStatus("ready");
      } else {
        setStatus("error");
        const errorMsg = `偵測格式失敗: ${result.error}`;
        setLogs((prev) => [...prev, errorMsg]);
      }
    } catch (error: any) {
      setStatus("error");
      const errorMsg = `偵測格式失敗: ${error.message}`;
      setLogs((prev) => [...prev, errorMsg]);
    } finally {
      setIsDetectingFormats(false);
    }
  };

  const handleReset = () => {
    setStatus("ready");
    setLogs(["準備就緒，請輸入 URL 並選擇下載位置"]);
    setUrl("");
    setDownloadPath("");
    setIsFormatDetected(false);
    setFormatOptions([]);
    setEnableCustomOptions(true);
    setOptions({
      enableVideo: false,
      enableAudio: false,
      videoFormat: "",
      audioFormat: "",
      audioOnly: false,
      audioOutputFormat: "mp3",
    });
  };

  const switchEnableCustomOptions = (checked: boolean) => {
    setEnableCustomOptions(checked);
    if(checked) {
      setOptions({
        ...options,
        audioOnly: false,
      });
    }
  };

  const switchAudioOnlyMode = (checked: boolean) => {
    setOptions({
      ...options,
      audioOnly: checked,
    });
    if(checked) {
      setEnableCustomOptions(false);
    }
  };

  const handleAudioOutputFormatChange = (format: "mp3" | "wav") => {
    setOptions({
      ...options,
      audioOutputFormat: format,
    });
  };

  const handleDownload = async () => {
    console.log(JSON.stringify({options, enableCustomOptions}, null, 2));
    if (!url) {
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

    // 如果是自訂選項模式且影片下載且未偵測格式，則要求先偵測
    if (enableCustomOptions && !options.audioOnly && !isFormatDetected) {
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

    if (!toolsStatus.ytdlp) {
      setStatus("error");
      const errorMsg = "請先安裝 yt-dlp";
      setLogs((prev) => [...prev, errorMsg]);
      return;
    }

    setStatus("downloading");
    const startMsg = "開始下載...";
    setLogs((prev) => [...prev, startMsg]);

    try {
      // 顯示即將執行的命令
      const args = buildCommandArgs({
        options,
        downloadPath,
        url,
      });
      setLogs((prev) => [...prev, args.join(" ")]);

      const result = await window.electronAPI.downloadVideo(
        url,
        options,
        downloadPath
      );

      setStatus("success");
      const successMsg = `下載完成！檔案已儲存至: ${result.downloadPath}`;
      setLogs((prev) => [...prev, successMsg]);
    } catch (error: any) {
      setStatus("error");
      const errorMsg = `下載失敗: ${error.message}`;
      setLogs((prev) => [...prev, errorMsg]);
    }
  };

  const getDownloadStatus = () => status === "downloading"
  ? "downloading"
  : !url || !downloadPath
    ? "disabled"
    : "ready"

  return (
    <TabContent>
      <UrlInput
        value={url}
        onChange={setUrl}
        placeholder="請輸入 YouTube 或其他支援的影片 URL"
        required
      />

      <OptionSection $disabled={!enableCustomOptions}>
        <CustomOptionsToggle>
          <CustomOptionsSwitch $enabled={enableCustomOptions}>
            <CustomOptionsInput
              type="checkbox"
              checked={enableCustomOptions}
              onChange={(e) => switchEnableCustomOptions(e.target.checked)}
            />
            <CustomOptionsSlider $enabled={enableCustomOptions} />
          </CustomOptionsSwitch>
          <CustomOptionsLabel
            onClick={() => switchEnableCustomOptions(!enableCustomOptions)}
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
            <DetectHint>請先輸入網址以獲取可用的串流格式</DetectHint>
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
          <ToggleSwitch $enabled={options.audioOnly}>
            <ToggleInput
              type="checkbox"
              checked={options.audioOnly}
              onChange={(e) => switchAudioOnlyMode(e.target.checked)}
            />
            <ToggleSlider $enabled={options.audioOnly} />
          </ToggleSwitch>
          <ToggleLabel>
            只要音檔
          </ToggleLabel>
        </AudioToggle>

        {options.audioOnly && (
          <AudioFormatOptions>
            <FormatOption>
              <RadioInput
                type="radio"
                id="mp3"
                name="audioFormat"
                value="mp3"
                checked={options.audioOutputFormat === "mp3"}
                onChange={(e) => handleAudioOutputFormatChange("mp3")}
                disabled={!options.audioOnly}
              />
              <RadioLabel htmlFor="mp3">MP3</RadioLabel>
            </FormatOption>
            <FormatOption>
              <RadioInput
                type="radio"
                id="wav"
                name="audioFormat"
                value="wav"
                checked={options.audioOutputFormat === "wav"}
                onChange={(e) => handleAudioOutputFormatChange("wav")}
                disabled={!options.audioOnly}
              />
              <RadioLabel htmlFor="wav">WAV</RadioLabel>
            </FormatOption>
          </AudioFormatOptions>
        )}
      </OptionSection>

      <OptionSection>
        <SectionTitle>下載位置</SectionTitle>
        <PathRow>
          <PathDisplay>{downloadPath}</PathDisplay>
          <PathButton onClick={handleSelectPath}>
            選擇下載位置
          </PathButton>
        </PathRow>
      </OptionSection>

      <div style={{ display: 'flex', gap: '12px' }}>
        <DownloadButton
          onClick={handleDownload}
          status={
            getDownloadStatus()
          }
        />
        <button
          onClick={handleReset}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          重置
        </button>
      </div>

      <StatusPanel status={status} progress={logs.join("\n")} />
    </TabContent>
  );
}

export default DownloadTab;