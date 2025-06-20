'use client'

import Link from 'next/link'
import { Headphones, Twitter } from 'lucide-react'

export function Footer() {
  return (

    <footer className="bg-gray-900 text-gray-400 py-8 w-full">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <p className="text-sm">&copy; 2024 2. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="https://soundcloud.com/kthrmusic" className="hover:text-white transition-colors" aria-label="Soundcloud">
              <Headphones className="h-5 w-5" />
            </Link>
            <Link href="https://x.com/yoroizuka2zore" className="hover:text-white transition-colors" aria-label="X (Twitter)">
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
