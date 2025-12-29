// components/ai/ChatWidget.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Auto scroll ke bawah saat ada pesan baru
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
      // Format history untuk Gemini (user -> model)
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage, 
          history: history 
        }),
      });

      const data = await res.json();
      
      if (data.response) {
        setMessages((prev) => [...prev, { role: "model", text: data.response }]);
      } else {
        throw new Error("No response");
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "model", text: "Maaf, saya sedang gangguan sebentar. Coba lagi ya!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tombol Buka Tutup */}
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)} 
          className="h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 transition-all duration-300"
        >
          <MessageCircle className="h-8 w-8 text-white" />
        </Button>
      )}

      {/* Card Chatbox */}
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
                      "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm shadow-sm",
                      m.role === "user"
                        ? "ml-auto bg-blue-600 text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    )}
                  >
                    {m.text}
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
                placeholder="Tanya stok seragam..."
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