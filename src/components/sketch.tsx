// components/Sketch.tsx
"use client";

import React, { useRef, useEffect } from 'react';
import type p5 from 'p5'; // 型のみをインポート

const Sketch: React.FC = () => {
    const myRef = useRef<HTMLDivElement>(null);
    const p5Instance = useRef<p5 | null>(null); // p5の型を使用

    useEffect(() => {
        if (myRef.current === null) return;

        // p5.jsを動的にインポート
        import('p5').then((p5Module) => {
            const P5 = p5Module.default;

            // スケッチ関数を定義
            const sketch = (p: p5) => {
                p.setup = () => {
                    p.createCanvas(600, 400);
                };

                p.draw = () => {
                    p.background(220);
                    p.fill(255, 0, 0);
                    p.ellipse(p.mouseX, p.mouseY, 100, 100);
                };
            };

            // p5.jsのインスタンスを作成
            p5Instance.current = new P5(sketch, myRef.current!);
        });

        // クリーンアップ関数
        return () => {
            if (p5Instance.current) {
                p5Instance.current.remove();
                p5Instance.current = null;
            }
        };
    }, []);

    return <div ref={myRef}></div>;
};

export default Sketch;
