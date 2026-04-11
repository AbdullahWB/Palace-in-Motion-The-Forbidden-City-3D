import { DEFAULT_APP_LANGUAGE, isAppLanguage } from "@/lib/site-preferences";
import {
  enhanceSelfieScene,
  getGeminiImageModel,
  isGeminiEnhanceConfigured,
} from "@/lib/selfie/gemini-enhance";
import type {
  SelfieEnhanceRequest,
  SelfieEnhanceResponse,
} from "@/types/selfie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getRouteCopy(language: "zh" | "en") {
  if (language === "zh") {
    return {
      invalidJson: "无效的 JSON 请求体。",
      missingField: (field: string) => `${field} 为必填项。`,
      invalidField: (field: string) => `${field} 必须是非空字符串。`,
      notConfigured: "Gemini 图像增强尚未配置。",
      requestFailed: "AI 场景融合失败，请稍后重试。",
    };
  }

  return {
    invalidJson: "Invalid JSON body.",
    missingField: (field: string) => `${field} is required.`,
    invalidField: (field: string) => `${field} must be a non-empty string.`,
    notConfigured: "Gemini image enhancement is not configured.",
    requestFailed: "AI scene blending failed. Please try again.",
  };
}

function readRequiredString(
  body: Record<string, unknown>,
  fieldName: keyof SelfieEnhanceRequest,
  copy: ReturnType<typeof getRouteCopy>
) {
  const value = body[fieldName];

  if (value === undefined || value === null) {
    throw new Error(copy.missingField(fieldName));
  }

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(copy.invalidField(fieldName));
  }

  return value.trim();
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const language = isAppLanguage(body.language)
    ? body.language
    : DEFAULT_APP_LANGUAGE;
  const copy = getRouteCopy(language);

  if (!isGeminiEnhanceConfigured()) {
    return Response.json({ error: copy.notConfigured }, { status: 503 });
  }

  let enhanceRequest: SelfieEnhanceRequest;

  try {
    enhanceRequest = {
      baseSceneDataUrl: readRequiredString(body, "baseSceneDataUrl", copy),
      subjectReferenceDataUrl: readRequiredString(
        body,
        "subjectReferenceDataUrl",
        copy
      ),
      backgroundReferenceDataUrl: readRequiredString(
        body,
        "backgroundReferenceDataUrl",
        copy
      ),
      placeTitle: readRequiredString(body, "placeTitle", copy),
      focusLabel: readRequiredString(body, "focusLabel", copy),
      language,
    };
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : copy.requestFailed },
      { status: 400 }
    );
  }

  try {
    const result = await enhanceSelfieScene(enhanceRequest);
    const response: SelfieEnhanceResponse = {
      enhancedSceneDataUrl: result.dataUrl,
      provider: result.provider,
      model: result.model,
    };

    return Response.json(response);
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : copy.requestFailed;

    return Response.json(
      {
        error: message,
        provider: "gemini",
        model: getGeminiImageModel(),
      },
      { status: 500 }
    );
  }
}
