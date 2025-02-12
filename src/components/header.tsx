'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const topThreshold = 80; // ページ上部の閾値（50px 未満なら常に表示）

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
      </nav>
    </header>
  );
}
