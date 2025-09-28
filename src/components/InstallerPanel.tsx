import styled from "styled-components";

const Panel = styled.div`
  background-color: #252526;
  border: 1px solid #3e3e42;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
`;

const Title = styled.h2`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
`;

const Description = styled.p`
  margin: 0 0 24px 0;
  color: #cccccc;
  line-height: 1.5;
`;

const ToolsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

const ToolItem = styled.div<{ $installed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #1e1e1e;
  border-radius: 6px;
  border: 1px solid ${(props) => (props.$installed ? "#4CAF50" : "#f44336")};
`;

const ToolInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ToolName = styled.span`
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
`;

const ToolStatus = styled.span<{ $installed?: boolean }>`
  font-size: 12px;
  color: ${(props) => (props.$installed ? "#4CAF50" : "#f44336")};
`;

const InstallButton = styled.button`
  padding: 8px 16px;
  background-color: #007acc;
  border: none;
  border-radius: 4px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0086d1;
  }

  &:disabled {
    background-color: #5a5a5a;
    cursor: not-allowed;
  }
`;

const Instructions = styled.div`
  background-color: #1e1e1e;
  border-radius: 6px;
  padding: 16px;
  text-align: left;
`;

const InstructionsTitle = styled.h4`
  margin: 0 0 12px 0;
  color: #ffffff;
  font-size: 14px;
`;

const InstructionList = styled.ol`
  margin: 0;
  padding-left: 20px;
  color: #cccccc;
  font-size: 12px;
  line-height: 1.6;
`;

const CodeBlock = styled.code`
  background-color: #2d2d30;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 11px;
  color: #d4d4d4;
`;

interface ToolStatus {
  installed: boolean;
  version?: string;
}

interface ToolsStatus {
  ytdlp: ToolStatus;
  ffmpeg: ToolStatus;
}

interface InstallerPanelProps {
  toolsStatus: ToolsStatus;
}

function InstallerPanel({ toolsStatus }: InstallerPanelProps) {
  const openInstallGuide = (tool: string) => {
    let url: string | undefined;
    if (tool === "ytdlp") {
      url = "https://github.com/yt-dlp/yt-dlp#installation";
    } else if (tool === "ffmpeg") {
      url = "https://ffmpeg.org/download.html";
    }
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <Panel>
      <Title>需要安裝必要工具</Title>
      <Description>
        為了使用此應用程式，您需要先安裝 yt-dlp 和 ffmpeg。
        請按照下方指示安裝這些工具。
      </Description>

      <ToolsList>
        <ToolItem $installed={toolsStatus.ytdlp.installed}>
          <ToolInfo>
            <ToolName>yt-dlp</ToolName>
            <ToolStatus $installed={toolsStatus.ytdlp.installed}>
              {toolsStatus.ytdlp.installed
                ? `已安裝 (${toolsStatus.ytdlp.version})`
                : "未安裝"}
            </ToolStatus>
          </ToolInfo>
          <InstallButton
            onClick={() => openInstallGuide("ytdlp")}
            disabled={toolsStatus.ytdlp.installed}
          >
            {toolsStatus.ytdlp.installed ? "已安裝" : "安裝指南"}
          </InstallButton>
        </ToolItem>

        <ToolItem $installed={toolsStatus.ffmpeg.installed}>
          <ToolInfo>
            <ToolName>ffmpeg</ToolName>
            <ToolStatus $installed={toolsStatus.ffmpeg.installed}>
              {toolsStatus.ffmpeg.installed
                ? `已安裝 (${toolsStatus.ffmpeg.version})`
                : "未安裝"}
            </ToolStatus>
          </ToolInfo>
          <InstallButton
            onClick={() => openInstallGuide("ffmpeg")}
            disabled={toolsStatus.ffmpeg.installed}
          >
            {toolsStatus.ffmpeg.installed ? "已安裝" : "安裝指南"}
          </InstallButton>
        </ToolItem>
      </ToolsList>

      <Instructions>
        <InstructionsTitle>快速安裝指令 (macOS)</InstructionsTitle>
        <InstructionList>
          <li>
            安裝 Homebrew（如果尚未安裝）：
            <br />
            <CodeBlock>
              /bin/bash -c "$(curl -fsSL
              https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            </CodeBlock>
          </li>
          <li>
            安裝 yt-dlp：
            <br />
            <CodeBlock>brew install yt-dlp</CodeBlock>
          </li>
          <li>
            安裝 ffmpeg：
            <br />
            <CodeBlock>brew install ffmpeg</CodeBlock>
          </li>
          <li>安裝完成後，重新啟動此應用程式</li>
        </InstructionList>
      </Instructions>
    </Panel>
  );
}

export default InstallerPanel;
