import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "./components/Header";
import TabNavigation from "./components/TabNavigation";
import DownloadTab from "./components/DownloadTab";
import ConvertTab from "./components/ConvertTab";
import InstallerPanel from "./components/InstallerPanel";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
    sans-serif;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

function App() {
  const [activeTab, setActiveTab] = useState("download");
  const [toolsStatus, setToolsStatus] = useState({
    ytdlp: { installed: false, version: "" },
    ffmpeg: { installed: false, version: "" },
  });

  // 檢查工具安裝狀態
  useEffect(() => {
    const checkTools = async () => {
      // 檢查是否在 Electron 環境中
      if (!window.electronAPI) {
        console.log("不在 Electron 環境中，跳過工具檢查");
        return;
      }

      try {
        const ytdlpStatus = await window.electronAPI.checkYtdlp();
        const ffmpegStatus = await window.electronAPI.checkFfmpeg();

        setToolsStatus({
          ytdlp: ytdlpStatus,
          ffmpeg: ffmpegStatus,
        });
      } catch (error) {
        console.error("檢查工具狀態時發生錯誤:", error);
      }
    };

    checkTools();
  }, []);

  const allToolsInstalled =
    toolsStatus.ytdlp.installed && toolsStatus.ffmpeg.installed;

  return (
    <AppContainer>
      <Header />
      <MainContent>
        {!allToolsInstalled ? (
          <InstallerPanel toolsStatus={toolsStatus} />
        ) : (
          <>
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            {activeTab === "download" && (
              <DownloadTab toolsStatus={toolsStatus} />
            )}
            {activeTab === "convert" && (
              <ConvertTab toolsStatus={toolsStatus} />
            )}
          </>
        )}
      </MainContent>
    </AppContainer>
  );
}

export default App;
