// src/app/p5js/[id]/page.tsx
"use client";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { client } from "@/lib/microcms";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const p5CDN = "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js";

export default function Page({ params }: { params: { id: string } }) {
  const [data, setData] = useState<{ title: string; caption: string; code: string } | null>(null);
  const [size, setSize] = useState({ width: 400, height: 400 });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

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

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;
  
    const preventScroll = (e: TouchEvent) => e.preventDefault();
    node.addEventListener("touchmove", preventScroll, { passive: false });
  
    return () => node.removeEventListener("touchmove", preventScroll);
  }, []);

  useLayoutEffect(() => {
    const updateScale = () => {
      if (!wrapperRef.current) return;
      const containerW = wrapperRef.current.offsetWidth;
      const s = containerW / size.width;
      // 幅が狭いときは縮小、広いときは等倍
      setScale(s < 1 ? s : 1);
    };
    updateScale();                         // 初回
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [size.width]);

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
          <Header />
  
          <main className="flex-grow mx-auto w-full max-w-screen-md px-4 break-words">
            <div style={{ maxWidth: "100%", margin: "0 auto", padding: 24 }}>
            <h2 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-2">
              {data.title}
            </h2>

            {/* —— 概要 —— */}
            <div className="space-y-8 border-b border-gray-800">
              <p className="text-gray-200 mb-2 break-words whitespace-pre-wrap">
                {data.caption}
              </p>
            </div>
  
              {/* ★ ラッパーに scale を掛ける */}
              <div
                ref={wrapperRef}
                style={{
                  width: "100%",            // ブラウザ幅いっぱい
                  height: size.height * scale, // 等比縮小した高さ
                  overflow: "hidden",       // はみ出しを隠す
                  overscrollBehavior: "contain", // 親スクロールへ連鎖させない
                  touchAction: "none",           // ブラウザ既定のジェスチャーを無効化
                }}
              >
                <iframe
                  ref={iframeRef}
                  width={size.width}
                  height={size.height}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    background: "transparent",
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    /* pointer-events: scale<1 ? "none" : "auto" */
                  }}
                  srcDoc={srcDoc}
                  sandbox="allow-scripts"
                  title="p5js-sketch"
                />
              </div>
            </div>
          </main>
  
          <Footer />
        </div>
      </ThemeProvider>
    );
}