import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are PlacementAI Coach, a friendly and practical placement-preparation and skill-development assistant for engineering students.
Help with DSA, CS fundamentals (DBMS, OS, CN, OOP), aptitude, resumes, projects, GitHub profiles, HR and technical interviews, and weekly study plans.
Give concrete, actionable answers. Keep replies short (under 150 words), use plain text with simple dashes for lists, and never use markdown headings or tables.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { error: "AI assistant is not configured." },
            { status: 500 },
          );
        }

        let messages: ChatMessage[] = [];
        try {
          const body = (await request.json()) as { messages?: unknown };
          if (Array.isArray(body.messages)) {
            messages = body.messages
              .filter(
                (m): m is ChatMessage =>
                  !!m &&
                  typeof m === "object" &&
                  typeof (m as ChatMessage).content === "string" &&
                  ((m as ChatMessage).role === "user" ||
                    (m as ChatMessage).role === "assistant"),
              )
              .slice(-16)
              .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
          }
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }

        if (messages.length === 0) {
          return Response.json({ error: "No message provided." }, { status: 400 });
        }

        const upstream = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": apiKey,
              "X-Lovable-AIG-SDK": "fetch",
            },
            body: JSON.stringify({
              model: "google/gemini-3.7-flash",
              messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
            }),
          },
        );

        if (!upstream.ok) {
          const detail = await upstream.text();
          let message = "The AI assistant could not answer right now.";
          if (upstream.status === 429)
            message = "Too many requests — please wait a moment and try again.";
          if (upstream.status === 402)
            message = "AI credits are exhausted for this workspace.";
          if (upstream.status === 403)
            message = "AI access is blocked by workspace settings.";
          console.error("AI gateway error", upstream.status, detail);
          return Response.json({ error: message }, { status: upstream.status });
        }

        const data = (await upstream.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const reply = data.choices?.[0]?.message?.content?.trim();
        return Response.json({
          reply: reply || "I could not generate an answer. Please rephrase.",
        });
      },
    },
  },
});
