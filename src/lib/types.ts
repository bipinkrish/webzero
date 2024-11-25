export type Message = {
  id: string;
  from: 'user' | 'ai';
  content: string;
};

export interface PreviewState {
  isFullscreen: boolean;
  isOpen: boolean;
}
