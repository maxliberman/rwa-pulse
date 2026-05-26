import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { TooltipProvider } from '@/components/ui/tooltip'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'RWA Pulse — Real World Asset Intelligence',
  description: 'Live intelligence on tokenized real-world assets and stablecoin adoption across global markets.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen">
        <TooltipProvider delay={200}>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            {children}
          </main>
        </TooltipProvider>
      </body>
    </html>
  )
}
