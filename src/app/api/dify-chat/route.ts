import { NextRequest } from "next/server";

export const maxDuration = 60; // Set max duration to 60 seconds

export async function POST(req: NextRequest) {
  try {
    const { query, user } = await req.json();
    const apiKey = process.env.DIFY_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "DIFY_API_KEY is not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const baseUrl = (process.env.DIFY_BASE_URL || "https://api.dify.ai").replace(/\/$/, "");
    const endpoint = `${baseUrl}/v1/chat-messages`;

    const difyRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: {},
        query,
        user,
        response_mode: "streaming",
      }),
    });

    if (!difyRes.body) {
      const errorText = await difyRes.text();
      return new Response(errorText, {
        status: difyRes.status,
        headers: { "Content-Type": difyRes.headers.get("content-type") || "text/plain" },
      });
    }

    // Forward Dify SSE stream to the client unchanged
    const stream = new ReadableStream({
      async start(controller) {
        const reader = difyRes.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) controller.enqueue(value);
          }
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
