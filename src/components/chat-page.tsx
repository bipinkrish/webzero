'use client'

import { useState, useEffect, useRef } from 'react'
import { Code, Eye, Menu, Paperclip, Sun, Moon, Send, Download, Copy, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { fetchChatHistory, sendMessage } from './api'
import { ChatMessage, PreviewState } from './types'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export function ChatPage() {
  const [message, setMessage] = useState('')
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark'
    }
    return false
  })
  const [isMenuOpen, setIsMenuOpen] = useState(true)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null)
  const [previewState, setPreviewState] = useState<PreviewState>({
    isFullscreen: false,
    isOpen: false
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchChatHistory().then(setChatHistory)
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const files = fileInputRef.current?.files
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString(),
      files: files ? Array.from(files).map(file => ({
        id: file.name,
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        size: file.size
      })) : undefined
    }

    setChatHistory(prev => [...prev, newMessage])
    setMessage('')
    if (fileInputRef.current) fileInputRef.current.value = ''

    const response = await sendMessage(message, files ? Array.from(files) : undefined)
    setChatHistory(prev => [...prev, response])
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    const files = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) files.push(file)
      }
    }
    if (files.length && fileInputRef.current) {
      const dataTransfer = new DataTransfer()
      files.forEach(file => dataTransfer.items.add(file))
      fileInputRef.current.files = dataTransfer.files
    }
  }

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
  }

  const handleDownloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleFullscreen = () => {
    setPreviewState(prev => ({
      ...prev,
      isFullscreen: !prev.isFullscreen
    }))
  }

  return (
    <div className={`min-h-screen flex ${isDark ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className={`w-64 border-r bg-background ${isMenuOpen ? '' : 'hidden'} md:block`}>
        <div className="p-4 border-b">
          <div className="font-bold text-xl">webzero</div>
        </div>
        <nav className="p-4">
          <Button variant="ghost" className="w-full justify-start">
            New Chat
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center justify-between px-4">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        <div className="flex-1 flex">
          {/* Chat/Input Area */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 p-4 rounded-lg ${
                    msg.sender === 'user' ? 'bg-primary/10 ml-auto max-w-[80%]' : 'bg-muted max-w-[80%]'
                  } cursor-pointer hover:bg-muted/80 transition-colors`}
                  onClick={() => {
                    setSelectedMessage(msg)
                    setPreviewState(prev => ({ ...prev, isOpen: true }))
                  }}
                >
                  <div className="mb-2">{msg.content}</div>
                  {msg.files?.map(file => (
                    <div key={file.id} className="text-sm text-muted-foreground">
                      📎 {file.name} ({Math.round(file.size / 1024)}KB)
                    </div>
                  ))}
                </div>
              ))}
            </ScrollArea>
            
            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Ask webzero a question..."
                  className="min-h-[100px] pr-24 resize-none"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <Button variant="ghost" size="icon" type="button" onClick={handleFileUpload}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Preview/Code Panel */}
          {(selectedMessage?.preview || selectedMessage?.code) && previewState.isOpen && (
            <div className={`border-l ${previewState.isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'w-1/2'} hidden lg:block`}>
              <Tabs defaultValue="preview" className="h-full flex flex-col">
                <div className="border-b px-4 flex justify-between items-center">
                  <TabsList>
                    {selectedMessage.preview && (
                      <TabsTrigger value="preview" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Preview
                      </TabsTrigger>
                    )}
                    {selectedMessage.code && (
                      <TabsTrigger value="code" className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Code
                      </TabsTrigger>
                    )}
                  </TabsList>
                  <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                    {previewState.isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {selectedMessage.preview && (
                  <TabsContent value="preview" className="flex-1 p-4">
                    <ScrollArea className="h-full">
                      <div dangerouslySetInnerHTML={{ __html: selectedMessage.preview }} />
                    </ScrollArea>
                  </TabsContent>
                )}
                {selectedMessage.code && (
                  <TabsContent value="code" className="flex-1">
                    <div className="p-4 border-b flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyCode(selectedMessage.code!.content)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadCode(
                          selectedMessage.code!.content,
                          `code-${selectedMessage.id}.${selectedMessage.code!.language}`
                        )}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <ScrollArea className="h-[calc(100%-4rem)]">
                      <SyntaxHighlighter
                        language={selectedMessage.code.language}
                        style={oneDark}
                        className="!m-0 !bg-transparent"
                      >
                        {selectedMessage.code.content}
                      </SyntaxHighlighter>
                    </ScrollArea>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}