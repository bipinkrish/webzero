"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Code,
  Eye,
  Send,
  Download,
  Copy,
  Maximize2,
  Minimize2,
  FileCode2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, PreviewState } from "@/lib/types";
// @ts-expect-error
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { customOneDark, customOneLight, generateUUID } from "@/lib/utils";
import DynamicFileRenderer from "@/webzero/preview";
import ThemeToggle from "@/components/ThemeToggle";

const sendMessage = async (content: string) => {
  const response = await fetch("/api/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to send message");
  }

  const data = await response.json();
  return data;
};

const sendIteration = async (
  previousDescription: string,
  newUpdate: string,
  currentCode: string
) => {
  const response = await fetch("/api/iterate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ previousDescription, newUpdate, currentCode }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to process iteration");
  }

  const data = await response.json();
  return data;
};

export function ChatPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>({
    isFullscreen: false,
    isOpen: false,
  });
  const [previousDescription, setPreviousDescription] = useState<string>("");

  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const savedChatHistory = localStorage.getItem("chatHistory");
    if (savedChatHistory) {
      setChatHistory(JSON.parse(savedChatHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    const newMessage: Message = {
      id: generateUUID().toString(),
      from: "user",
      content: message,
    };

    setChatHistory((prev) => [...prev, newMessage]);
    setMessage("");

    try {
      let response;
      if (selectedMessage && selectedMessage.from === "ai") {
        response = await sendIteration(
          previousDescription,
          message,
          selectedMessage.content
        );
      } else {
        response = await sendMessage(message);
      }
      setChatHistory((prev) => [...prev, response]);
      setPreviousDescription(message);
      setSelectedMessage(response);
      setPreviewState((prev) => ({ ...prev, isOpen: true }));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
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
      <div className="flex flex-1 flex-col w-full">
        <header className="h-16 border-b flex items-center justify-between px-4">
          <ThemeToggle />
        </header>

        <div className="flex flex-1">
          <div className="flex flex-col flex-1 h-fit">
            <ScrollArea className="flex-1 p-4 h-[calc(100vh-8rem)]">
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
                {isLoading ? (
                  <div
                    className={`loader ${
                      isDark ? "loader-dark" : "loader-light"
                    }`}
                  />
                ) : (
                  <>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        selectedMessage && selectedMessage.from === "ai"
                          ? "Describe your iteration..."
                          : "Ask webzero a question..."
                      }
                      className="min-h-[100px] pr-24 resize-none"
                    />
                    <div className="absolute top-2 right-3 flex items-center gap-2">
                      <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>

          {previewState.isFullscreen && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" />
          )}

          {selectedMessage?.content &&
            selectedMessage.from === "ai" &&
            previewState.isOpen && (
              <div
                className={`border-l ${
                  previewState.isFullscreen
                    ? "fixed inset-0 z-50 bg-background"
                    : "w-1/2"
                }`}
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

                    <div className="flex items-center gap-2">
                      {previewState.isFullscreen && <ThemeToggle />}
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

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setPreviewState((prev) => ({
                            ...prev,
                            isOpen: false,
                          }))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <TabsContent value="preview" className="flex-1 p-4">
                    <ScrollArea className="preview-scroll">
                      <DynamicFileRenderer id={selectedMessage.id} />
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="code" className="flex-1">
                    <ScrollArea className="preview-scroll">
                      <SyntaxHighlighter
                        language="typescript"
                        style={isDark ? customOneDark : customOneLight}
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

function CodeMessageCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-muted/50 p-3 rounded-lg mb-2 cursor-pointer hover:bg-muted/80 transition-colors flex items-center gap-2"
    >
      <FileCode2 />
      <div className="ml-2">
        <div className="font-semibold text-sm">Code File</div>
      </div>
    </div>
  );
}
