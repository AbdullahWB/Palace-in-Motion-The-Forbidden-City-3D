import type { GuideMode } from "@/types/ai-guide";

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

type DeepSeekResponse = {
  choices?: Array<{
    message?: {
      content?:
        | string
        | Array<{
            type?: string;
            text?: string;
          }>;
    };
  }>;
};

type DeepSeekMessageContent =
  | string
  | Array<{
      type?: string;
      text?: string;
    }>
  | undefined;

function getTemperature(mode: GuideMode) {
  switch (mode) {
    case "fun":
      return 0.55;
    case "short":
      return 0.25;
    default:
      return 0.35;
  }
}

function extractTextContent(content: DeepSeekMessageContent) {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .join("")
      .trim();
  }

  return "";
}

export function isDeepSeekConfigured() {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

export async function requestDeepSeekAnswer({
  messages,
  mode,
}: {
  messages: ChatMessage[];
  mode: GuideMode;
}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return null;
  }

  const baseUrl = (process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com").replace(
    /\/$/,
    ""
  );
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: false,
      temperature: getTemperature(mode),
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek request failed with status ${response.status}`);
  }

  const data = (await response.json()) as DeepSeekResponse;
  const answer = extractTextContent(data.choices?.[0]?.message?.content);

  return answer || null;
}
