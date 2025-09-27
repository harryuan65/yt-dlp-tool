import { styled } from "styled-components";
import type { DownloadOptions, FormatOption } from "./DownloadTab.interface";

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

const FormatToggleSwitch = styled.label<{ $enabled: boolean }>`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  background-color: ${(props: any) => (props.$enabled ? "#007acc" : "#555")};
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
`;

const FormatToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const FormatToggleSlider = styled.span<{ $enabled: boolean }>`
  position: absolute;
  top: 2px;
  left: ${(props: any) => (props.$enabled ? "22px" : "2px")};
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  transition: left 0.2s;
`;

const FormatLabel = styled.label`
  font-size: 14px;
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

export const FormatSelectionPanel = ({
    videoFormats,
    audioFormats,
    options,
    onChange
  }: {
    videoFormats: FormatOption[];
    audioFormats: FormatOption[];
    options: DownloadOptions;
    onChange: (options: DownloadOptions) => void;
  }) => {
    // 使用父組件的狀態，而不是本地狀態
    const enableVideo = options.enableVideo;
    const enableAudio = options.enableAudio;
    const selectedVideoFormat = options.videoFormat;
    const selectedAudioFormat = options.audioFormat;

    const handleVideoToggle = (enabled: boolean) => {
      onChange({
        ...options,
        enableVideo: enabled,
        videoFormat: enabled ? selectedVideoFormat : "",
      });
    };

    const handleAudioToggle = (enabled: boolean) => {
      onChange({
        ...options,
        enableAudio: enabled,
        audioFormat: enabled ? selectedAudioFormat : "",
      });
    };

    const handleVideoFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const formatId = e.target.value;
      onChange({
        ...options,
        enableVideo: enableVideo,
        videoFormat: formatId,
      });
    };

    const handleAudioFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const formatId = e.target.value;
      onChange({
        ...options,
        enableAudio: enableAudio,
        audioFormat: formatId,
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
                  onChange={(e) => {
                    console.log(JSON.stringify({
                      eventChecked: e.target.checked,
                      options
                    }, null, 2))
                    handleVideoToggle(e.target.checked)

                  }}
                />
                <FormatToggleSlider $enabled={enableVideo} />
              </FormatToggleSwitch>
              <FormatLabel onClick={() => handleVideoToggle(!enableVideo)}>影片格式</FormatLabel>
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
              <FormatLabel onClick={() => handleAudioToggle(!enableAudio)}>音檔格式</FormatLabel>
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
