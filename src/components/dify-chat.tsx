"use client";
import React, { useState, useRef, useEffect, FormEvent } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function DifyChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "user", content: "あなたは？" },
    {
      role: "assistant",
      content:
        "英語学習用のチャットAIアプリです。\n英語でも日本語でも話しかけることができます。\n送ったメッセージについてのアドバイスや英訳、英語での返答とその和訳、さらに会話を進めるためのヒントを返します。",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/dify-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userMsg.content,
          user: "guest",
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`API error: ${res.status}`);
      }

      // Prepare a placeholder assistant message that we'll update incrementally
      let assistantContent = "";
      const assistantIndex = messages.length + 1; // after pushing user message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Process SSE lines
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || ""; // keep incomplete chunk
        for (const l of lines) {
          const line = l.trim();
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.replace(/^data:\s*/, "").trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const obj = JSON.parse(jsonStr);
            if (obj.answer) {
              assistantContent += obj.answer;
              setMessages((prev) => {
                const updated = [...prev];
                updated[assistantIndex] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch (e) {
            console.error("JSON parse error", e);
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "エラーが発生しました。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="flex flex-col h-full rounded-2xl p-4 bg-[#e0e0e0]" style={{boxShadow: "10px 10px 20px #bebebe, -10px -10px 20px #ffffff"}}>
      {/* メッセージリスト */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-6 p-4 text-gray-800 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-[#e0e0e0]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`whitespace-pre-wrap ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span style={msg.role === "user" ? {boxShadow: "6px 6px 12px #bebebe, -6px -6px 12px #ffffff"} : {boxShadow: "inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff"}}
              className={`inline-block rounded-lg p-3 max-w-[80%] text-gray-800 ${
                msg.role === "user" ? "bg-gray-100" : "bg-gray-200"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 入力フォーム */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-[#e0e0e0] flex gap-2 items-center border-t border-gray-300"
      >
        <textarea
          rows={2}
          className="flex-1 rounded-xl p-3 text-gray-800 bg-[#e0e0e0] focus:outline-none resize-y max-h-40" style={{boxShadow: "inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff"}}
          placeholder="メッセージを入力..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl text-gray-800 transition-colors disabled:opacity-50" style={{backgroundColor:'#e0e0e0',boxShadow:'6px 6px 12px #bebebe, -6px -6px 12px #ffffff'}}
        >
          {loading ? "..." : "送信"}
        </button>
      </form>
    </div>
  );
}
