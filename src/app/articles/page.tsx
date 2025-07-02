"use client";
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
import { client } from '@/lib/microcms';
import Link from 'next/link';

type Article = {
  id: string;
  title: string;
  summary?: string;
  content: string;
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await client.get({
          endpoint: 'articles',
          queries: { limit: 20, fields: 'id,title,summary' },
        });
        setArticles(data.contents);
      } catch (error) {
        console.error('記事の取得に失敗しました', error);
      }
    };
    fetchData();
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Header />
        <main className="max-w-screen-md w-full mx-auto px-8 py-16 flex-grow">
          <section>
            <h2 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-2">Articles</h2>
            <div className="space-y-8">
              {articles.map((article) => (
                <article key={article.id} className="border-l-4 border-white pl-4 py-2">
                  <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                  <p className="text-gray-400 mb-2">
                    {article.summary ? article.summary.substring(0, 100) : "No summary available"}...
                  </p>
                  <Link href={`/articles/${article.id}`} className="text-sm text-gray-300 hover:text-white transition-colors">
                    Read More →
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
