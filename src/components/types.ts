export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: string;
  files?: FileAttachment[];
  preview?: string;
  code?: {
    content: string;
    language: string;
    version?: string;
  };
  hasPreview?: boolean;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface PreviewState {
  isFullscreen: boolean;
  isOpen: boolean;
}
