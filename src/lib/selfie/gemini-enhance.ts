import {
  GoogleGenAI,
  Modality,
  createPartFromBase64,
  createPartFromText,
  createUserContent,
} from "@google/genai";
import type {
  AiEnhancedScene,
  SelfieEnhanceRequest,
} from "@/types/selfie";

const DEFAULT_GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
const MAX_SINGLE_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 20 * 1024 * 1024;

type ParsedDataUrl = {
  dataUrl: string;
  mimeType: string;
  base64Data: string;
  bytes: number;
};

let geminiClient: GoogleGenAI | null = null;

export function isGeminiEnhanceConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getGeminiImageModel() {
  return process.env.GEMINI_IMAGE_MODEL?.trim() || DEFAULT_GEMINI_IMAGE_MODEL;
}

function getGeminiClient() {
  if (geminiClient) {
    return geminiClient;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  geminiClient = new GoogleGenAI({ apiKey });
  return geminiClient;
}

function getBase64ByteSize(base64Data: string) {
  const normalized = base64Data.replace(/\s+/g, "");
  const padding = normalized.endsWith("==")
    ? 2
    : normalized.endsWith("=")
      ? 1
      : 0;

  return Math.max(0, Math.floor((normalized.length * 3) / 4) - padding);
}

function parseImageDataUrl(value: string, fieldName: string): ParsedDataUrl {
  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    throw new Error(`${fieldName} must be a valid base64 image data URL.`);
  }

  const [, mimeType, base64Data] = match;
  const bytes = getBase64ByteSize(base64Data);

  if (bytes <= 0) {
    throw new Error(`${fieldName} is empty.`);
  }

  if (bytes > MAX_SINGLE_IMAGE_BYTES) {
    throw new Error(`${fieldName} exceeds the 8MB limit.`);
  }

  return {
    dataUrl: value,
    mimeType,
    base64Data,
    bytes,
  };
}

function buildEnhancePrompt({
  placeTitle,
  focusLabel,
  language,
}: Pick<SelfieEnhanceRequest, "placeTitle" | "focusLabel" | "language">) {
  const identityInstruction =
    "Preserve the exact person identity, facial features, hair, skin tone, body proportions, and clothing from the subject reference image.";
  const realismInstruction =
    "Blend the person naturally into the base scene with realistic perspective, edge softness, lighting, shadow contact, depth, and color temperature.";
  const restraintInstruction =
    "Do not add extra people, text, frames, logos, objects, duplicated limbs, accessories, or stylized effects. Keep the architecture recognizable and unchanged.";
  const placementInstruction =
    "Use the base scene image as the layout reference for subject position and scale. Use the background reference image only to reinforce scene details and atmosphere.";

  if (language === "zh") {
    return [
      "请输出一张逼真的人物与场景融合图，仅返回图像。",
      `地点：${placeTitle || "故宫场景"}`,
      `焦点：${focusLabel || "当前视角"}`,
      "基于提供的底图场景进行编辑。",
      identityInstruction,
      realismInstruction,
      placementInstruction,
      restraintInstruction,
    ].join("\n");
  }

  return [
    "Return one realistic blended image only.",
    `Place: ${placeTitle || "Palace scene"}`,
    `Focus: ${focusLabel || "Current view"}`,
    "Edit the provided base scene image.",
    identityInstruction,
    realismInstruction,
    placementInstruction,
    restraintInstruction,
  ].join("\n");
}

function extractGeneratedImage(
  response: Awaited<ReturnType<GoogleGenAI["models"]["generateContent"]>>
) {
  const imagePart = response.candidates?.[0]?.content?.parts?.find(
    (part) => part.inlineData?.data && part.inlineData.mimeType?.startsWith("image/")
  );

  if (imagePart?.inlineData?.data) {
    return {
      mimeType: imagePart.inlineData.mimeType || "image/png",
      base64Data: imagePart.inlineData.data,
    };
  }

  if (response.data) {
    return {
      mimeType: "image/png",
      base64Data: response.data,
    };
  }

  return null;
}

export async function enhanceSelfieScene(
  input: SelfieEnhanceRequest
): Promise<AiEnhancedScene> {
  const baseScene = parseImageDataUrl(input.baseSceneDataUrl, "baseSceneDataUrl");
  const subjectReference = parseImageDataUrl(
    input.subjectReferenceDataUrl,
    "subjectReferenceDataUrl"
  );
  const backgroundReference = parseImageDataUrl(
    input.backgroundReferenceDataUrl,
    "backgroundReferenceDataUrl"
  );

  if (
    baseScene.bytes + subjectReference.bytes + backgroundReference.bytes >
    MAX_TOTAL_IMAGE_BYTES
  ) {
    throw new Error("Combined image payload exceeds the 20MB limit.");
  }

  const prompt = buildEnhancePrompt(input);
  const ai = getGeminiClient();
  const model = getGeminiImageModel();

  const response = await ai.models.generateContent({
    model,
    contents: createUserContent([
      createPartFromText(prompt),
      createPartFromBase64(baseScene.base64Data, baseScene.mimeType),
      createPartFromBase64(subjectReference.base64Data, subjectReference.mimeType),
      createPartFromBase64(
        backgroundReference.base64Data,
        backgroundReference.mimeType
      ),
    ]),
    config: {
      responseModalities: [Modality.IMAGE],
      temperature: 0.35,
    },
  });

  const generatedImage = extractGeneratedImage(response);

  if (!generatedImage) {
    throw new Error("Gemini did not return an image.");
  }

  return {
    dataUrl: `data:${generatedImage.mimeType};base64,${generatedImage.base64Data}`,
    provider: "gemini",
    model,
  };
}
