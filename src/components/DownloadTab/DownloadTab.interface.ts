export interface DownloadOptions {
  enableVideo: boolean;
  enableAudio: boolean;
  videoFormat: string;
  audioFormat: string;
  audioOutputFormat: string;
}

export interface FormatOption {
  id: string;
  ext: string;
  resolution: string;
  quality: string;
  filesize: string;
  type: string;
  label: string;
}