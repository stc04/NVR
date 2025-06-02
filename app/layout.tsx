import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Rental & Storage Security POS | AI-IT Inc",
  description:
    "Enterprise-grade network security and management platform for rental storage facilities. Designed by Steven Chason, AI-IT Inc.",
  keywords: "security, POS, rental storage, network monitoring, AI-IT Inc, Steven Chason",
  authors: [{ name: "Steven Chason", url: "https://ai-it.com" }],
  creator: "Steven Chason",
  publisher: "AI-IT Inc",
  robots: "noindex, nofollow", // Proprietary software
  viewport: "width=device-width, initial-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
