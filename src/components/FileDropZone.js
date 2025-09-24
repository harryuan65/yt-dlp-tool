import React, { useState, useRef } from "react";
import styled from "styled-components";

const DropZone = styled.div`
  border: 2px dashed ${(props) => (props.$isDragOver ? "#007acc" : "#5a5a5a")};
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  background-color: ${(props) => (props.$isDragOver ? "#1e3a5f" : "#1e1e1e")};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: #007acc;
    background-color: #1e3a5f;
  }
`;

const DropZoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const DropIcon = styled.div`
  font-size: 48px;
  color: ${(props) => (props.$isDragOver ? "#007acc" : "#666")};
  transition: color 0.2s ease;
`;

const DropText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${(props) => (props.$isDragOver ? "#007acc" : "#cccccc")};
  transition: color 0.2s ease;
`;

const DropSubtext = styled.div`
  font-size: 12px;
  color: #888;
`;

const FileInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;

const SupportedFormats = styled.div`
  margin-top: 8px;
  font-size: 11px;
  color: #666;
`;

function FileDropZone({ onFilesAdded }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    onFilesAdded(files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    onFilesAdded(files);
    // 重置 input 值，允許選擇相同檔案
    e.target.value = "";
  };

  return (
    <DropZone
      $isDragOver={isDragOver}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <FileInput
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        accept="image/*,video/*,audio/*"
      />
      <DropZoneContent>
        <DropIcon $isDragOver={isDragOver}>{isDragOver ? "📁" : "📂"}</DropIcon>
        <DropText $isDragOver={isDragOver}>
          {isDragOver ? "放開檔案" : "拖拽檔案到此處"}
        </DropText>
        <DropSubtext>或點擊選擇檔案</DropSubtext>
        <SupportedFormats>
          支援：圖片 (JPG, PNG, WebP) | 影片 (MP4, MOV, AVI) | 音樂 (MP3, WAV)
        </SupportedFormats>
      </DropZoneContent>
    </DropZone>
  );
}

export default FileDropZone;
