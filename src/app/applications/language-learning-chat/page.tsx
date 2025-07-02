"use client";
import React, { useState, useEffect } from "react";
import DifyChat from "@/components/dify-chat";

const LanguageLearningChatPage = () => {
  const [appHeight, setAppHeight] = useState('100vh');

  useEffect(() => {
    // Set the height on initial load.
    // This avoids the layout shift when the mobile keyboard appears.
    setAppHeight(`${window.innerHeight}px`);
  }, []); // Empty dependency array ensures this runs only once on mount.

  return (
    <main
      className="fixed inset-x-0 top-0 flex flex-col px-2 sm:px-4 pt-4 pb-2 bg-[#e0e0e0] overflow-hidden"
      style={{ height: appHeight }}
    >
      <h1 className="text-2xl font-semibold text-gray-700 mb-1 drop-shadow-sm">Language Learning Chat</h1>
      <div className="w-full h-px bg-gradient-to-r from-[#ffffff] via-[#cfcfcf] to-[#ffffff] mb-2"></div>
      {/* Chat area */}
      <div className="flex-1 w-full max-w-4xl sm:max-w-3xl mx-auto rounded-lg overflow-visible flex flex-col min-h-0">
        <div className="flex-1 flex min-h-0"><DifyChat /></div>
      </div>
    </main>
  );
};

export default LanguageLearningChatPage;