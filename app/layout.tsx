import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import AuthGate from "@/components/AuthGate";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "台中美食地圖",
  description: "Lu & Han 的台中美食收藏",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className={`${geistSans.variable} h-full antialiased`} style={{colorScheme:'light'}}>
      <body className="h-full" style={{colorScheme:'light'}}><AuthGate>{children}</AuthGate></body>
    </html>
  );
}
