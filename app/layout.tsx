import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { cookies } from "next/headers"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ClientInitializer } from "@/components/client-initializer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Personal Budget Tracker",
  description: "Your private, offline-first personal budget tracker.",
  manifest: "/manifest.json", // Link to the PWA manifest
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <SidebarInset>
              <main className="flex flex-col flex-1 p-4 md:p-6">
                <div className="flex items-center gap-4 mb-4">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold">Budget Tracker</h1>
                </div>
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
          {/* Render the client-side initializer and quick add button */}
          <ClientInitializer />
        </ThemeProvider>
      </body>
    </html>
  )
}
