import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "InterviewShield | AI Stress Coach",
  description: "Real-time AI practice interview coach that detects stress and provides corrective feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col  text-slate-800 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
