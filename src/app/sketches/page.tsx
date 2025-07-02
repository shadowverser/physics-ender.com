"use client";
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
import { client } from '@/lib/microcms';
import Link from 'next/link';

type Sketch = {
  id: string;
  title: string;
  caption: string;
};

export default function SketchesPage() {
  const [sketches, setSketches] = useState<Sketch[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await client.get({
          endpoint: 'sketch',
          queries: { limit: 20, fields: 'id,title,caption' },
        });
        setSketches(data.contents);
      } catch (error) {
        console.error('スケッチの取得に失敗しました', error);
      }
    };
    fetchData();
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Header />
        <main className="max-w-screen-md w-full mx-auto px-8 py-16">
          <section>
            <h2 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-2">Sketches</h2>
            <div className="space-y-8">
              {sketches.map((sketch) => (
                <article key={sketch.id} className="border-l-4 border-white pl-4 py-2">
                  <h3 className="text-xl font-semibold mb-2">{sketch.title}</h3>
                  <p className="text-gray-400 mb-2">
                    {sketch.caption ? sketch.caption.substring(0, 100) : 'No caption available'}...
                  </p>
                  <Link href={`/sketches/${sketch.id}`} className="text-sm text-gray-300 hover:text-white transition-colors">
                    See →
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
