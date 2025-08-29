"use client"

import { SessionProvider } from "next-auth/react"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { ThemeProvider } from "@/components/theme-provider"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function Providers({ 
  children,
  session
}: { 
  children: React.ReactNode
  session: any
}) {
  return (
    <SessionProvider session={session}>
      <ConvexProvider client={convex}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </ConvexProvider>
    </SessionProvider>
  )
}