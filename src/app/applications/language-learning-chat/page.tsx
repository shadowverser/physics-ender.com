"use client";
import React, { useEffect } from "react";
import DifyChat from "@/components/dify-chat";

const LanguageLearningChatPage = () => {
  // 動的vhを計算 (モバイルのキーボード開閉対応)
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty("--app-vh", `${window.innerHeight}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  return (
  <main className="fixed inset-0 flex flex-col px-4 pt-8 pb-8 bg-[#e0e0e0] overflow-hidden" style={{height: 'var(--app-vh)'}}>
    <h1 className="text-4xl font-extrabold text-gray-700 mb-2 drop-shadow">Language Learning Chat</h1>
    <div className="w-full h-[2px] rounded-full bg-gradient-to-r from-[#ffffff] via-[#cfcfcf] to-[#ffffff] mb-6"></div>
    {/* Chat area */}
    <div className="flex-1 w-full max-w-3xl sm:max-w-2xl mx-auto rounded-lg overflow-visible flex flex-col min-h-0">
      <div className="flex-1 flex min-h-0"><DifyChat /></div>
    </div>
  </main>
  );
};

export default LanguageLearningChatPage;