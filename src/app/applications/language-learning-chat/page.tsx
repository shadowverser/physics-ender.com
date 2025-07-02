"use client";
import React, { useEffect, useRef } from "react";

const LanguageLearningChatPage = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setHeight = () => {
      if (wrapperRef.current) {
        wrapperRef.current.style.height = window.innerHeight + "px";
      }
    };
    setHeight();
    window.addEventListener("resize", setHeight);
    return () => window.removeEventListener("resize", setHeight);
  }, []);

  return (
    <div ref={wrapperRef} style={{ width: "100%" }}>
      <iframe
        src="https://udify.app/chatbot/AnAdDc4jkQgvjSlf"
        style={{ width: "100%", height: "100%", border: 0 }}
        allow="microphone"
      />
    </div>
  );
};

export default LanguageLearningChatPage;