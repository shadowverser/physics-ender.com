"use client";
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ThemeProvider } from 'next-themes';
import Link from 'next/link';

const applicationFolders = [
  { name: 'language-learning-chat' },
  // 他のサブディレクトリがあればここに追加
];

export default function ApplicationsPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Header />
        <main className="max-w-screen-md w-full mx-auto px-8 py-16">
          <section>
            <h2 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-2">Applications</h2>
            <div className="space-y-8">
              {applicationFolders.map((app: { name: string }) => (
                <article key={app.name} className="border-l-4 border-white pl-4 py-2">
                  <Link href={`/applications/${app.name}`} className="text-xl font-semibold text-blue-400 hover:underline">
                    {app.name}
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
