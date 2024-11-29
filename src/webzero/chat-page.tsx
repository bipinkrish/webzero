"use client";

import { useState, useEffect } from "react";
import {
  Code,
  Eye,
  // Menu,
  // Paperclip,
  Sun,
  Moon,
  Send,
  Download,
  Copy,
  Maximize2,
  Minimize2,
  FileCode2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendMessage } from "./api";
import { Message, PreviewState } from "../lib/types";
// @ts-expect-error shutup
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { customOneDark, generateUUID } from "@/lib/utils";
import CodePreview from "./preview";

export function ChatPage() {
  const [message, setMessage] = useState("");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });
  // const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>({
    isFullscreen: false,
    isOpen: false,
  });

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: generateUUID().toString(),
      from: "user",
      content: message,
    };

    setChatHistory((prev) => [...prev, newMessage]);
    setMessage("");

    const response = await sendMessage(newMessage.content);
    setChatHistory((prev) => [...prev, response]);
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
  };

  const handleDownloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    setPreviewState((prev) => ({
      ...prev,
      isFullscreen: !prev.isFullscreen,
    }));
  };

  return (
    <div className={`min-h-screen flex ${isDark ? "dark" : ""}`}>
      {/* Sidebar */}
      {/* <div
        className={`w-64 border-r bg-background ${
          isMenuOpen ? "" : "hidden"
        } md:block`}
      >
        <div className="p-4 border-b h-16">
          <div className="font-bold text-xl">webzero</div>
        </div>
        <nav className="p-4">
          <Button variant="ghost" className="w-full justify-start">
            New Chat
          </Button>
        </nav>
      </div> */}

      {/* Main Content */}
      <div className="flex felx-1 flex-col w-full">
        <header className="h-16 border-b flex items-center justify-between px-4">
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button> */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </header>

        <div className="flex flex-1">
          {/* Chat/Input Area */}
          <div className="flex flex-col flex-1">
            <ScrollArea className="flex-1 p-4">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 p-4 rounded-lg ${
                    msg.from === "user"
                      ? "bg-primary/10 ml-auto max-w-[80%]"
                      : "bg-muted max-w-[80%]"
                  } cursor-pointer hover:bg-muted/80 transition-colors`}
                  onClick={() => {
                    setSelectedMessage(msg);
                    setPreviewState((prev) => ({ ...prev, isOpen: true }));
                  }}
                >
                  {msg.from === "user" ? (
                    <div className="mb-2">{msg.content}</div>
                  ) : (
                    <CodeMessageCard
                      message={msg}
                      onClick={() =>
                        setPreviewState((prev) => ({ ...prev, isOpen: true }))
                      }
                    />
                  )}
                </div>
              ))}
            </ScrollArea>

            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask webzero a question..."
                  className="min-h-[100px] pr-24 resize-none"
                />
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Preview/Code Panel */}
          {selectedMessage?.content &&
            selectedMessage.from == "ai" &&
            previewState.isOpen && (
              <div
                className={`border-l ${
                  previewState.isFullscreen
                    ? "fixed inset-0 z-50 bg-background"
                    : "flex2"
                } lg:block`}
              >
                <Tabs defaultValue="preview" className="h-full flex flex-col">
                  <div className="border-b px-4 flex justify-between items-center">
                    <TabsList>
                      <TabsTrigger
                        value="preview"
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </TabsTrigger>

                      <TabsTrigger
                        value="code"
                        className="flex items-center gap-2"
                      >
                        <Code className="h-4 w-4" />
                        Code
                      </TabsTrigger>
                    </TabsList>

                    <div className="p-4 border-b flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyCode(selectedMessage.content)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownloadCode(
                            selectedMessage.content,
                            `code-${selectedMessage.id}.tsx`
                          )
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleFullscreen}
                      >
                        {previewState.isFullscreen ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <TabsContent value="preview" className="flex-1 p-4">
                    <ScrollArea className="h-full">
                      <CodePreview
                        code={selectedMessage.content}
                      />
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="code" className="flex-1">
                    <ScrollArea className="h-[calc(100%-4rem)]">
                      <SyntaxHighlighter
                        language={"typescript"}
                        style={customOneDark}
                        className="!m-0 !bg-transparent"
                      >
                        {selectedMessage.content}
                      </SyntaxHighlighter>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

function CodeMessageCard({
  message,
  onClick,
}: {
  message: Message;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-muted/50 p-3 rounded-lg mb-2 cursor-pointer hover:bg-muted/80 transition-colors flex items-center gap-2"
    >
      <FileCode2 />
      <div className="ml-2 ">
        <div className="font-semibold text-sm">Code File</div>
        {/* <div className="text-xs text-muted-foreground truncate max-w-[300px]">
          {message.content.slice(0, 100)}...
        </div> */}
      </div>
    </div>
  );
}
