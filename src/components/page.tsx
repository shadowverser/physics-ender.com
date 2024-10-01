'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export function Page() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="container mx-auto px-4 py-16">
        
        

        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-2">文章</h2>
          <div className="space-y-8">
            {[1, 2].map((post) => (
              <article key={post} className="border-l-4 border-white pl-4 py-2">
                <h3 className="text-xl font-semibold mb-2">Innovative Concept {post}</h3>
                <p className="text-gray-400 mb-2">A brief insight into groundbreaking idea {post}...</p>
                <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Read More →</Link>
              </article>
            ))}
          </div>
        </section>

        
      </main>

      <Footer />
    </div>
  )
}