"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FileUploader } from "@/components/file-uploader";
import { Progress } from "@/components/ui/progress";
import { 
  SendIcon, Bot, User, Loader2, FileIcon, 
  FileUp, ArrowDown, Check, DownloadIcon, 
  RefreshCw, Zap, FileTextIcon, ImageIcon,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MessageContent = string | {
  type: "file-upload" | "conversion-result" | "format-selection" | "conversion-progress" | "error";
  data: any;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: MessageContent;
  timestamp: Date;
};

type ConversionHistory = {
  id: string;
  originalFile: string;
  originalFormat: string;
  convertedFormat: string;
  timestamp: Date;
  status: 'completed' | 'in-progress' | 'failed';
  downloadUrl?: string;
};

type ChatState = {
  isProcessing: boolean;
  isConverting: boolean;
  currentFile: File | null;
  conversionProgress: number;
  error: string | null;
};

export default function ChatComponent() {
  // State management
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm NeoConvert AI, your file conversion assistant. You can upload files directly in chat and I'll help you convert them. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [chatState, setChatState] = useState<ChatState>({
    isProcessing: false,
    isConverting: false,
    currentFile: null,
    conversionProgress: 0,
    error: null,
  });
  const [conversions, setConversions] = useState<ConversionHistory[]>([]);
  const [availableFormats, setAvailableFormats] = useState<string[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Helper functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (role: "user" | "assistant", content: MessageContent) => {
    setMessages(prev => [...prev, {
      id: `${role}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
    }]);
  };

  const updateChatState = (updates: Partial<ChatState>) => {
    setChatState(prev => ({ ...prev, ...updates }));
  };

  const handleError = (error: string) => {
    updateChatState({ error });
    addMessage("assistant", {
      type: "error",
      data: { message: error }
    });
  };

  // File handling
  const handleFileUpload = async (file: File) => {
    try {
      updateChatState({ 
        isProcessing: true,
        currentFile: file,
        error: null 
      });

      // Add file upload message
      addMessage("user", {
        type: "file-upload",
        data: {
          name: file.name,
          size: file.size,
          type: file.type,
          extension: file.name.split('.').pop()?.toLowerCase() || "",
        }
      });

      // Determine available formats
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || "";
      const formats = determineConversionOptions(fileExtension);
      setAvailableFormats(formats);

      // Add format selection message
      addMessage("assistant", {
        type: "format-selection",
        data: {
          formats,
          originalFormat: fileExtension,
          fileName: file.name,
          fileSize: file.size,
        }
      });

    } catch (error) {
      console.error("File upload error:", error);
      handleError("Sorry, I encountered an error processing your file. Please try again with a different file.");
    } finally {
      updateChatState({ isProcessing: false });
    }
  };

  const determineConversionOptions = (format: string): string[] => {
    const fileFormats = {
      document: ["pdf", "docx", "html", "txt", "rtf", "md"],
      image: ["jpg", "png", "gif", "bmp", "tiff", "webp"],
      data: ["csv", "xlsx", "json", "xml"],
    };
    
    let group: string | null = null;
    Object.entries(fileFormats).forEach(([groupName, formats]) => {
      if (formats.includes(format)) {
        group = groupName;
      }
    });
    
    if (!group) return ["pdf"];
    
    return (fileFormats[group as keyof typeof fileFormats] || []).filter(
      (fmt) => fmt !== format
    );
  };

  // Conversion handling
  const handleFormatSelection = async (format: string) => {
    if (!chatState.currentFile) {
      handleError("No file found to convert. Please upload a file first.");
      return;
    }

    try {
      updateChatState({ 
        isConverting: true,
        conversionProgress: 0,
        error: null 
      });

      addMessage("user", `Convert to ${format.toUpperCase()} format`);
      
      await startConversion(chatState.currentFile, format);
    } catch (error) {
      console.error("Format selection error:", error);
      handleError("Failed to start conversion. Please try again.");
    }
  };

  const startConversion = async (file: File, targetFormat: string) => {
    const conversionId = `conversion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add conversion history entry
    const newConversion: ConversionHistory = {
      id: conversionId,
      originalFile: file.name,
      originalFormat: file.name.split('.').pop()?.toLowerCase() || "",
      convertedFormat: targetFormat,
      timestamp: new Date(),
      status: 'in-progress',
    };
    setConversions(prev => [...prev, newConversion]);

    // Add progress message
    addMessage("assistant", {
      type: "conversion-progress",
      data: {
        progress: 0,
        fileName: file.name,
        targetFormat
      }
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/convert?format=${targetFormat}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json().catch(() => ({ error: response.statusText }));

      if (!response.ok) {
        throw new Error(data.error || `Conversion failed: ${response.statusText}`);
      }

      if (!data.fileData) {
        throw new Error("No file data received from conversion");
      }

      // Update conversion history
      setConversions(prev => 
        prev.map(conv => 
          conv.id === conversionId
            ? { ...conv, status: 'completed', downloadUrl: data.fileData }
            : conv
        )
      );

      // Add success message
      addMessage("assistant", {
        type: "conversion-result",
        data: {
          fileName: data.fileName,
          targetFormat,
          fileData: data.fileData,
          contentType: data.contentType
        }
      });

      // Reset state
      updateChatState({ 
        isConverting: false,
        conversionProgress: 100,
        currentFile: null 
      });

    } catch (error) {
      console.error("Conversion error:", error);
      
      // Update conversion history
      setConversions(prev => 
        prev.map(conv => 
          conv.id === conversionId
            ? { ...conv, status: 'failed' }
            : conv
        )
      );

      handleError(error instanceof Error ? error.message : "Sorry, the conversion failed. Please try again or contact support if the issue persists.");
    }
  };

  // Chat message handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!input.trim() && !chatState.currentFile) || chatState.isProcessing) return;
    
    const userMessage = input.trim();
    if (userMessage) {
      addMessage("user", userMessage);
      setInput("");
    }

    updateChatState({ isProcessing: true });

    try {
      if (chatState.currentFile) {
        await handleFileUpload(chatState.currentFile);
      } else {
        await processChatMessage(userMessage);
      }
    } catch (error) {
      console.error("Message processing error:", error);
      handleError("Sorry, I encountered an error processing your request. Please try again.");
    } finally {
      updateChatState({ isProcessing: false });
    }
  };

  const processChatMessage = async (message: string) => {
    try {
      const apiMessages = [
        { 
          role: "system", 
          content: `You are NeoConvert AI, an advanced file conversion assistant.
          
Conversion History:
${conversions.map(conv => `- ${conv.originalFile} (${conv.originalFormat.toUpperCase()} → ${conv.convertedFormat.toUpperCase()})`).join('\n')}

Available Formats:
- Documents: PDF, DOCX, HTML, TXT, RTF, MD
- Images: JPG, PNG, GIF, BMP, TIFF, WEBP
- Data: CSV, XLSX, JSON, XML

Provide clear, concise responses focused on file conversion assistance.` 
        },
        ...messages
          .filter(m => typeof m.content === 'string')
          .map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: message }
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message.content || "Sorry, I couldn't process your request.";
      addMessage("assistant", assistantMessage);

    } catch (error) {
      console.error("Chat error:", error);
      throw error;
    }
  };

  // Render functions
  const renderMessageContent = (message: Message) => {
    if (typeof message.content === 'string') {
      return <div className="whitespace-pre-wrap">{message.content}</div>;
    }
    
    const content = message.content as { type: string; data: any };
    
    switch (content.type) {
      case 'file-upload':
        return (
          <div className="flex items-center gap-2">
            <FileIcon className="h-4 w-4" />
            <span>Uploaded: <b>{content.data.name}</b> ({(content.data.size / 1024).toFixed(1)} KB)</span>
          </div>
        );
        
      case 'format-selection':
        return (
          <div className="space-y-3">
            <p>I can convert <b>{content.data.fileName}</b> ({(content.data.fileSize / 1024).toFixed(1)} KB) to several formats. Please select a target format:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {content.data.formats.map((format: string) => (
                <Button
                  key={format}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => handleFormatSelection(format)}
                  disabled={chatState.isConverting}
                >
                  {getFormatIcon(format)}
                  <span>{format.toUpperCase()}</span>
                </Button>
              ))}
            </div>
          </div>
        );
        
      case 'conversion-progress':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>
                Converting <b>{content.data.fileName}</b> to {content.data.targetFormat.toUpperCase()}
              </span>
            </div>
            <Progress value={chatState.conversionProgress} className="h-2" />
            <div className="text-xs text-right">{Math.round(chatState.conversionProgress)}%</div>
          </div>
        );
        
      case 'conversion-result':
        return (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800 flex items-start gap-3">
              <div className="rounded-full bg-green-100 dark:bg-green-800 p-1.5">
                <Check className="h-4 w-4 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="font-medium text-green-800 dark:text-green-300">Conversion Successful!</p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  {content.data.fileName} → {content.data.targetFormat.toUpperCase()}
                </p>
              </div>
            </div>
            <Button 
              variant="default" 
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500" 
              onClick={() => {
                try {
                  // Convert base64 to blob
                  const byteCharacters = atob(content.data.fileData);
                  const byteNumbers = new Array(byteCharacters.length);
                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                  }
                  const byteArray = new Uint8Array(byteNumbers);
                  const blob = new Blob([byteArray], { type: content.data.contentType });
                  
                  // Create download link
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = content.data.fileName;
                  document.body.appendChild(a);
                  a.click();
                  
                  // Cleanup
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                } catch (error) {
                  console.error("Download error:", error);
                  handleError("Failed to download the converted file. Please try again.");
                }
              }}
            >
              <DownloadIcon className="h-4 w-4" />
              Download {content.data.targetFormat.toUpperCase()} File
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span>{content.data.message}</span>
          </div>
        );
        
      default:
        return <div>Unsupported message type</div>;
    }
  };

  const getFormatIcon = (format: string) => {
    if (["jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp"].includes(format.toLowerCase())) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (["pdf", "docx", "doc", "html", "txt", "rtf", "md"].includes(format.toLowerCase())) {
      return <FileTextIcon className="h-4 w-4" />;
    }
    return <FileIcon className="h-4 w-4" />;
  };

  return (
    <div className="flex flex-col h-[600px] rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Conversion History */}
      {conversions.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 p-2 text-xs">
          <div className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-medium">Conversion History:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto py-1.5 scrollbar-hide">
            {conversions.map((conv) => (
              <Badge 
                key={conv.id} 
                variant={
                  conv.status === 'completed' 
                    ? 'success'
                    : conv.status === 'failed'
                      ? 'destructive'
                      : 'info'
                }
                className="whitespace-nowrap"
              >
                {conv.originalFormat.toUpperCase()} → {conv.convertedFormat.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 mr-2">
                  <Avatar className="h-8 w-8 border border-blue-200 dark:border-blue-900">
                    <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">AI</AvatarFallback>
                    <AvatarImage src="/bot-avatar.png" />
                  </Avatar>
                </div>
              )}
              
              <div 
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === "user" 
                    ? "bg-blue-600 text-white" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                }`}
              >
                {renderMessageContent(message)}
              </div>
              
              {message.role === "user" && (
                <div className="flex-shrink-0 ml-2">
                  <Avatar className="h-8 w-8 border border-blue-200 dark:border-blue-900">
                    <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                    <AvatarImage src="/user-avatar.png" />
                  </Avatar>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Loading indicator */}
        {chatState.isProcessing || chatState.isConverting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-start"
          >
            <div className="flex-shrink-0 mr-2">
              <Avatar className="h-8 w-8 border border-blue-200 dark:border-blue-900">
                <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
                <AvatarImage src="/bot-avatar.png" />
              </Avatar>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="flex space-x-2">
          <Button 
            type="button" 
            size="icon"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={chatState.isProcessing || chatState.isConverting}
            className="flex-shrink-0 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 border-blue-200 dark:border-blue-800 transition-all"
          >
            <FileUp className="h-4 w-4 text-blue-500" />
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp,.csv,.xlsx,.json,.xml"
            />
          </Button>
          
          <form onSubmit={handleSubmit} className="flex flex-1 space-x-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about file conversions or upload a file..."
              className="flex-1"
              disabled={chatState.isProcessing || chatState.isConverting}
            />
            <Button 
              type="submit" 
              disabled={chatState.isProcessing || chatState.isConverting || (!input.trim() && !chatState.currentFile)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {chatState.isProcessing || chatState.isConverting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendIcon className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}