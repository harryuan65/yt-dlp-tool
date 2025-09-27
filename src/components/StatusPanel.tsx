import styled from "styled-components";

const Panel = styled.div`
  background-color: #252526;
  border: 1px solid #3e3e42;
  border-radius: 8px;
  padding: 16px;
  min-height: 500px;
  overflow: scroll;
  margin-bottom: 12px;
`;

const Title = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
`;

const StatusContent = styled.div<{ status?: string }>`
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;

  ${(props) => {
    switch (props.status) {
      case "success":
        return "color: #4CAF50;";
      case "error":
        return "color: #f44336;";
      case "downloading":
        return "color: #2196F3;";
      default:
        return "color: #888;";
    }
  }}
`;

interface StatusPanelProps {
  status?: string;
  progress?: string;
}

function StatusPanel({ status, progress }: StatusPanelProps) {
  const getStatusText = () => {
    if (!progress) {
      return "準備就緒，請輸入 URL 並點擊下載";
    }
    return progress;
  };

  return (
    <Panel>
      <Title>狀態</Title>
      <StatusContent status={status}>{getStatusText()}</StatusContent>
    </Panel>
  );
}

export default StatusPanel;
