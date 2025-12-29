import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ChatWidget from "@/components/ai/ChatWidget"; // Import widget

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Toko Seragam Mutiara Bangsa",
  description: "Sistem Informasi Penjualan Seragam Sekolah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        <Toaster />
        <ChatWidget />
        
      </body>
    </html>
  );
}