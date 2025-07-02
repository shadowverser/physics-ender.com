'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const topThreshold = 60; // ページ上部の閾値（50px 未満なら常に表示）

  // ヘッダーの高さをCSS変数に設定する
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  // スクロール方向による表示切替 + ページ上部では常に表示
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < topThreshold) {
        // ページ上部なら常に表示
        setIsVisible(true);
      } else {
        if (currentScrollY > lastScrollY.current) {
          // 下にスクロールしたら非表示
          setIsVisible(false);
        } else {
          // 上にスクロールしたら表示
          setIsVisible(true);
        }
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // メニューの外側クリックで閉じる
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      id="site-header"
      className={`bg-black/50 border-b border-gray-800 fixed top-0 w-full transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
    >
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold mx-2">
          physics-ender.com
        </Link>
        {/* Hamburger Menu */}
        <div className="relative">
          <button
            className="flex flex-col justify-center items-center w-10 h-10 rounded hover:bg-gray-700 focus:outline-none"
            aria-label="Open navigation menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="block w-6 h-0.5 bg-white mb-1"></span>
            <span className="block w-6 h-0.5 bg-white mb-1"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </button>
          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-48 bg-black border border-gray-700 rounded shadow-lg z-50 animate-fade-in"
            >
              <Link
                href="/"
                className="block px-4 py-2 text-white hover:bg-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/articles"
                className="block px-4 py-2 text-white hover:bg-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                Articles
              </Link>
              <Link
                href="/sketches"
                className="block px-4 py-2 text-white hover:bg-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                Sketches
              </Link>
              <Link
                href="/applications"
                className="block px-4 py-2 text-white hover:bg-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                Applications
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
