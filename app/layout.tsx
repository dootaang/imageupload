import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { App } from 'antd';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "아카라이브 이미지 업로드",
  description: "아카라이브 스타일 이미지 업로드 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <App>
          {children}
        </App>
      </body>
    </html>
  );
}
