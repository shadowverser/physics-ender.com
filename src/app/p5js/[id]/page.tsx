// src/app/p5js/[id]/page.tsx
"use client";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { client } from "@/lib/microcms";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const p5CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js";

export default function Page({ params }: { params: { id: string } }) {
  /** --------------------------------------------------
   *  state / refs
   * -------------------------------------------------- */
  const [data, setData] = useState<{
    title: string;
    caption: string;
    code: string;
  } | null>(null);

  const [size, setSize] = useState({ width: 400, height: 400 });
  const [scale, setScale] = useState(1);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /** --------------------------------------------------
   *  fetch sketch from microCMS
   * -------------------------------------------------- */
  useEffect(() => {
    client.get({ endpoint: "sketch", contentId: params.id }).then(setData);
  }, [params.id]);

  /** --------------------------------------------------
   *  receive canvas size from iframe → resize wrapper
   * -------------------------------------------------- */
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

  /** --------------------------------------------------
   *  auto-scale canvas to fit container width
   * -------------------------------------------------- */
  useLayoutEffect(() => {
    const updateScale = () => {
      if (!wrapperRef.current) return;
      const containerW = wrapperRef.current.offsetWidth;
      const s = containerW / size.width;
      setScale(s < 1 ? s : 1);
    };
    updateScale(); // first paint
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [size.width]);

  /** --------------------------------------------------
   *  wrapper: stop scroll chaining on Android/desktop
   * -------------------------------------------------- */
  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    node.addEventListener("touchmove", prevent, { passive: false });
    return () => node.removeEventListener("touchmove", prevent);
  }, []);

  if (!data) return <div>Loading...</div>;

  /** --------------------------------------------------
   *  helper snippets injected into the iframe
   * -------------------------------------------------- */

  /* 1) parent-size notifier */
  const notifySizeCode = `
    function sendCanvasSize() {
      const c = document.querySelector('canvas');
      if (!c) return;
      const { width, height } = c.getBoundingClientRect();
      window.parent.postMessage(
        { type: 'p5-canvas-size', width, height },
        '*'
      );
    }
    window.addEventListener('load', sendCanvasSize);
    window.addEventListener('resize', sendCanvasSize);
    setTimeout(sendCanvasSize, 100);
  `;

  /* 2) iOS Safari scroll lock */
  const lockScrollCode = `
    const lock = (e) => e.preventDefault();
    document.addEventListener('touchmove',   lock, { passive: false });
    document.addEventListener('pointermove', lock, { passive: false });
  `;

  /** --------------------------------------------------
   *  build iframe srcdoc
   * -------------------------------------------------- */
  const srcDoc = `
    <html>
      <head>
        <meta name="viewport"
              content="width=device-width,initial-scale=1,
                       maximum-scale=1,user-scalable=no">
        <style>
          html, body {
            width: 100%; height: 100%;
            margin: 0; padding: 0;
            overflow: hidden;
            background: transparent;
            overscroll-behavior: contain;
            touch-action: none;
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
          ${lockScrollCode}
        </script>
      </body>
    </html>
  `;

  /** --------------------------------------------------
   *  render
   * -------------------------------------------------- */
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Header />

        <main className="flex-grow mx-auto w-full max-w-screen-md px-4 break-words">
          <div style={{ maxWidth: "100%", margin: "0 auto", padding: 24 }}>
            <h2 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-2">
              {data.title}
            </h2>

            {/* —— caption —— */}
            <div className="space-y-8 border-b border-gray-800">
              <p className="text-gray-200 mb-2 break-words whitespace-pre-wrap">
                {data.caption}
              </p>
            </div>

            {/* —— p5.js sketch wrapper —— */}
            <div
              ref={wrapperRef}
              style={{
                width: "100%",
                height: size.height * scale,
                overflow: "hidden",
                overscrollBehavior: "contain",
                touchAction: "none",
              }}
            >
              <iframe
                ref={iframeRef}
                scrolling="no" // old WebKit 保険
                width={size.width}
                height={size.height}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  background: "transparent",
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
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
