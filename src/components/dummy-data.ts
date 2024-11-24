import { ChatMessage } from './types'

export const dummyChatHistory: ChatMessage[] = [
  {
    id: '1',
    content: 'Create a button component',
    sender: 'user',
    timestamp: '2024-11-16T13:00:00Z',
  },
  {
    id: '2',
    content: 'Here\'s a button component with hover effects:',
    sender: 'assistant',
    timestamp: '2024-11-16T13:01:00Z',
    hasPreview: true,
    preview: `
      <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
        Click me
      </button>
    `,
    code: {
      content: `
import React from 'react'
import { Button } from '@/components/ui/button'

export default function CustomButton() {
  return (
    <Button className="hover:bg-blue-600 transition-colors">
      Click me
    </Button>
  )
}`,
      language: 'typescript',
      version: 'v1'
    }
  },
  {
    id: '3',
    content: 'Here\'s my design file',
    sender: 'user',
    timestamp: '2024-11-16T13:02:00Z',
    files: [
      {
        id: 'file1',
        name: 'design.fig',
        type: 'application/figma',
        url: '/files/design.fig',
        size: 1024000
      }
    ]
  }
]

export function mockFetchChatHistory(): Promise<ChatMessage[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(dummyChatHistory), 500)
  })
}

export function mockSendMessage(content: string, files?: File[]): Promise<ChatMessage> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now().toString(),
        content: `Response to: "${content}"${files ? ` with ${files.length} files` : ''}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        hasPreview: true,
        preview: '<div>Preview content</div>',
        code: {
          content: '// Code content',
          language: 'typescript',
          version: 'v1'
        }
      })
    }, 1000)
  })
}