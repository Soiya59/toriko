import React from "react"
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'

import './globals.css'

export const dynamic = 'force-dynamic'

const notoSansJP = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Gourmet Hunter SEIYA - 人生のフルコース',
  description: 'トリコにインスパイアされた、自分だけの「人生のフルコース」と「料理ジャンル別ランキング」を管理するグルメ記録アプリ。カレンダーで食の記録を振り返ろう。',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '美食フルコース',
  },
}

export const viewport: Viewport = {
  themeColor: '#e5541a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
