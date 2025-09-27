import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import DownloadTab from './components/DownloadTab';
import ConvertTab from './components/ConvertTab';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1e1e1e;
  color: #ffffff;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

interface ToolsStatus {
  ytdlp: boolean;
  ffmpeg: boolean;
}

function App() {
  const [activeTab, setActiveTab] = useState('download');
  const [toolsStatus, setToolsStatus] = useState<ToolsStatus>({
    ytdlp: false,
    ffmpeg: false,
  });

  useEffect(() => {
    if (!window.electronAPI) {
      return;
    }

    const checkTools = async () => {
      try {
        const ytdlpInstalled = await window.electronAPI.checkYtdlp();
        const ffmpegInstalled = await window.electronAPI.checkFfmpeg();
        setToolsStatus({
          ytdlp: ytdlpInstalled.installed,
          ffmpeg: ffmpegInstalled.installed,
        });
      } catch (error) {
        console.error('檢查工具狀態失敗:', error);
      }
    };

    checkTools();
  }, []);

  return (
    <AppContainer>
      <Header />
      <MainContent>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'download' && <DownloadTab toolsStatus={toolsStatus} />}
        {activeTab === 'convert' && <ConvertTab toolsStatus={toolsStatus} />}
      </MainContent>
    </AppContainer>
  );
}

export default App;