import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4F46E5",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://skillbridge.dev"),
  title: "SkillBridge — Clinical-Grade Career Readiness & Skill Gap Analyzer",
  description:
    "Objective, evidence-weighted career readiness benchmarks, transparent skill gap analysis, and 30/60/90-day learning roadmaps.",
  keywords: [
    "career readiness",
    "skill gap analysis",
    "developer readiness",
    "resume audit",
    "learning roadmap",
  ],
  authors: [{ name: "SkillBridge Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "SkillBridge — Clinical-Grade Career Readiness & Skill Gap Analyzer",
    description:
      "Deterministic 0–100 benchmark scoring, categorized skill gap matrix, and live 30/60/90-day learning roadmaps.",
    url: "https://skillbridge.dev",
    siteName: "SkillBridge",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillBridge — Clinical-Grade Career Readiness & Skill Gap Analyzer",
    description:
      "Deterministic 0–100 benchmark scoring, categorized skill gap matrix, and live 30/60/90-day learning roadmaps.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-ink bg-canvas selection:bg-primary-subtle selection:text-primary`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
