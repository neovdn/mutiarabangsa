// components/ai/ChatWidget.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "model", text: "Halo! Kamu lagi cari produk apa nih?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      let cleanHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      // Filter history agar tidak error (sesuai perbaikan sebelumnya)
      if (cleanHistory.length > 0 && cleanHistory[0].role === "model") {
        cleanHistory = cleanHistory.slice(1);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage, 
          history: cleanHistory 
        }),
      });

      const data = await res.json();
      
      if (data.response) {
        setMessages((prev) => [...prev, { role: "model", text: data.response }]);
      } else {
        throw new Error("No response");
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "model", text: "Maaf, Mono lagi pusing. Coba lagi nanti ya!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)} 
          className="h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 transition-all duration-300"
        >
          <MessageCircle className="h-8 w-8 text-white" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-[350px] h-[500px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 duration-300 border-2 border-blue-100">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg py-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              <div>
                <CardTitle className="text-sm font-bold">Mono</CardTitle>
                <p className="text-xs text-blue-100">Asisten Virtual</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-blue-700 h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden bg-gray-50">
            <ScrollArea className="h-full p-4">
              <div className="flex flex-col gap-3">
                {messages.map((m, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex w-fit max-w-[90%] flex-col gap-2 rounded-lg px-3 py-2 text-sm shadow-sm break-words", // Hapus whitespace-pre-wrap karena sudah dihandle Markdown
                      m.role === "user"
                        ? "ml-auto bg-blue-600 text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    )}
                  >
                    {/* 2. Logic Rendering: User teks biasa, Model pakai Markdown */}
                    {m.role === "user" ? (
                      m.text
                    ) : (
                      <ReactMarkdown 
                        components={{
                          // Kustomisasi styling elemen HTML hasil markdown
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 mt-1 mb-2 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 mt-1 mb-2 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="" {...props} />,
                          strong: ({node, ...props}) => <span className="font-bold text-blue-700" {...props} />, // Biar bold-nya agak berwarna
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                        }}
                      >
                        {m.text}
                      </ReactMarkdown>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-white text-gray-500 text-xs w-max rounded-lg px-3 py-2 animate-pulse border border-gray-200">
                    Sedang mengetik...
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-3 bg-white border-t">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
              className="flex w-full items-center gap-2"
            >
              <Input
                placeholder="Tanya Mono tentang produk..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 focus-visible:ring-blue-500"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input} className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}