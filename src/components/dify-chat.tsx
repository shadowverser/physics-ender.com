"use client";
import React, { useState, useRef, useEffect } from "react";

interface AssistantMessage {
  advice?: string;
  englishResponse?: string;
  japaneseTranslation?: string;
  hints?: { english: string; japanese: string }[];
}

interface Message {
  role: "user" | "assistant";
  content: string; // For user messages and simple assistant messages
  structuredContent?: AssistantMessage;
}

export default function DifyChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "英語学習用のチャットAIアプリです。\n英語でも日本語でも話しかけることができます。\n送ったメッセージについてのアドバイスや英訳、英語での返答とその和訳、さらに会話を進めるためのヒントを返します。",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (e.key === 'Tab' && !loading) {
      const lastMessage = messages[messages.length - 1];
      const latestHints =
        lastMessage?.role === "assistant" &&
        lastMessage.structuredContent?.hints
          ? lastMessage.structuredContent.hints
          : [];
      
      if (latestHints.length > 0 && !hintUsed) {
        e.preventDefault();
        handleHintClick(latestHints[0].english);
      }
    }
  };

  const sendMessage = async (messageContent?: string) => {
    const currentInput = messageContent || input;
    if (!currentInput.trim()) return;

    const userMsg: Message = { role: "user", content: currentInput };
    setMessages((prev) => [...prev, userMsg]);
    if (!messageContent) {
      setInput("");
    }
    setLoading(true);
    setHintUsed(false); // Reset hint usage on new message

    const assistantMsgIndex = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", structuredContent: { hints: [] } },
    ]);

    try {
      const res = await fetch("/api/dify-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentInput, user: "guest" }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`API error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let sseBuffer = "";
      let fullAnswer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split("\n\n");
        sseBuffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.substring(5).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const data = JSON.parse(jsonStr);
            if (data.answer) {
              fullAnswer += data.answer;
            }
          } catch {
            console.warn("Partial JSON in SSE stream, ignoring.", jsonStr);
          }
        }

        // Now parse `fullAnswer` and update state.
        const newStructuredContent: AssistantMessage = {};

        const extract = (tag: string) => {
            const startTag = `<llm_output_${tag}>`;
            const endTag = `</llm_output_${tag}>`;
            const start = fullAnswer.indexOf(startTag);
            if (start === -1) return null;
            const contentStart = start + startTag.length;
            const end = fullAnswer.indexOf(endTag, contentStart);
            
            // Special handling for the streaming English response
            if (end === -1 && tag === 'english_response') {
                return fullAnswer.substring(contentStart).trim();
            }

            if (end === -1) return null;
            return fullAnswer.substring(contentStart, end).trim();
        };

        newStructuredContent.advice = extract('advice') ?? undefined;
        newStructuredContent.englishResponse = extract('english_response') ?? undefined;
        newStructuredContent.japaneseTranslation = extract('japanese_translation') ?? undefined;
        
        const hints: { english: string; japanese: string }[] = [];
        const hintEnRegex = /<llm_output_hints>([\s\S]*?)<\/llm_output_hints>/g;
        const hintJaRegex = /<llm_output_hints_japanese_translation>([\s\S]*?)<\/llm_output_hints_japanese_translation>/g;

        const enMatches = [];
        let match;
        while ((match = hintEnRegex.exec(fullAnswer)) !== null) {
            enMatches.push(match[1]);
        }

        const jaMatches = [];
        while ((match = hintJaRegex.exec(fullAnswer)) !== null) {
            jaMatches.push(match[1]);
        }

        for (let i = 0; i < Math.min(enMatches.length, jaMatches.length); i++) {
            hints.push({ english: enMatches[i], japanese: jaMatches[i] });
        }
        newStructuredContent.hints = hints;

        setMessages((prev) => {
            const updated = [...prev];
            if (updated[assistantMsgIndex]) {
                updated[assistantMsgIndex].structuredContent = newStructuredContent;
            }
            return updated;
        });
      }

      // Fallback for when no structured content is parsed
      setMessages(prev => {
          const updated = [...prev];
          const lastMessage = updated[assistantMsgIndex];
          if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.structuredContent?.englishResponse && fullAnswer) {
              lastMessage.content = fullAnswer;
              delete lastMessage.structuredContent;
          }
          return updated;
      });
    } catch (error: unknown) {
      console.error(error);
      let errorMessage = "エラーが発生しました。";
      if (error instanceof Error && error.message.includes('API error: 504')) {
        errorMessage = "タイムアウトしました。しばらくしてからもう一度お試しください。";
      } else if (error instanceof Error) {
        errorMessage = `エラーが発生しました: ${error.message}`;
      }
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[assistantMsgIndex]) {
            updated[assistantMsgIndex].content = errorMessage;
            delete updated[assistantMsgIndex].structuredContent;
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };



  const handleHintClick = (hint: string) => {
    setInput(hint);
    setHintUsed(true);
  };

  return (
    <div className="flex flex-col h-full p-4 bg-[#e0e0e0]">
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-6 p-4 text-gray-800 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-[#e0e0e0]">
        {messages.map((msg, idx) => {
            const nextMsg = messages[idx + 1];
            const adviceForThisUserMessage = (msg.role === 'user' && nextMsg?.role === 'assistant') ? nextMsg.structuredContent?.advice : undefined;

            return (
                <div key={idx} className="space-y-4">
                    {/* User Message with Advice */}
                    {msg.role === 'user' && (
                    <div className="flex justify-end">
                        <div className="flex flex-col-reverse md:flex-row items-end md:items-start gap-4">
                            {adviceForThisUserMessage && (
                            <div className="bg-amber-100 text-amber-800 p-3 rounded-lg text-sm border border-amber-200 shadow-md w-full md:max-w-xs">
                                <p className="font-semibold mb-1">💡 Advice</p>
                                <p className="whitespace-pre-wrap">{adviceForThisUserMessage}</p>
                            </div>
                            )}
                            <div className="flex flex-col items-end">
                                <span style={{boxShadow: "6px 6px 12px #bebebe, -6px -6px 12px #ffffff"}} className="whitespace-pre-wrap text-left inline-block rounded-lg p-3 max-w-[80%] text-gray-800 bg-gray-100">
                                    {msg.content}
                                </span>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Assistant Message with Translation */}
                    {msg.role === 'assistant' && (
                    <div className="flex justify-start">
                        {msg.structuredContent ? (
                        <div className="flex flex-col md:flex-row items-start gap-4">
                            <div style={{boxShadow: "inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff"}} className="whitespace-pre-wrap text-left inline-block rounded-lg p-3 text-gray-800 bg-gray-200 w-full md:max-w-[60%]">
                            {msg.structuredContent.englishResponse || <span className="animate-pulse">...</span>}
                            </div>
                            {msg.structuredContent.japaneseTranslation && (
                            <div className="bg-sky-100 text-sky-800 p-3 rounded-lg text-sm border border-sky-200 shadow-md w-full md:max-w-xs">
                                <p className="font-semibold mb-1">🇯🇵 和訳</p>
                                <p className="whitespace-pre-wrap">{msg.structuredContent.japaneseTranslation}</p>
                            </div>
                            )}
                        </div>
                        ) : (
                        <span style={{boxShadow: "inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff"}} className="whitespace-pre-wrap text-left inline-block rounded-lg p-3 max-w-[80%] text-gray-800 bg-gray-200">
                            {msg.content}
                        </span>
                        )}
                    </div>
                    )}
                </div>
            )
        })}
        <div ref={bottomRef} />
      </div>

      {(() => {
        const lastMessage = messages[messages.length - 1];
        const latestHints =
          lastMessage?.role === "assistant" &&
          lastMessage.structuredContent?.hints
            ? lastMessage.structuredContent.hints
            : [];

        if (latestHints.length === 0 || loading || hintUsed) {
          return null;
        }

        return (
          <div className="px-4 pt-2 pb-4 bg-[#e0e0e0] border-t border-gray-200">
            <div className="text-center text-sm text-gray-600 mb-2">
                <p>書き出しのヒント (Tabキーで入力欄に追加します)</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                {latestHints.map((hint, hIdx) => (
                    <button key={hIdx} onClick={() => handleHintClick(hint.english)} className="bg-gray-50 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-all shadow-md hover:shadow-lg">
                        <div className="font-medium">{hint.english}...</div>
                        <div className="text-xs text-gray-500">{hint.japanese}</div>
                    </button>
                ))}
            </div>
          </div>
        );
      })()}

      <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="p-4 bg-[#e0e0e0] flex gap-2 items-center border-t border-gray-300">
        <textarea
          rows={1}
          className="flex-1 rounded-xl p-3 text-gray-800 bg-[#e0e0e0] focus:outline-none resize-y max-h-40 min-h-[44px]"
          style={{boxShadow: "inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff"}}
          placeholder="メッセージを入力..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 h-[44px] rounded-xl text-gray-800 flex items-center justify-center transition-colors disabled:opacity-50"
          style={{backgroundColor:'#e0e0e0',boxShadow:'6px 6px 12px #bebebe, -6px -6px 12px #ffffff'}}
        >
          {loading ? "..." : "送信"}
        </button>
      </form>
    </div>
  );
}
