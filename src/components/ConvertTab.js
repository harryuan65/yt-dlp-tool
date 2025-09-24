import React, { useState, useEffect } from "react";
import styled from "styled-components";
import FileDropZone from "./FileDropZone";
import ConversionOptions from "./ConversionOptions";
import ConvertButton from "./ConvertButton";
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

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
`;

const FileList = styled.div`
  background-color: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 6px;
  padding: 16px;
  min-height: 100px;
  max-height: 200px;
  overflow-y: auto;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #2d2d30;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #cccccc;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const FileIcon = styled.span`
  font-size: 16px;
`;

const FileName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  padding: 4px;
  font-size: 14px;

  &:hover {
    background-color: #3e3e42;
    border-radius: 2px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 20px;
`;

function ConvertTab({ toolsStatus }) {
  const [files, setFiles] = useState([]);
  const [conversionType, setConversionType] = useState("image");
  const [outputFormat, setOutputFormat] = useState("png");
  const [status, setStatus] = useState("ready");
  const [progress, setProgress] = useState("準備就緒，請選擇要轉檔的檔案");
  const [logs, setLogs] = useState(["準備就緒，請選擇要轉檔的檔案"]);

  // 監聽轉檔進度
  useEffect(() => {
    if (!window.electronAPI) {
      return;
    }

    const handleProgress = (event, data) => {
      setProgress((prev) => prev + data);
      setLogs((prev) => [...prev, data.toString()]);
    };

    window.electronAPI.onConversionProgress(handleProgress);

    return () => {
      window.electronAPI.removeConversionProgressListener(handleProgress);
    };
  }, []);

  const handleFilesAdded = (newFiles) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileRemove = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      setStatus("error");
      const errorMsg = "請先選擇要轉檔的檔案";
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

    if (!toolsStatus.ffmpeg.installed) {
      setStatus("error");
      const errorMsg = "請先安裝 ffmpeg";
      setProgress(errorMsg);
      setLogs((prev) => [...prev, errorMsg]);
      return;
    }

    setStatus("converting");
    const startMsg = "開始轉檔...";
    setProgress(startMsg);
    setLogs((prev) => [...prev, startMsg]);

    try {
      // 顯示即將執行的命令
      const commandMsg = `執行命令: ffmpeg -i [輸入檔案] ${
        conversionType === "image"
          ? "-q:v 2"
          : conversionType === "video"
          ? "-c:v libx264 -c:a aac"
          : "-c:a libmp3lame"
      } [輸出檔案.${outputFormat}]`;
      setLogs((prev) => [...prev, commandMsg]);

      const result = await window.electronAPI.convertFiles({
        files,
        conversionType,
        outputFormat,
      });
      setStatus("success");
      const successMsg = `轉檔完成！檔案已儲存至: ${result.outputPath}`;
      setProgress(successMsg);
      setLogs((prev) => [...prev, successMsg]);
    } catch (error) {
      setStatus("error");
      const errorMsg = `轉檔失敗: ${error.message}`;
      setProgress(errorMsg);
      setLogs((prev) => [...prev, errorMsg]);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) {
      return "🖼️";
    } else if (["mp4", "avi", "mov", "mkv", "wmv", "flv"].includes(ext)) {
      return "🎬";
    } else if (["mp3", "wav", "flac", "aac", "ogg"].includes(ext)) {
      return "🎵";
    }
    return "📄";
  };

  return (
    <TabContent>
      <div>
        <SectionTitle>選擇檔案</SectionTitle>
        <FileDropZone onFilesAdded={handleFilesAdded} />

        {files.length > 0 && (
          <FileList>
            {files.map((file, index) => (
              <FileItem key={index}>
                <FileInfo>
                  <FileIcon>{getFileIcon(file.name)}</FileIcon>
                  <FileName>{file.name}</FileName>
                </FileInfo>
                <RemoveButton onClick={() => handleFileRemove(index)}>
                  ✕
                </RemoveButton>
              </FileItem>
            ))}
          </FileList>
        )}

        {files.length === 0 && (
          <FileList>
            <EmptyState>拖拽檔案到此處或點擊選擇檔案</EmptyState>
          </FileList>
        )}
      </div>

      <ConversionOptions
        conversionType={conversionType}
        outputFormat={outputFormat}
        onTypeChange={setConversionType}
        onFormatChange={setOutputFormat}
      />

      <ConvertButton
        onClick={handleConvert}
        disabled={status === "converting" || files.length === 0}
      />

      <StatusPanel status={status} progress={logs.join("")} />
    </TabContent>
  );
}

export default ConvertTab;
