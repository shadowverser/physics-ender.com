'use client'

import { ThemeProvider } from 'next-themes'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { client } from '@/lib/microcms'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import renderMathInElement from 'katex/contrib/auto-render'
import 'katex/dist/katex.min.css'

/**
 * ========= 仕様メモ =========
 * - microCMS Rich Text は HTML を返す。
 * - 数式：KaTeX auto‑render をクライアントサイドで実行。
 * - コードブロック：<pre><code class="language-xxx">…</code></pre>
 *   を rehype‑highlight がハイライト。
 * - インラインコード：<code>…</code> を Tailwind + カスタム component で装飾。
 * ============================
 */

type Article = {
  id: string;
  title: string;
  summary: string;
  content: string;
};

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const markdownRef = useRef<HTMLDivElement>(null);

  /* ---------------- fetch ---------------- */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await client.get({ endpoint: 'articles', contentId: id as string });
        setArticle(data);
      } catch (err) {
        console.error('記事の取得に失敗しました', err);
      }
    })();
  }, [id]);

  /* ------------- KaTeX render ------------ */
  useEffect(() => {
    if (article && markdownRef.current) {
      try {
        renderMathInElement(markdownRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
          ],
          throwOnError: false,
        });
      } catch (e) {
        console.error('KaTeX render error', e);
      }
    }
  }, [article]);

  if (!article) return <p className="text-white text-center mt-10">Loading...</p>;

  const ogImageUrl = `https://physics-ender.com/api/og?title=${encodeURIComponent(article.title)}`;

  return (
    <ThemeProvider>
      <Head>
        <title>{article.title}</title>
        <meta name="description" content={article.summary} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.summary} />
        <meta property="og:url" content={`https://physics-ender.com/articles/${article.id}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.summary} />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Head>

      <div className="min-h-screen flex flex-col bg-black text-white">
        <Header />

        <main className="flex-grow mx-auto w-full max-w-screen-sm px-4 py-16">
          <section className="mb-24">
            <h2 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-2">
              {article.title}
            </h2>

            {/* —— 概要 —— */}
            <div className="space-y-8 border-b border-gray-800">
              <p className="text-gray-200 mb-2 break-words whitespace-pre-wrap">
                {article.summary}
              </p>
            </div>

            {/* —— 本文 —— */}
            <div
              ref={markdownRef}
              className="space-y-4 mt-8 prose prose-invert text-gray-200"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={{
                  code: ({ node, inline, className, children, ...props }: any) => {
                    // ブロックコード: rehype-highlight に任せ、ラッパーだけ整形
                    if (!inline) {
                      return (
                        <pre className="my-4 overflow-x-auto rounded bg-gray-900">
                          <code className={className ?? ''} {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    }
                    // インラインコード: 独自装飾
                    return (
                      <code
                        className="bg-gray-800 text-rose-300 rounded px-1 font-mono text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}
