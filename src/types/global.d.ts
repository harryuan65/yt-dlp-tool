interface ElectronAPI {
  checkYtdlp: () => Promise<{ installed: boolean; version?: string; error?: string }>;
  checkFfmpeg: () => Promise<{ installed: boolean; version?: string; error?: string }>;
  installYtdlp: () => Promise<{ success: boolean; message: string }>;
  installFfmpeg: () => Promise<{ success: boolean; message: string }>;
  getDefaultDownloadPath: () => Promise<string>;
  selectDownloadPath: () => Promise<{ canceled: boolean; path: string }>;
  downloadVideo: (url: string, options: any, downloadPath: string) => Promise<{ success: boolean; downloadPath: string }>;
  convertFiles: (params: { files: File[]; conversionType: string; outputFormat: string }) => Promise<{ success: boolean; outputPath: string }>;
  detectStreamFormats: (url: string) => Promise<{ success: boolean; formats: string; error?: string }>;
  onDownloadProgress: (callback: (event: any, data: any) => void) => void;
  removeDownloadProgressListener: (callback: (event: any, data: any) => void) => void;
  onConversionProgress: (callback: (event: any, data: any) => void) => void;
  removeConversionProgressListener: (callback: (event: any, data: any) => void) => void;
  openFolder: (path: string) => Promise<void>;
  closeWindow: () => Promise<void>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
