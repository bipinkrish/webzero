import { ChatMessage, FileAttachment } from "./types";
import { mockFetchChatHistory, mockSendMessage } from "./dummy-data";

const API_BASE_URL = "https://api.webzero.com";

export const fetchChatHistory = mockFetchChatHistory;
export const sendMessage = mockSendMessage;

// export async function fetchChatHistory(): Promise<ChatMessage[]> {
//   const response = await fetch(`${API_BASE_URL}/chat-history`)
//   if (!response.ok) {
//     throw new Error('Failed to fetch chat history')
//   }
//   return response.json()
// }

// export async function sendMessage(content: string, files?: File[]): Promise<ChatMessage> {
//   const formData = new FormData()
//   formData.append('content', content)

//   if (files?.length) {
//     files.forEach(file => formData.append('files', file))
//   }

//   const response = await fetch(`${API_BASE_URL}/send-message`, {
//     method: 'POST',
//     body: formData,
//   })

//   if (!response.ok) {
//     throw new Error('Failed to send message')
//   }
//   return response.json()
// }

export async function uploadFile(file: File): Promise<FileAttachment> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }
  return response.json();
}
