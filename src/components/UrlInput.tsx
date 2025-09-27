import React from "react";
import styled from "styled-components";

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #cccccc;
`;

const Input = styled.input`
  padding: 12px 16px;
  background-color: #3c3c3c;
  border: 1px solid #5a5a5a;
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007acc;
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
  }

  &::placeholder {
    color: #888;
  }
`;

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

function UrlInput({ value, onChange, placeholder, required }: UrlInputProps) {
  return (
    <InputContainer>
      <Label>影片 URL</Label>
      <Input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </InputContainer>
  );
}

export default UrlInput;
