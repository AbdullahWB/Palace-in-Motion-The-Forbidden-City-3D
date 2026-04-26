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

const DEFAULT_TIMEOUT_MS = 12000;
const RETRY_DELAY_MS = 450;

function getTemperature(mode: GuideMode) {
  switch (mode) {
    case "fun":
      return 0.55;
    case "child":
    case "tourist":
      return 0.35;
    case "quiz":
      return 0.2;
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

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isTransientStatus(status: number) {
  return status === 429 || status >= 500;
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
  const maxAttempts = 2;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          stream: false,
          temperature: getTemperature(mode),
          max_tokens: 240,
          messages,
        }),
      });

      if (!response.ok) {
        if (attempt === 0 && isTransientStatus(response.status)) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }

        throw new Error(`DeepSeek request failed with status ${response.status}`);
      }

      const data = (await response.json()) as DeepSeekResponse;
      const answer = extractTextContent(data.choices?.[0]?.message?.content);

      return answer || null;
    } catch (error) {
      if (attempt === 0) {
        const isAbort =
          error instanceof DOMException && error.name === "AbortError";

        if (isAbort || error instanceof TypeError) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}
