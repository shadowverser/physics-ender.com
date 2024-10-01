'use client'

import Link from 'next/link'

export function Header() {
  return (
      <header className="border-b border-gray-800">
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">physics-ender.com</Link>
          <div className="space-x-6 text-sm">
            <Link href="/about" className="hover:text-gray-300 transition-colors">ABOUT</Link>
          </div>
        </nav>
      </header>
  )
}