'use client'

import { ThemeProvider } from 'next-themes'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

const about_text: string = '140字に収まらなかった文章を載せるサイトです。不定期更新。';

export default function Home() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-black text-white">
        {/* ヘッダー */}
        <Header />

        {/* メインコンテンツ */}
        <main className="flex-grow mx-auto w-full max-w-screen-sm px-4 py-16">
          <section className="mb-24">
            <h2 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-2">About</h2>
            <div className="space-y-8">
              <p className="text-gray-400 mb-2">{about_text}</p>
            </div>
          </section>
        </main>

        {/* フッター */}
        <Footer />
      </div>
    </ThemeProvider>
  )
}
