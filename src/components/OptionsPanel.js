import React from "react";
import styled from "styled-components";

const Panel = styled.div`
  background-color: #252526;
  border: 1px solid #3e3e42;
  border-radius: 8px;
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

function OptionsPanel({ options, onChange }) {
  const handleFormatChange = (e) => {
    onChange({ ...options, format: e.target.value });
  };

  const handleQualityChange = (e) => {
    onChange({ ...options, quality: e.target.value });
  };

  return (
    <Panel>
      <Title>下載選項</Title>
      <OptionsGrid>
        <OptionGroup>
          <Label>格式</Label>
          <Select value={options.format} onChange={handleFormatChange}>
            <option value="best">最佳品質</option>
            <option value="worst">最低品質</option>
            <option value="mp4">MP4</option>
            <option value="webm">WebM</option>
            <option value="mkv">MKV</option>
          </Select>
        </OptionGroup>

        <OptionGroup>
          <Label>畫質</Label>
          <Select value={options.quality} onChange={handleQualityChange}>
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
            <option value="480p">480p</option>
            <option value="360p">360p</option>
            <option value="240p">240p</option>
          </Select>
        </OptionGroup>
      </OptionsGrid>
    </Panel>
  );
}

export default OptionsPanel;
