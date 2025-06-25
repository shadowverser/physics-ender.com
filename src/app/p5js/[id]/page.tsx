// src/app/p5js/[id]/page.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { client } from "@/lib/microcms";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const p5CDN = "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js";

export default function Page({ params }: { params: { id: string } }) {
  const [data, setData] = useState<{ title: string; caption: string; code: string } | null>(null);
  const [size, setSize] = useState({ width: 400, height: 400 });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // microCMSからデータ取得
  useEffect(() => {
    client.get({ endpoint: "sketch", contentId: params.id }).then(setData);
  }, [params.id]);

  // iframeからキャンバスサイズを受信して反映
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "p5-canvas-size") {
        setSize({
          width: e.data.width || 400,
          height: e.data.height || 400,
        });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  if (!data) return <div>Loading...</div>;

  // p5.jsコードの末尾に「親へサイズ通知」のコードを自動付与
  const notifySizeCode = `
  function sendCanvasSize() {
    const c = document.querySelector('canvas');
    if (!c) return;
    const { width, height } = c.getBoundingClientRect(); // ← ここ！
    window.parent.postMessage(
      { type: 'p5-canvas-size', width, height },
      '*'
    );
  }

  // 初回 & リサイズ時に送信
  window.addEventListener('load', sendCanvasSize);
  window.addEventListener('resize', sendCanvasSize);
  setTimeout(sendCanvasSize, 100);
`;
  const srcDoc = `
    <html>
        <head>
        <style>
            html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: transparent;
            }
            body { display: flex; justify-content: center; align-items: center; }
            canvas { display: block; }
        </style>
        <script src="${p5CDN}"></script>
        </head>
        <body>
        <script>
            ${data.code}
            ${notifySizeCode}
        </script>
        </body>
    </html>
    `;

    return (
      <ThemeProvider>
        <div className="min-h-screen flex flex-col bg-black text-white">
        {/* ヘッダー */}
        <Header />

        {/* メインコンテンツ */}
        <main
          className="flex-grow mx-auto w-full max-w-screen-md px-4 break-words"
        >
          <div style={{ maxWidth: 400, margin: "0 auto", padding: 24 }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>{data.title}</h1>
            <p style={{ color: "#444" }}>{data.caption}</p>
            <iframe
            ref={iframeRef}
            width={size.width}
            height={size.height}
            style={{
                border: "1px solid #ccc",
                borderRadius: 8,
                marginTop: 16,
                background: "transparent",
                display: "block",
                overflow: "hidden"
            }}
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            title="p5js-sketch"
            />
          </div>
        </main>

        {/* フッター */}
        <Footer />
      </div>
    </ThemeProvider>
        
    );
}