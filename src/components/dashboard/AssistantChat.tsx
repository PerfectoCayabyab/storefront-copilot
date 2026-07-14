"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, Loader2, Send, User } from "lucide-react";

type Message = { role: "user" | "model"; text: string };

const SUGGESTIONS = [
  "What's the best gift under $50?",
  "Compare the two waterproof jackets",
  "Which products are low on stock?",
  "Recommend a setup for a weekend camping trip",
];

export default function AssistantChat({
  storeId,
  indexedCount,
}: {
  storeId: string;
  indexedCount: number;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || streaming) return;

    setError(null);
    setInput("");
    const history = messages;
    setMessages((prev) => [...prev, { role: "user", text: message }, { role: "model", text: "" }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, message, history }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "The assistant is unavailable right now.");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Streaming is not supported in this browser.");
      const decoder = new TextDecoder();

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, text: last.text + chunk };
          return next;
        });
      }
    } catch (e) {
      // Drop the empty placeholder bubble on failure.
      setMessages((prev) =>
        prev[prev.length - 1]?.role === "model" && prev[prev.length - 1].text === ""
          ? prev.slice(0, -1)
          : prev
      );
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col rounded-2xl border border-line bg-surface">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-2xl bg-accent-soft p-3">
              <Bot className="h-6 w-6 text-accent" aria-hidden />
            </div>
            <p className="max-w-sm text-sm text-muted">
              {indexedCount === 0 ? (
                <>
                  No products are indexed yet. Add products, or rebuild the index
                  from{" "}
                  <Link href="/dashboard/settings" className="text-accent hover:underline">
                    Settings
                  </Link>
                  .
                </>
              ) : (
                "Ask about products, stock, prices, or recommendations. Try one of these:"
              )}
            </p>
            {indexedCount > 0 && (
              <div className="flex max-w-md flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-line bg-background px-3.5 py-1.5 text-sm text-muted hover:border-accent hover:text-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "model" && (
              <div className="mt-0.5 h-7 w-7 shrink-0 rounded-lg bg-accent-soft p-1.5">
                <Bot className="h-4 w-4 text-accent" aria-hidden />
              </div>
            )}
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-accent text-white"
                  : "bg-surface-muted"
              }`}
            >
              {msg.text ||
                (streaming && i === messages.length - 1 ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted" aria-hidden />
                ) : (
                  msg.text
                ))}
            </div>
            {msg.role === "user" && (
              <div className="mt-0.5 h-7 w-7 shrink-0 rounded-lg bg-surface-muted p-1.5">
                <User className="h-4 w-4 text-muted" aria-hidden />
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="border-t border-line bg-red-500/10 px-4 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-line p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your catalog…"
          className="flex-1 rounded-lg border border-line bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          aria-label="Send message"
          className="rounded-lg bg-accent p-2.5 text-white hover:bg-accent-strong disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
