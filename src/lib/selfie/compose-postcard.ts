import type { PostcardFrame } from "@/types/content";

export type PostcardCompositionResult = {
  dataUrl: string;
  downloadUrl: string;
  width: number;
  height: number;
};

export type PortraitSceneCompositionResult = {
  dataUrl: string;
  width: number;
  height: number;
};

export type SubjectTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export type ComposePostcardInput = {
  photoSrc: string;
  photoIsCutout?: boolean;
  backdropSrc: string;
  backdropLabel: string;
  subjectTransform?: SubjectTransform;
  frame: PostcardFrame;
  title: string;
  caption: string;
  focusLabel: string;
  journeyLabel?: string | null;
  journeySealLabel?: string | null;
  sceneOverrideSrc?: string | null;
};

type Palette = {
  paper: string;
  frame: string;
  panel: string;
  panelSoft: string;
  line: string;
  text: string;
  textSoft: string;
  ribbon: string;
  ribbonText: string;
  photoGlow: string;
};

const POSTCARD_WIDTH = 1600;
const POSTCARD_HEIGHT = 1000;
const CARD_WIDTH = 620;
const CARD_HEIGHT = 760;
const CARD_IMAGE_INSET = 28;
const CARD_TEXT_FOOTER_HEIGHT = 110;
const PORTRAIT_SCENE_WIDTH = CARD_WIDTH - CARD_IMAGE_INSET * 2;
const PORTRAIT_SCENE_HEIGHT = CARD_HEIGHT - CARD_IMAGE_INSET * 2 - CARD_TEXT_FOOTER_HEIGHT;

const paletteByAccentToken: Record<PostcardFrame["accentToken"], Palette> = {
  "imperial-red": {
    paper: "#f6eadc",
    frame: "#7f1f2c",
    panel: "#8a2230",
    panelSoft: "#a94654",
    line: "#d0af7d",
    text: "#fff7ef",
    textSoft: "rgba(255, 244, 234, 0.78)",
    ribbon: "#5f121c",
    ribbonText: "#fff6ef",
    photoGlow: "rgba(138, 34, 48, 0.24)",
  },
  "sunlit-bronze": {
    paper: "#f4e7d2",
    frame: "#a57634",
    panel: "#b78a4c",
    panelSoft: "#c79b60",
    line: "#efe0bf",
    text: "#2a1d12",
    textSoft: "rgba(42, 29, 18, 0.74)",
    ribbon: "#7d5929",
    ribbonText: "#fff8ee",
    photoGlow: "rgba(183, 138, 76, 0.26)",
  },
  "jade-ink": {
    paper: "#e8e7df",
    frame: "#243c34",
    panel: "#29453c",
    panelSoft: "#3d6257",
    line: "#d5c69f",
    text: "#f7f4ec",
    textSoft: "rgba(247, 244, 236, 0.78)",
    ribbon: "#162922",
    ribbonText: "#f7f4ec",
    photoGlow: "rgba(41, 69, 60, 0.28)",
  },
};

function roundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const limitedRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + limitedRadius, y);
  context.lineTo(x + width - limitedRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + limitedRadius);
  context.lineTo(x + width, y + height - limitedRadius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - limitedRadius,
    y + height
  );
  context.lineTo(x + limitedRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - limitedRadius);
  context.lineTo(x, y + limitedRadius);
  context.quadraticCurveTo(x, y, x + limitedRadius, y);
  context.closePath();
}

function drawWrappedText({
  context,
  text,
  x,
  y,
  maxWidth,
  lineHeight,
  maxLines,
}: {
  context: CanvasRenderingContext2D;
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  lineHeight: number;
  maxLines: number;
}) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const trialLine = currentLine ? `${currentLine} ${word}` : word;

    if (context.measureText(trialLine).width <= maxWidth) {
      currentLine = trialLine;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  const renderedLines = lines.slice(0, maxLines);
  const lastLineIndex = renderedLines.length - 1;

  if (lines.length > maxLines && lastLineIndex >= 0) {
    let lastLine = renderedLines[lastLineIndex];

    while (
      lastLine.length > 1 &&
      context.measureText(`${lastLine}...`).width > maxWidth
    ) {
      lastLine = lastLine.slice(0, -1);
    }

    renderedLines[lastLineIndex] = `${lastLine.trimEnd()}...`;
  }

  renderedLines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });

  return y + renderedLines.length * lineHeight;
}

function drawPhotoCover({
  context,
  image,
  x,
  y,
  width,
  height,
}: {
  context: CanvasRenderingContext2D;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const sourceAspect = image.width / image.height;
  const targetAspect = width / height;

  let sx = 0;
  let sy = 0;
  let sWidth = image.width;
  let sHeight = image.height;

  if (sourceAspect > targetAspect) {
    sWidth = image.height * targetAspect;
    sx = (image.width - sWidth) / 2;
  } else {
    sHeight = image.width / targetAspect;
    sy = (image.height - sHeight) / 2;
  }

  context.drawImage(image, sx, sy, sWidth, sHeight, x, y, width, height);
}

function drawPhotoContain({
  context,
  image,
  x,
  y,
  width,
  height,
}: {
  context: CanvasRenderingContext2D;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const sourceAspect = image.width / image.height;
  const targetAspect = width / height;

  let drawWidth = width;
  let drawHeight = height;
  let drawX = x;
  let drawY = y;

  if (sourceAspect > targetAspect) {
    drawHeight = width / sourceAspect;
    drawY = y + (height - drawHeight) / 2;
  } else {
    drawWidth = height * sourceAspect;
    drawX = x + (width - drawWidth) / 2;
  }

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function getOpaqueBounds(
  image: HTMLImageElement,
  alphaThreshold = 8
): { sx: number; sy: number; sw: number; sh: number } | null {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return null;
  }

  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  const width = imageData.width;
  const height = imageData.height;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];

      if (alpha <= alphaThreshold) {
        continue;
      }

      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
      if (x > maxX) {
        maxX = x;
      }
      if (y > maxY) {
        maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  const padding = 10;
  const sx = Math.max(0, minX - padding);
  const sy = Math.max(0, minY - padding);
  const sw = Math.min(width - sx, maxX - minX + 1 + padding * 2);
  const sh = Math.min(height - sy, maxY - minY + 1 + padding * 2);

  return { sx, sy, sw, sh };
}

function drawCutoutForeground({
  context,
  image,
  x,
  y,
  width,
  height,
  subjectTransform,
}: {
  context: CanvasRenderingContext2D;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  subjectTransform: SubjectTransform;
}) {
  const bounds = getOpaqueBounds(image);

  if (!bounds) {
    drawPhotoContain({ context, image, x, y, width, height });
    return;
  }

  const availableWidth = width * 0.86;
  const availableHeight = height * 0.9;
  const scaleBase = Math.min(availableWidth / bounds.sw, availableHeight / bounds.sh);
  const scale = scaleBase * subjectTransform.scale;

  const drawWidth = bounds.sw * scale;
  const drawHeight = bounds.sh * scale;
  const offsetX = (subjectTransform.offsetX / 100) * width;
  const offsetY = (subjectTransform.offsetY / 100) * height;
  const desiredX = x + (width - drawWidth) / 2 + offsetX;
  const desiredY = y + height - drawHeight - 14 + offsetY;
  const drawX = Math.min(Math.max(desiredX, x - drawWidth * 0.2), x + width - drawWidth * 0.8);
  const drawY = Math.min(Math.max(desiredY, y - drawHeight * 0.2), y + height - drawHeight * 0.5);

  context.drawImage(
    image,
    bounds.sx,
    bounds.sy,
    bounds.sw,
    bounds.sh,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
}

async function loadImage(source: string) {
  const image = new Image();

  image.decoding = "async";
  if (source.startsWith("http://") || source.startsWith("https://")) {
    image.crossOrigin = "anonymous";
  }

  const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The selected image could not be loaded."));
  });

  image.src = source;
  return loadPromise;
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("The postcard image could not be generated."));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

function renderPortraitScene({
  context,
  sourceImage,
  backdropImage,
  photoIsCutout,
  subjectTransform,
  x,
  y,
  width,
  height,
}: {
  context: CanvasRenderingContext2D;
  sourceImage: HTMLImageElement;
  backdropImage: HTMLImageElement | null;
  photoIsCutout: boolean;
  subjectTransform: SubjectTransform;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  if (photoIsCutout) {
    context.save();
    roundedRectPath(context, x, y, width, height, 24);
    context.clip();

    if (backdropImage) {
      drawPhotoCover({
        context,
        image: backdropImage,
        x,
        y,
        width,
        height,
      });
    } else {
      const fallbackSurface = context.createLinearGradient(x, y, x, y + height);
      fallbackSurface.addColorStop(0, "rgba(255, 255, 255, 0.22)");
      fallbackSurface.addColorStop(1, "rgba(255, 255, 255, 0.12)");
      context.fillStyle = fallbackSurface;
      context.fillRect(x, y, width, height);
    }

    const sceneGrade = context.createLinearGradient(x, y, x, y + height);
    sceneGrade.addColorStop(0, "rgba(16, 12, 10, 0.12)");
    sceneGrade.addColorStop(1, "rgba(16, 12, 10, 0.36)");
    context.fillStyle = sceneGrade;
    context.fillRect(x, y, width, height);
    context.restore();

    const shadowCenterX = x + width / 2;
    const shadowCenterY = y + height - 42;
    const shadowRadiusX = width * 0.35;
    const shadowRadiusY = 36;

    context.save();
    context.beginPath();
    context.ellipse(
      shadowCenterX,
      shadowCenterY,
      shadowRadiusX,
      shadowRadiusY,
      0,
      0,
      Math.PI * 2
    );
    const floorShadow = context.createRadialGradient(
      shadowCenterX,
      shadowCenterY,
      10,
      shadowCenterX,
      shadowCenterY,
      shadowRadiusX
    );
    floorShadow.addColorStop(0, "rgba(0, 0, 0, 0.34)");
    floorShadow.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = floorShadow;
    context.fill();
    context.restore();

    context.save();
    context.shadowColor = "rgba(0, 0, 0, 0.3)";
    context.shadowBlur = 14;
    context.shadowOffsetY = 6;
    drawCutoutForeground({
      context,
      image: sourceImage,
      x: x + 20,
      y: y + 14,
      width: width - 40,
      height: height - 16,
      subjectTransform,
    });
    context.restore();
    return;
  }

  context.save();
  roundedRectPath(context, x, y, width, height, 24);
  context.clip();
  drawPhotoCover({
    context,
    image: sourceImage,
    x,
    y,
    width,
    height,
  });
  const selfieGradient = context.createLinearGradient(x, y, x, y + height);
  selfieGradient.addColorStop(0, "rgba(12, 8, 6, 0.08)");
  selfieGradient.addColorStop(0.55, "rgba(12, 8, 6, 0)");
  selfieGradient.addColorStop(1, "rgba(138, 34, 48, 0.24)");
  context.fillStyle = selfieGradient;
  context.fillRect(x, y, width, height);
  context.restore();
}

export async function composePortraitScene({
  photoSrc,
  photoIsCutout = false,
  backdropSrc,
  subjectTransform = { scale: 1, offsetX: 0, offsetY: 0 },
}: Pick<
  ComposePostcardInput,
  "photoSrc" | "photoIsCutout" | "backdropSrc" | "subjectTransform"
>): Promise<PortraitSceneCompositionResult> {
  const [sourceImage, backdropImage] = await Promise.all([
    loadImage(photoSrc),
    loadImage(backdropSrc).catch(() => null),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = PORTRAIT_SCENE_WIDTH;
  canvas.height = PORTRAIT_SCENE_HEIGHT;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not available in this browser.");
  }

  renderPortraitScene({
    context,
    sourceImage,
    backdropImage,
    photoIsCutout,
    subjectTransform,
    x: 0,
    y: 0,
    width: PORTRAIT_SCENE_WIDTH,
    height: PORTRAIT_SCENE_HEIGHT,
  });

  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: canvas.width,
    height: canvas.height,
  };
}

export async function composePostcard({
  photoSrc,
  photoIsCutout = false,
  backdropSrc,
  backdropLabel,
  subjectTransform = { scale: 1, offsetX: 0, offsetY: 0 },
  frame,
  title,
  caption,
  focusLabel,
  journeyLabel = null,
  journeySealLabel = null,
  sceneOverrideSrc = null,
}: ComposePostcardInput): Promise<PostcardCompositionResult> {
  const palette = paletteByAccentToken[frame.accentToken];
  const [sourceImage, backdropImage, sceneOverrideImage] = await Promise.all([
    sceneOverrideSrc ? Promise.resolve(null) : loadImage(photoSrc),
    loadImage(backdropSrc).catch(() => null),
    sceneOverrideSrc ? loadImage(sceneOverrideSrc).catch(() => null) : Promise.resolve(null),
  ]);
  const canvas = document.createElement("canvas");

  canvas.width = POSTCARD_WIDTH;
  canvas.height = POSTCARD_HEIGHT;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not available in this browser.");
  }

  const outerPadding = 30;
  const cardX = 72;
  const cardY = 160;
  const cardWidth = CARD_WIDTH;
  const cardHeight = CARD_HEIGHT;
  const cardImageInset = CARD_IMAGE_INSET;
  const cardImageWidth = cardWidth - cardImageInset * 2;
  const cardImageHeight = cardHeight - cardImageInset * 2 - CARD_TEXT_FOOTER_HEIGHT;
  const detailsX = cardX + cardWidth + 58;
  const detailsY = 160;
  const detailsWidth = POSTCARD_WIDTH - detailsX - 72;
  const detailsHeight = 760;

  if (backdropImage) {
    drawPhotoCover({
      context,
      image: backdropImage,
      x: 0,
      y: 0,
      width: POSTCARD_WIDTH,
      height: POSTCARD_HEIGHT,
    });
  } else {
    const fallbackGradient = context.createLinearGradient(0, 0, 0, POSTCARD_HEIGHT);
    fallbackGradient.addColorStop(0, "#3b5a7d");
    fallbackGradient.addColorStop(1, "#7d5a3b");
    context.fillStyle = fallbackGradient;
    context.fillRect(0, 0, POSTCARD_WIDTH, POSTCARD_HEIGHT);
  }

  const moodGradient = context.createLinearGradient(0, 0, 0, POSTCARD_HEIGHT);
  moodGradient.addColorStop(0, "rgba(8, 10, 16, 0.28)");
  moodGradient.addColorStop(0.45, "rgba(8, 10, 16, 0.1)");
  moodGradient.addColorStop(1, "rgba(8, 10, 16, 0.55)");
  context.fillStyle = moodGradient;
  context.fillRect(0, 0, POSTCARD_WIDTH, POSTCARD_HEIGHT);

  context.fillStyle = "rgba(245, 236, 222, 0.08)";
  roundedRectPath(
    context,
    outerPadding,
    outerPadding,
    POSTCARD_WIDTH - outerPadding * 2,
    POSTCARD_HEIGHT - outerPadding * 2,
    34
  );
  context.fill();

  context.strokeStyle = "rgba(239, 224, 191, 0.64)";
  context.lineWidth = 3;
  roundedRectPath(
    context,
    outerPadding,
    outerPadding,
    POSTCARD_WIDTH - outerPadding * 2,
    POSTCARD_HEIGHT - outerPadding * 2,
    34
  );
  context.stroke();

  context.fillStyle = "rgba(18, 16, 14, 0.52)";
  roundedRectPath(context, 52, 52, 520, 78, 38);
  context.fill();
  context.fillStyle = "#f4e0c1";
  context.font = "600 28px Inter, sans-serif";
  context.textBaseline = "middle";
  context.fillText(backdropLabel, 88, 91);

  const cardImageX = cardX + cardImageInset;
  const cardImageY = cardY + cardImageInset;

  context.save();
  context.shadowColor = "rgba(0, 0, 0, 0.44)";
  context.shadowBlur = 28;
  context.shadowOffsetY = 14;
  context.fillStyle = palette.paper;
  roundedRectPath(context, cardX, cardY, cardWidth, cardHeight, 34);
  context.fill();
  context.restore();

  context.lineWidth = 3;
  context.strokeStyle = palette.frame;
  roundedRectPath(context, cardX, cardY, cardWidth, cardHeight, 34);
  context.stroke();

  context.save();
  roundedRectPath(
    context,
    cardImageX,
    cardImageY,
    cardImageWidth,
    cardImageHeight,
    24
  );
  context.clip();

  if (sceneOverrideImage) {
    drawPhotoCover({
      context,
      image: sceneOverrideImage,
      x: cardImageX,
      y: cardImageY,
      width: cardImageWidth,
      height: cardImageHeight,
    });
  } else if (sourceImage) {
    renderPortraitScene({
      context,
      sourceImage,
      backdropImage,
      photoIsCutout,
      subjectTransform,
      x: cardImageX,
      y: cardImageY,
      width: cardImageWidth,
      height: cardImageHeight,
    });
  }

  context.restore();

  context.lineWidth = 2;
  context.strokeStyle = "rgba(255, 255, 255, 0.72)";
  roundedRectPath(
    context,
    cardImageX,
    cardImageY,
    cardImageWidth,
    cardImageHeight,
    24
  );
  context.stroke();

  context.fillStyle = "rgba(39, 29, 21, 0.9)";
  context.font = "500 26px Inter, sans-serif";
  context.textBaseline = "alphabetic";
  context.fillText(
    photoIsCutout ? "Foreground cutout" : "Captured memory",
    cardImageX,
    cardY + cardHeight - 56
  );

  const detailsGradient = context.createLinearGradient(
    detailsX,
    detailsY,
    detailsX,
    detailsY + detailsHeight
  );
  detailsGradient.addColorStop(0, "rgba(20, 16, 13, 0.62)");
  detailsGradient.addColorStop(1, "rgba(20, 16, 13, 0.44)");
  context.fillStyle = detailsGradient;
  roundedRectPath(context, detailsX, detailsY, detailsWidth, detailsHeight, 34);
  context.fill();

  context.strokeStyle = "rgba(239, 224, 191, 0.42)";
  context.lineWidth = 2;
  roundedRectPath(
    context,
    detailsX + 12,
    detailsY + 12,
    detailsWidth - 24,
    detailsHeight - 24,
    28
  );
  context.stroke();

  const ribbonX = detailsX + 44;
  const ribbonY = detailsY + 42;
  const ribbonWidth = Math.min(260 + frame.ribbonLabel.length * 5, detailsWidth - 88);
  const ribbonHeight = 48;

  context.fillStyle = palette.ribbon;
  roundedRectPath(context, ribbonX, ribbonY, ribbonWidth, ribbonHeight, 22);
  context.fill();

  context.fillStyle = palette.ribbonText;
  context.font = "600 22px Inter, sans-serif";
  context.textBaseline = "middle";
  context.fillText(frame.ribbonLabel, ribbonX + 24, ribbonY + ribbonHeight / 2);

  const headingX = detailsX + 44;
  let cursorY = ribbonY + 104;

  context.fillStyle = "rgba(255, 245, 228, 0.86)";
  context.font = "600 20px Inter, sans-serif";
  context.textBaseline = "alphabetic";
  context.fillText("Palace in Motion souvenir", headingX, cursorY);

  if (journeyLabel) {
    const pillText = journeyLabel.toUpperCase();
    const pillWidth = Math.min(
      detailsWidth - 88,
      Math.max(220, context.measureText(pillText).width + 42)
    );
    const pillHeight = 38;
    const pillX = detailsX + detailsWidth - 44 - pillWidth;
    const pillY = ribbonY + 6;

    context.fillStyle = "rgba(255, 245, 228, 0.12)";
    roundedRectPath(context, pillX, pillY, pillWidth, pillHeight, 18);
    context.fill();
    context.strokeStyle = "rgba(255, 245, 228, 0.28)";
    context.lineWidth = 1.5;
    roundedRectPath(context, pillX, pillY, pillWidth, pillHeight, 18);
    context.stroke();

    context.fillStyle = "#fff7ee";
    context.font = "600 16px Inter, sans-serif";
    context.textBaseline = "middle";
    context.fillText(pillText, pillX + 20, pillY + pillHeight / 2);
    context.textBaseline = "alphabetic";
  }

  cursorY += 46;
  context.fillStyle = "#fff7ee";
  context.font = "600 66px 'Cormorant Garamond', serif";
  cursorY = drawWrappedText({
    context,
    text: title.trim() || frame.defaultTitle || frame.title,
    x: headingX,
    y: cursorY,
    maxWidth: detailsWidth - 88,
    lineHeight: 68,
    maxLines: 3,
  });

  cursorY += 20;
  context.strokeStyle = palette.line;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(headingX, cursorY);
  context.lineTo(detailsX + detailsWidth - 44, cursorY);
  context.stroke();

  cursorY += 50;
  context.fillStyle = "rgba(255, 245, 228, 0.84)";
  context.font = "500 31px Inter, sans-serif";
  cursorY = drawWrappedText({
    context,
    text: caption.trim(),
    x: headingX,
    y: cursorY,
    maxWidth: detailsWidth - 88,
    lineHeight: 44,
    maxLines: 6,
  });

  const footerY = detailsY + detailsHeight - 148;
  context.fillStyle = palette.line;
  context.font = "600 18px Inter, sans-serif";
  context.fillText("HERITAGE FOCUS", headingX, footerY);

  context.fillStyle = "#fff7ee";
  context.font = "600 36px 'Cormorant Garamond', serif";
  context.fillText(focusLabel, headingX, footerY + 42);

  context.fillStyle = "rgba(255, 245, 228, 0.8)";
  context.font = "500 18px Inter, sans-serif";
  context.fillText(`Backdrop: ${backdropLabel}`, headingX, footerY + 86);

  if (journeySealLabel) {
    const sealRadius = 56;
    const sealCenterX = detailsX + detailsWidth - 74;
    const sealCenterY = detailsY + detailsHeight - 92;

    context.save();
    const sealGradient = context.createRadialGradient(
      sealCenterX - 12,
      sealCenterY - 14,
      8,
      sealCenterX,
      sealCenterY,
      sealRadius
    );
    sealGradient.addColorStop(0, "rgba(255, 248, 232, 0.92)");
    sealGradient.addColorStop(1, palette.panel);
    context.fillStyle = sealGradient;
    context.beginPath();
    context.arc(sealCenterX, sealCenterY, sealRadius, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = palette.line;
    context.lineWidth = 3;
    context.stroke();

    context.fillStyle = palette.ribbonText;
    context.font = "600 12px Inter, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("ROUTE SEAL", sealCenterX, sealCenterY - 16);
    context.font = "600 11px Inter, sans-serif";
    drawWrappedText({
      context,
      text: journeySealLabel,
      x: sealCenterX,
      y: sealCenterY + 4,
      maxWidth: 76,
      lineHeight: 14,
      maxLines: 3,
    });
    context.restore();
  }

  const blob = await canvasToBlob(canvas);

  return {
    dataUrl: canvas.toDataURL("image/png"),
    downloadUrl: URL.createObjectURL(blob),
    width: POSTCARD_WIDTH,
    height: POSTCARD_HEIGHT,
  };
}
