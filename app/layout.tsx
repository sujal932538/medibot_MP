import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { OptimizedToaster } from "@/components/ui/optimized-toaster"
import { ErrorBoundary } from "@/components/error-boundary"
import { Providers } from "./providers"
import { ClientOnly } from "@/components/client-only"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MEDIBOT - AI Health Companion",
  description: "Your personal AI health companion for symptom analysis, doctor consultations, and health monitoring",
  keywords: "healthcare, AI, medical, symptoms, doctor, consultation, health monitoring",
  authors: [{ name: "MEDIBOT Team" }],
  generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Safe error suppression for browser extensions
              (function() {
                const originalConsoleError = console.error;
                console.error = function(...args) {
                  const message = args.join(' ').toLowerCase();
                  const extensionKeywords = ['metamask', 'ethereum', 'web3', 'coinbase', 'wallet', 'crypto', 'blockchain', 'extension', 'bis_skin_checked'];
                  
                  if (!extensionKeywords.some(keyword => message.includes(keyword))) {
                    originalConsoleError.apply(console, args);
                  }
                };

                // Handle unhandled promise rejections
                window.addEventListener('unhandledrejection', function(event) {
                  const reason = String(event.reason).toLowerCase();
                  const extensionKeywords = ['metamask', 'ethereum', 'web3', 'coinbase', 'wallet', 'crypto', 'blockchain', 'extension', 'bis_skin_checked'];
                  
                  if (extensionKeywords.some(keyword => reason.includes(keyword))) {
                    event.preventDefault();
                    return false;
                  }
                });

                // Handle general errors
                window.addEventListener('error', function(event) {
                  const message = event.message?.toLowerCase() || '';
                  const extensionKeywords = ['metamask', 'ethereum', 'web3', 'coinbase', 'wallet', 'crypto', 'blockchain', 'extension', 'bis_skin_checked'];
                  
                  if (extensionKeywords.some(keyword => message.includes(keyword))) {
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                  }
                });

                // Suppress hydration warnings for browser extensions
                window.addEventListener('DOMContentLoaded', function() {
                  const originalWarn = console.warn;
                  console.warn = function(...args) {
                    const message = args.join(' ').toLowerCase();
                    if (message.includes('hydration') || message.includes('bis_skin_checked')) {
                      return;
                    }
                    originalWarn.apply(console, args);
                  };
                });
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <Providers>
            {children}
            <ClientOnly fallback={null}>
              <OptimizedToaster />
            </ClientOnly>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
