import type { Metadata, Viewport } from "next"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"

import { description, siteUrl } from "@/lib/content"
import "@/components/background/GradientASCII.css"
import "./globals.css"

const title = "DevNotch — Misfit Engineering"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "DevNotch",
  authors: [{ name: "Kv", url: "https://kv404.dev" }],
  creator: "Misfit Engineering",
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Misfit Engineering",
    title,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body data-tab="home" className="bg-background text-foreground min-h-full font-sans">
        {children}
      </body>
    </html>
  )
}
