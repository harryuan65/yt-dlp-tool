import styled, { keyframes, css } from "styled-components";

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const Button = styled.button<{ $status: 'ready' | 'downloading' | 'disabled' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;

  ${(props) => {
    switch (props.$status) {
      case 'ready':
        return css`
          background: linear-gradient(135deg, #007acc 0%, #005a9e 100%);

          &:hover {
            background: linear-gradient(135deg, #0086d1 0%, #006bb3 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
          }

          &:active {
            transform: translateY(0);
          }
        `;
      case 'downloading':
        return css`
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
          cursor: not-allowed;
          animation: ${pulse} 2s infinite;
        `;
      case 'disabled':
        return css`
          background: #5a5a5a;
          cursor: not-allowed;
          opacity: 0.6;
        `;
      default:
        return css`
          background: #5a5a5a;
          cursor: not-allowed;
          opacity: 0.6;
        `;
    }
  }}
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff40;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

interface DownloadButtonProps {
  onClick: () => void;
  status: 'ready' | 'downloading' | 'disabled';
  disabled?: boolean;
}

function DownloadButton({ onClick, status, disabled }: DownloadButtonProps) {
  const getButtonText = () => {
    switch (status) {
      case 'ready':
      case 'disabled':
        return '開始下載';
      case 'downloading':
        return '下載中...';
      default:
        return '開始下載';
    }
  };

  const isDisabled = status === 'downloading' || status === 'disabled' || disabled;

  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      $status={status}
    >
      {status === 'downloading' && <LoadingSpinner />}
      {getButtonText()}
    </Button>
  );
}

export default DownloadButton;
