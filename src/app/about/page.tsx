'use client'

import { ThemeProvider } from 'next-themes'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

const about_text: String = '140字に収まらなかった文章を載せるサイトです。不定期更新';

export default function Home() {
  return (
    <main>
      <ThemeProvider>
        <div className="min-h-screen bg-black text-white">
            <Header />
            <main className="container mx-auto px-4 py-16">
                <section className="mb-24">
                <h2 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-2">About</h2>
                <div className="space-y-8">
                    <p className="text-gray-400 mb-2">{about_text}</p>
                </div>
                </section>
            </main>
            <Footer />
        </div>
      </ThemeProvider>
    </main>
  )
}