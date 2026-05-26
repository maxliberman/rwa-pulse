import type { Metadata } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { TooltipProvider } from '@/components/ui/tooltip'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-instrument',
})

export const metadata: Metadata = {
  title: 'RWA Pulse — Institutional Intelligence for Tokenized Real-World Assets',
  description: 'Compare tokenized treasuries, private credit, gold, and institutional on-chain products with live pricing, yield data, risk analysis, and portfolio context.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} dark`}>
      <body className="min-h-screen">
        <TooltipProvider delay={200}>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
            {children}
          </main>
        </TooltipProvider>
      </body>
    </html>
  )
}
