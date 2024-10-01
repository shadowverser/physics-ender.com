import { Page } from '@/components/page'
import { ThemeProvider } from 'next-themes'

export default function Home() {
  return (
    <main>
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    </main>
  )
}