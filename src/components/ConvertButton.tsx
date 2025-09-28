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

const Button = styled.button<{ disabled?: boolean }>`
  padding: 12px 24px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2dbb5d 0%, #26d4a3 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #5a5a5a;
    cursor: not-allowed;
    opacity: 0.6;
  }

  ${(props) =>
    props.disabled &&
    css`
      animation: ${pulse} 2s infinite;
    `}
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

interface ConvertButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

function ConvertButton({ onClick, disabled }: ConvertButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled}>
      {disabled ? (
        <>
          <LoadingSpinner />
          轉檔中...
        </>
      ) : (
        <>🔄 開始轉檔</>
      )}
    </Button>
  );
}

export default ConvertButton;
