"use client";

import { useState, useEffect, useRef } from "react";
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
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, PreviewState } from "@/lib/types";
// @ts-expect-error
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { customOneDark, customOneLight, generateUUID } from "@/lib/utils";
import DynamicFileRenderer from "@/webzero/preview";
import ThemeToggle from "@/components/ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSessionContext } from "@/context/SessionContext";

function CodeMessageCard({
  version,
  onClick,
}: {
  version: number;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-muted/50 rounded-lg mb-2 cursor-pointer flex items-center gap-1"
    >
      <div className="mr-2 text-sm">Code v{version}</div>
      <FileCode2 />
    </div>
  );
}

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
  const [currentIteration, setCurrentIteration] = useState<{
    previousDescription: string;
    currentCode: string;
  } | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>({
    isFullscreen: false,
    isOpen: false,
  });
  const [selectedAIMessage, setSelectedAIMessage] = useState<Message | null>(
    null
  );

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { sessions, currentSessionId, updateSessionMessages } =
    useSessionContext();

  const currentSession = sessions.find(
    (session) => session.id === currentSessionId
  );

  useEffect(() => {
    setSelectedAIMessage(null);
    setPreviewState((prev) => ({
      ...prev,
      isOpen: false,
      isFullscreen: false,
    }));

    if (currentSession && currentSession.messages.length > 0) {
      const lastAIMessage = currentSession.messages
        .slice()
        .reverse()
        .find((msg) => msg.from === "ai");

      if (lastAIMessage) {
        const precedingUserMessage =
          currentSession.messages[
            currentSession.messages.indexOf(lastAIMessage) - 1
          ];

        if (precedingUserMessage && precedingUserMessage.from === "user") {
          setCurrentIteration({
            previousDescription: precedingUserMessage.content,
            currentCode: lastAIMessage.content,
          });
        } else {
          setCurrentIteration(null);
        }
      } else {
        setCurrentIteration(null);
      }
    } else {
      setCurrentIteration(null);
    }
  }, [currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentSessionId) return;

    setIsLoading(true);
    const newUserMessage: Message = {
      id: generateUUID().toString(),
      from: "user",
      content: message,
    };

    const updatedMessages = [
      ...(currentSession?.messages || []),
      newUserMessage,
    ];
    updateSessionMessages(currentSessionId, updatedMessages);
    setMessage("");

    try {
      let response;
      if (currentIteration) {
        response = await sendIteration(
          currentIteration.previousDescription,
          message,
          currentIteration.currentCode
        );
      } else {
        response = await sendMessage(message);
      }

      updateSessionMessages(currentSessionId, [...updatedMessages, response]);
      setCurrentIteration({
        previousDescription: message,
        currentCode: response.content,
      });
      setSelectedAIMessage(response);
      setPreviewState((prev) => ({ ...prev, isOpen: true }));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleFullscreen = () => {
    setPreviewState((prev) => ({
      ...prev,
      isFullscreen: !prev.isFullscreen,
    }));
  };

  return (
    <div className={`flex flex-col h-full ${isDark ? "dark" : ""}`}>
      <header className="h-16 border-b flex items-center justify-between px-4 bg-background z-10">
        <div className="flex items-center">
          <SidebarTrigger />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              window.open("https://github.com/webzero-org", "_blank")
            }
          >
            <Github />
          </Button>
        </div>
        <h1 className="text-2xl font-bold ml-4">WebZero</h1>
      </header>
      <div className="flex-1 flex overflow-hidden">
        {!currentSession || currentSession.messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 gap-2">
            <h2 className="text-4xl font-bold text-center">
              Welcome to WebZero
            </h2>
            <div className="w-full max-w-md">
              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask webzero a question..."
                  className="min-h-[100px] pr-16 resize-none prompt-box"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute send-button right-3"
                  disabled={isLoading || message.trim() === ""}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel
              defaultSize={50}
              minSize={30}
              className={`flex flex-col h-full scrollable`}
            >
              <div className="flex flex-col h-full">
                <ScrollArea className="flex-1 px-4 mt-4 chat-scroll">
                  {currentSession.messages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={`mb-4 flex ${
                        msg.from === "user" ? "you-message" : ""
                      }`}
                    >
                      <div className="flex items-start max-w-[80%] gap-1">
                        {msg.from === "ai" && (
                          <Avatar>
                            <AvatarImage
                              className={isDark ? "invert" : ""}
                              src="https://raw.githubusercontent.com/webzero-org/website/refs/heads/main/src/app/favicon.svg"
                            />
                            <AvatarFallback>"AI"</AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`p-3 rounded-lg bg-muted ${
                            selectedAIMessage?.id == msg.id
                              ? "selected-card"
                              : ""
                          }`}
                        >
                          {msg.from === "user" ? (
                            <p>{msg.content}</p>
                          ) : (
                            <CodeMessageCard
                              version={(1 + index) / 2}
                              onClick={() => {
                                setSelectedAIMessage(msg);
                                setPreviewState((prev) => ({
                                  ...prev,
                                  isOpen: true,
                                }));
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </ScrollArea>
                <div className="border-t p-4">
                  <form onSubmit={handleSubmit} className="relative">
                    {isLoading ? (
                      <div className="loader" />
                    ) : (
                      <>
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={
                            currentIteration
                              ? "Describe your iteration..."
                              : "Ask webzero a question..."
                          }
                          className="min-h-[100px] pr-16 resize-none prompt-box"
                        />
                        <Button
                          type="submit"
                          size="icon"
                          className="absolute send-button right-3"
                          disabled={isLoading || message.trim() === ""}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </form>
                </div>
              </div>
            </ResizablePanel>
            {previewState.isOpen && (
              <>
                <ResizableHandle />
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div
                    className={`h-full ${
                      previewState.isFullscreen ? "fullscreen-preview" : ""
                    }`}
                  >
                    <Tabs
                      defaultValue="preview"
                      className="h-full flex flex-col"
                    >
                      <div className="border-b px-4 flex justify-between items-center">
                        <TabsList>
                          <TabsTrigger
                            value="preview"
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" /> Preview
                          </TabsTrigger>
                          <TabsTrigger
                            value="code"
                            className="flex items-center gap-1"
                          >
                            <Code className="h-4 w-4" /> Code
                          </TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-1 p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleCopyCode(selectedAIMessage?.content || "")
                            }
                          >
                            <Copy className="h-4 w-4 mr-2" /> Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDownloadCode(
                                selectedAIMessage?.content || "",
                                `code-${selectedAIMessage?.id || "unknown"}.tsx`
                              )
                            }
                          >
                            <Download className="h-4 w-4 mr-2" /> Download
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
                          {previewState.isFullscreen && <ThemeToggle />}
                          {!previewState.isFullscreen && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setPreviewState((prev) => ({
                                  ...prev,
                                  isOpen: false,
                                }));
                                setSelectedAIMessage(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <TabsContent
                        value="preview"
                        className="flex-1 overflow-auto"
                      >
                        <ScrollArea className="h-full scrollable">
                          <div className="p-4">
                            <DynamicFileRenderer
                              id={selectedAIMessage?.id || ""}
                            />
                          </div>
                        </ScrollArea>
                      </TabsContent>
                      <TabsContent
                        value="code"
                        className="flex-1 overflow-auto"
                      >
                        <ScrollArea className="h-full scrollable">
                          <div className="p-4">
                            <SyntaxHighlighter
                              language="typescript"
                              style={isDark ? customOneDark : customOneLight}
                              className="!m-0 !bg-transparent"
                            >
                              {selectedAIMessage?.content || ""}
                            </SyntaxHighlighter>
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
