"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

// 1. Komponen Kartu Produk Mini (Product Card)
const MiniProductCard = ({ dataString }: { dataString: string }) => {
  // Format dataString: ID|Nama|Harga|URL
  const [id, name, price, imageUrl] = dataString.split("|");

  return (
    <div className="mt-3 mb-1 w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-32 w-full bg-gray-100">
        <img 
          src={imageUrl && imageUrl !== "undefined" && imageUrl !== "" ? imageUrl : "/img/mutirabangsalands.png"} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h4 className="font-bold text-sm text-gray-800 line-clamp-1" title={name}>{name}</h4>
        <p className="text-[#E8207E] text-xs font-semibold mt-1">
          Mulai Rp {parseInt(price || "0").toLocaleString("id-ID")}
        </p>
        <Link href={`/dashboard/customer/catalog/products/${id}`} target="_blank">
          {/* UPDATE DISINI: Mengganti warna button jadi #E8207E */}
          <Button 
            size="sm" 
            className="w-full mt-2 h-8 text-xs text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#E8207E" }} // Menggunakan style inline untuk warna spesifik
          >
            Lihat Produk <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

// 2. Fungsi Helper untuk Parsing Text Chat
const renderMessageContent = (text: string) => {
  const productRegex = /\[\[PRODUCT\|(.*?)\]\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = productRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'product', content: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return parts.map((part, i) => {
    if (part.type === 'product') {
      return <MiniProductCard key={i} dataString={part.content} />;
    }
    return (
      <ReactMarkdown 
        key={i}
        components={{
          ul: ({node, ...props}) => <ul className="list-disc pl-4 mt-1 mb-2 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-4 mt-1 mb-2 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="" {...props} />,
          strong: ({node, ...props}) => <span className="font-bold text-[#E8207E]" {...props} />, // Highlight text juga jadi pink
          p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
        }}
      >
        {part.content}
      </ReactMarkdown>
    );
  });
};

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
          className="h-14 w-14 rounded-full shadow-xl hover:opacity-90 transition-all duration-300"
          style={{ backgroundColor: "#4278eaff" }} // Tombol buka chat juga jadi Pink
        >
          <MessageCircle className="h-8 w-8 text-white" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-[350px] h-[500px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 duration-300 border-2" style={{ borderColor: "#fce7f3" }}>
          <CardHeader className="text-white rounded-t-lg py-3 flex flex-row items-center justify-between" style={{ backgroundColor: "#4278eaff" }}>
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              <div>
                <CardTitle className="text-sm font-bold">Mono</CardTitle>
                <p className="text-xs text-pink-100">Asisten Virtual</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-pink-700 h-8 w-8"
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
                      "flex w-fit max-w-[90%] flex-col gap-2 rounded-lg px-3 py-2 text-sm shadow-sm break-words",
                      m.role === "user"
                        ? "ml-auto text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    )}
                    
                    style={m.role === "user" ? { backgroundColor: "#4278eaff" } : {}}
                  >
                    {m.role === "user" ? (
                      m.text
                    ) : (
                      renderMessageContent(m.text)
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
                placeholder="Tanya stok seragam..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 focus-visible:ring-pink-500"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input} 
                className="hover:opacity-90"
                style={{ backgroundColor: "#4278eaff" }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}