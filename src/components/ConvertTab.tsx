import { useState, useEffect } from "react";
import styled from "styled-components";
import FileDropZone from "./FileDropZone";
import ConversionOptions from "./ConversionOptions";
import ConvertButton from "./ConvertButton";
import StatusPanel from "./StatusPanel";
import { buildFfmpegCommandArgs } from "../utils/command";

export const TabContent = styled.div`
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

interface ToolsStatus {
  ytdlp: boolean;
  ffmpeg: boolean;
}

interface FileWithPath extends File {
  path: string;
}

const containsVideoFile = (files: FileWithPath[]) => {
  return files.some((file) => file.name.endsWith(".mp4") || file.name.endsWith(".mov") || file.name.endsWith(".avi"));
};

const containsImageFile = (files: FileWithPath[]) => {
  return files.some((file) => file.name.endsWith(".jpg") || file.name.endsWith(".jpeg") || file.name.endsWith(".png") || file.name.endsWith(".gif") || file.name.endsWith(".webp") || file.name.endsWith(".bmp"));
};

const containsAudioFile = (files: FileWithPath[]) => {
  return files.some((file) => file.name.endsWith(".mp3") || file.name.endsWith(".wav"));
};

function ConvertTab({ toolsStatus }: { toolsStatus: ToolsStatus }) {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [conversionType, setConversionType] = useState("image");
  const [outputFormat, setOutputFormat] = useState("png");
  const [outputDir, setOutputDir] = useState("");
  const [status, setStatus] = useState("ready");
  const [progress, setProgress] = useState("準備就緒，請選擇要轉檔的檔案");
  const [logs, setLogs] = useState(["準備就緒，請選擇要轉檔的檔案"]);

  // 設定預設輸出路徑
  useEffect(() => {
    if (!window.electronAPI) {
      return;
    }

    const setDefaultOutputPath = async () => {
      try {
        const defaultPath = await window.electronAPI.getDefaultDownloadPath();
        setOutputDir(defaultPath);
      } catch (error) {
        console.error("無法獲取預設輸出路徑:", error);
      }
    };

    setDefaultOutputPath();
  }, []);

  // 監聽轉檔進度
  useEffect(() => {
    if (!window.electronAPI) {
      return;
    }

    const handleProgress = (event: any, data: any) => {
      setProgress((prev) => prev + data);
      setLogs((prev) => [...prev, data.toString()]);
    };

    window.electronAPI.onConversionProgress(handleProgress);

    return () => {
      window.electronAPI.removeConversionProgressListener(handleProgress);
    };
  }, []);

  const handleFilesAdded = (newFiles: FileWithPath[]) => {
    if(containsAudioFile(newFiles)) {
      setConversionType("audio");
    } else if(containsVideoFile(newFiles)) {
      setConversionType("video");
    } else if(containsImageFile(newFiles)) {
      setConversionType("image");
    }
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenOutputFolder = async () => {
    if (!outputDir) {
      setStatus("error");
      const errorMsg = "請先選擇輸出路徑";
      setLogs((prev) => [...prev, errorMsg]);
      return;
    }

    try {
      await window.electronAPI.openFolder(outputDir);
    } catch (error: any) {
      setStatus("error");
      const errorMsg = `開啟資料夾失敗: ${error.message}`;
      setLogs((prev) => [...prev, errorMsg]);
    }
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

    if (!toolsStatus.ffmpeg) {
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
      await Promise.all(files.map(async (file, index) => {
        const filePath = file.path;
        const commandMsg = buildFfmpegCommandArgs({
          filePath,
          conversionType,
          outputFormat,
          outputDir: outputDir,
        });
        setLogs((prev) => [...prev, `轉檔中... ${index + 1}/${files.length} ${commandMsg.join(" ")}`]);
        const result = await window.electronAPI.convertFile({
          filePath,
          conversionType,
          outputFormat,
          outputDir: outputDir,
        });
        const successMsg = `轉檔完成！檔案已儲存至: ${result.outputDir}`;
        setProgress(successMsg);
        setLogs((prev) => [...prev, successMsg]);
      }))
      const successMsg = `${files.length} 個檔案轉檔完成！`;
      setLogs((prev) => [...prev, successMsg]);
      setStatus("success");
    } catch (error: any) {
      setStatus("error");
      const errorMsg = `轉檔失敗: ${error.message}`;
      setProgress(errorMsg);
      setLogs((prev) => [...prev, errorMsg]);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext || "")) {
      return "🖼️";
    } else if (["mp4", "avi", "mov", "mkv", "wmv", "flv"].includes(ext || "")) {
      return "🎬";
    } else if (["mp3", "wav", "flac", "aac", "ogg"].includes(ext || "")) {
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

      <div>
        <SectionTitle>輸出路徑</SectionTitle>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#1e1e1e',
            border: '1px solid #3e3e42',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#cccccc',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {outputDir || '請選擇輸出路徑'}
          </span>
          <button
            onClick={async () => {
              if (!window.electronAPI) return;
              try {
                const result = await window.electronAPI.selectDownloadPath();
                if (!result.canceled) {
                  setOutputDir(result.path);
                }
              } catch (error) {
                console.error('選擇輸出路徑失敗:', error);
              }
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            選擇路徑
          </button>
          {outputDir && (
            <button
              onClick={handleOpenOutputFolder}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              開啟資料夾
            </button>
          )}
        </div>
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

      <StatusPanel status={status} progress={logs.join("\n")} />
    </TabContent>
  );
}

export default ConvertTab;
