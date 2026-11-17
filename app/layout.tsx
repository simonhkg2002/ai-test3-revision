import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Loop — AI Test 3 溫習桌",
  description:
    "從零補底，逐步理解 COMP3057。選擇題、推理、matrix 計算與程式修正，反覆練習。",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
