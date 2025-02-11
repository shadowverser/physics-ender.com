import Home from '@/components/home'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ThemeProvider } from 'next-themes'

export default function Page() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-black text-white">
        {/* ヘッダー */}
        <Header />

        {/* メインコンテンツ */}
        <main className="flex-grow mx-auto w-full max-w-screen-md px-4 break-words">
          <Home />
        </main>

        {/* フッター */}
        <Footer />
      </div>
    </ThemeProvider>
  )
}

