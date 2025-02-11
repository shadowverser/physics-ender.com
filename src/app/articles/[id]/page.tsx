'use client'

import { ThemeProvider } from 'next-themes'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { client } from '@/lib/microcms'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Article = {
    id: string;
    title: string;
    summary: string;
    content: string;
    imageUrl?: string; // 画像URLがある場合の対応
};

export default function ArticlePage() {
    const { id } = useParams(); // パラメータ取得
    const [article, setArticle] = useState<Article | null>(null);

    useEffect(() => {
        async function fetchArticle() {
            try {
                const data = await client.get({
                    endpoint: 'articles',
                    contentId: id as string,
                });
                setArticle(data);
            } catch (error) {
                console.error("記事の取得に失敗しました", error);
            }
        }

        if (id) {
            fetchArticle();
        }
    }, [id]);

    if (!article) {
        return <p className="text-white text-center mt-10">Loading...</p>;
    }

    return (
        <ThemeProvider>
            <Head>
                <title>{article.title}</title>
                <meta name="description" content={article.summary} />
                <meta property="og:title" content={article.title} />
                <meta property="og:description" content={article.summary} />
                <meta property="og:url" content={`https://example.com/articles/${article.id}`} />
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={article.title} />
                <meta name="twitter:description" content={article.summary} />
                {article.imageUrl && (
                    <>
                        <meta property="og:image" content={article.imageUrl} />
                        <meta name="twitter:image" content={article.imageUrl} />
                    </>
                )}
            </Head>

            <div className="min-h-screen flex flex-col bg-black text-white">
                {/* ヘッダー */}
                <Header />

                {/* メインコンテンツ */}
                <main className="flex-grow mx-auto w-full max-w-screen-sm px-4 py-16">
                    <section className="mb-24">
                        <h2 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-2">{article.title}</h2>
                        <div className="space-y-8 border-b border-gray-800">
                            <p className="text-gray-200 mb-2 break-words">{article.summary}</p>
                        </div>
                        <div className='space-y-4 mt-8 prose prose-invert text-gray-400'>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                            >
                                {article.content}
                            </ReactMarkdown>
                        </div>
                    </section>
                </main>

                {/* フッター */}
                <Footer />
            </div>
        </ThemeProvider>
    )
}
