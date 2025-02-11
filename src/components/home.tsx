'use client';

// src/components/Home.tsx

import { useEffect, useState } from "react";
import { client } from '@/lib/microcms';
import Link from 'next/link';
import { useRouter } from "next/navigation";

type Article = {
  id: string;
  title: string;
  summary: string;
  content: string;
};

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const data = await client.get({
        endpoint: "articles",
        queries: { limit: 10 },
      });
      setArticles(data.contents);
    };
    fetchData();
  }, []);

  return (
    <main className="container mx-auto px-4 py-16">
      <section className="mb-24">
        <h2 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-2">Articles</h2>
        <div className="space-y-8">
          {articles.map((article) => (
            <article key={article.id} className="border-l-4 border-white pl-4 py-2">
              <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
              <p className="text-gray-400 mb-2">{article.summary?.substring(0, 100)}...</p> {/* sammaryの冒頭部分を表示 */}
              <Link href={`/articles/${article.id}`} className="text-sm text-gray-300 hover:text-white transition-colors">
                Read More →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
