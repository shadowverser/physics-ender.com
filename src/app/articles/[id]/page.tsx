'use client'

import { ThemeProvider } from 'next-themes'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { client } from '@/lib/microcms';
import ReactMarkdown from 'react-markdown';

type Article = {
    id: string;
    title: string;
    summary: string;
    content: string;
};

export default async function ArticlePage({ params }: { params: { id: string } }) {
    // microCMSから特定の記事データを取得
    const data = await client.get({
        endpoint: 'articles',
        contentId: params.id,
    });

    const article: Article = data;

    return (
        <ThemeProvider>
            <div className="min-h-screen flex flex-col bg-black text-white">
                {/* ヘッダー */}
                <Header />

                {/* メインコンテンツ */}
                <main className="flex-grow mx-auto w-full max-w-screen-sm px-4 py-16">
                    <section className="mb-24">
                        <h2 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-2">{article.title}</h2>
                        <div className="space-y-8">
                            <p className="text-gray-200 mb-2 break-words">{article.summary}</p>
                            <ReactMarkdown>{article.content}</ReactMarkdown>
                        </div>
                    </section>
                </main>

                {/* フッター */}
                <Footer />
            </div>
        </ThemeProvider>
    )
}
