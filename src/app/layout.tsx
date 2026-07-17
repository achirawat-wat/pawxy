import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PipWindow } from "@/components/PipWindow";
import { AiNoteFollowupModal } from "@/components/AiNoteFollowupModal";
import { AiDailyReviewModal } from "@/components/AiDailyReviewModal";
import { FeedbackWidget } from "@/components/FeedbackWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PAWXY | The Next-Generation Productivity Web OS",
  description: "The AI Chief of Staff that acts as your proxy to manage time, while keeping you focused via a feline companion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <PipWindow isGlobal />
        <AiNoteFollowupModal />
        <AiDailyReviewModal />
        <FeedbackWidget />
      </body>
    </html>
  );
}
