import React from "react";
import styled from "styled-components";

const TabContainer = styled.div`
  display: flex;
  background-color: #252526;
  border-radius: 8px 8px 0 0;
  border: 1px solid #3e3e42;
  border-bottom: none;
  overflow: hidden;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 20px;
  background-color: ${(props) => (props.$active ? "#1e1e1e" : "transparent")};
  border: none;
  color: ${(props) => (props.$active ? "#ffffff" : "#cccccc")};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid
    ${(props) => (props.$active ? "#007acc" : "transparent")};

  &:hover {
    background-color: ${(props) => (props.$active ? "#1e1e1e" : "#2d2d30")};
    color: #ffffff;
  }

  &:first-child {
    border-right: 1px solid #3e3e42;
  }
`;

const TabIcon = styled.span`
  margin-right: 8px;
  font-size: 16px;
`;

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <TabContainer>
      <Tab
        $active={activeTab === "download"}
        onClick={() => onTabChange("download")}
      >
        <TabIcon>📥</TabIcon>
        下載影片
      </Tab>
      <Tab
        $active={activeTab === "convert"}
        onClick={() => onTabChange("convert")}
      >
        <TabIcon>🔄</TabIcon>
        轉檔工具
      </Tab>
    </TabContainer>
  );
}

export default TabNavigation;
