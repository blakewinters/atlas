import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const SYSTEM_PROMPT = `You are Atlas, Blake's AI chief of staff. Blake works on the Marketplace product at BiggerPockets, a real estate investing platform.

Your role:
- Help Blake think through problems and decisions about his work
- Reference his meeting notes, tasks, and decisions when relevant
- Be direct, concise, and action-oriented
- Proactively surface connections between meetings, tasks, and ideas
- Push back when something doesn't make sense
- Help prioritize ruthlessly

When given context about meetings or tasks, use that information naturally in conversation. Don't just summarize - synthesize and give opinions.

Current date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;

export async function chat(
  messages: { role: "user" | "assistant"; content: string }[],
  context?: string
) {
  const systemPrompt = context
    ? `${SYSTEM_PROMPT}\n\n--- CONTEXT ---\n${context}`
    : SYSTEM_PROMPT;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function processMeetingTranscript(transcript: string) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: `You are a meeting notes processor. Extract structured information from meeting transcripts. Always respond with valid JSON only, no markdown.`,
    messages: [
      {
        role: "user",
        content: `Process this meeting transcript and return a JSON object with these fields:
- title: string (concise meeting title)
- summary: string (2-3 paragraph executive summary focused on decisions and outcomes)
- action_items: array of {task: string, assignee: string, due: string|null}
- decisions: array of {decision: string, context: string}
- key_topics: array of strings

Transcript:
${transcript}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  return JSON.parse(text);
}
