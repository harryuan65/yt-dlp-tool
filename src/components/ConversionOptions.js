import React from "react";
import styled from "styled-components";

const OptionsContainer = styled.div`
  background-color: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 6px;
  padding: 16px;
`;

const Title = styled.h3`
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: #cccccc;
`;

const Select = styled.select`
  padding: 8px 12px;
  background-color: #3c3c3c;
  border: 1px solid #5a5a5a;
  border-radius: 4px;
  color: #ffffff;
  font-size: 12px;

  &:focus {
    outline: none;
    border-color: #007acc;
  }

  option {
    background-color: #3c3c3c;
    color: #ffffff;
  }
`;

const FormatOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const FormatOption = styled.button`
  padding: 6px 12px;
  background-color: ${(props) => (props.$selected ? "#007acc" : "#3c3c3c")};
  border: 1px solid ${(props) => (props.$selected ? "#007acc" : "#5a5a5a")};
  border-radius: 4px;
  color: #ffffff;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.$selected ? "#0086d1" : "#4c4c4c")};
  }
`;

const conversionTypes = {
  image: {
    label: "圖片轉檔",
    formats: [
      { value: "png", label: "PNG" },
      { value: "jpg", label: "JPG" },
      { value: "webp", label: "WebP" },
    ],
  },
  video: {
    label: "影片轉檔",
    formats: [
      { value: "mp4", label: "MP4" },
      { value: "mov", label: "MOV" },
      { value: "avi", label: "AVI" },
    ],
  },
  audio: {
    label: "音樂轉檔",
    formats: [
      { value: "mp3", label: "MP3" },
      { value: "wav", label: "WAV" },
    ],
  },
};

function ConversionOptions({
  conversionType,
  outputFormat,
  onTypeChange,
  onFormatChange,
}) {
  const currentType = conversionTypes[conversionType];

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    onTypeChange(newType);
    // 自動選擇第一個可用的格式
    const firstFormat = conversionTypes[newType].formats[0].value;
    onFormatChange(firstFormat);
  };

  return (
    <OptionsContainer>
      <Title>轉檔選項</Title>
      <OptionsGrid>
        <OptionGroup>
          <Label>檔案類型</Label>
          <Select value={conversionType} onChange={handleTypeChange}>
            {Object.entries(conversionTypes).map(([key, type]) => (
              <option key={key} value={key}>
                {type.label}
              </option>
            ))}
          </Select>
        </OptionGroup>

        <OptionGroup>
          <Label>輸出格式</Label>
          <FormatOptions>
            {currentType.formats.map((format) => (
              <FormatOption
                key={format.value}
                $selected={outputFormat === format.value}
                onClick={() => onFormatChange(format.value)}
              >
                {format.label}
              </FormatOption>
            ))}
          </FormatOptions>
        </OptionGroup>
      </OptionsGrid>
    </OptionsContainer>
  );
}

export default ConversionOptions;
