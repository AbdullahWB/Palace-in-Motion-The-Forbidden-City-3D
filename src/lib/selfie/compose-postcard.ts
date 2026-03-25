import type { PostcardFrame } from "@/types/content";

export type PostcardCompositionResult = {
  dataUrl: string;
  downloadUrl: string;
  width: number;
  height: number;
};

export type ComposePostcardInput = {
  photoSrc: string;
  frame: PostcardFrame;
  title: string;
  caption: string;
  focusLabel: string;
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

async function loadImage(source: string) {
  const image = new Image();

  image.decoding = "async";

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

export async function composePostcard({
  photoSrc,
  frame,
  title,
  caption,
  focusLabel,
}: ComposePostcardInput): Promise<PostcardCompositionResult> {
  const palette = paletteByAccentToken[frame.accentToken];
  const sourceImage = await loadImage(photoSrc);
  const canvas = document.createElement("canvas");

  canvas.width = POSTCARD_WIDTH;
  canvas.height = POSTCARD_HEIGHT;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not available in this browser.");
  }

  const outerPadding = 44;
  const innerPadding = 74;
  const photoX = innerPadding;
  const photoY = innerPadding;
  const photoWidth = 860;
  const photoHeight = POSTCARD_HEIGHT - innerPadding * 2;
  const panelX = photoX + photoWidth + 48;
  const panelY = innerPadding;
  const panelWidth = POSTCARD_WIDTH - panelX - innerPadding;
  const panelHeight = POSTCARD_HEIGHT - innerPadding * 2;

  const backgroundGradient = context.createLinearGradient(0, 0, 0, POSTCARD_HEIGHT);
  backgroundGradient.addColorStop(0, palette.paper);
  backgroundGradient.addColorStop(1, "#fdf8f1");

  context.fillStyle = backgroundGradient;
  context.fillRect(0, 0, POSTCARD_WIDTH, POSTCARD_HEIGHT);

  context.strokeStyle = palette.frame;
  context.lineWidth = 4;
  roundedRectPath(
    context,
    outerPadding,
    outerPadding,
    POSTCARD_WIDTH - outerPadding * 2,
    POSTCARD_HEIGHT - outerPadding * 2,
    32
  );
  context.stroke();

  const surfaceGradient = context.createLinearGradient(0, 0, POSTCARD_WIDTH, POSTCARD_HEIGHT);
  surfaceGradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
  surfaceGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.fillStyle = surfaceGradient;
  roundedRectPath(
    context,
    outerPadding + 8,
    outerPadding + 8,
    POSTCARD_WIDTH - (outerPadding + 8) * 2,
    POSTCARD_HEIGHT - (outerPadding + 8) * 2,
    28
  );
  context.fill();

  context.save();
  roundedRectPath(context, photoX, photoY, photoWidth, photoHeight, 42);
  context.clip();
  drawPhotoCover({
    context,
    image: sourceImage,
    x: photoX,
    y: photoY,
    width: photoWidth,
    height: photoHeight,
  });

  const photoGradient = context.createLinearGradient(photoX, photoY, photoX, photoY + photoHeight);
  photoGradient.addColorStop(0, "rgba(21, 14, 10, 0.08)");
  photoGradient.addColorStop(0.58, "rgba(21, 14, 10, 0)");
  photoGradient.addColorStop(1, palette.photoGlow);
  context.fillStyle = photoGradient;
  context.fillRect(photoX, photoY, photoWidth, photoHeight);
  context.restore();

  context.lineWidth = 3;
  context.strokeStyle = "rgba(255, 255, 255, 0.68)";
  roundedRectPath(context, photoX, photoY, photoWidth, photoHeight, 42);
  context.stroke();

  const panelGradient = context.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
  panelGradient.addColorStop(0, palette.panel);
  panelGradient.addColorStop(1, palette.panelSoft);
  context.fillStyle = panelGradient;
  roundedRectPath(context, panelX, panelY, panelWidth, panelHeight, 42);
  context.fill();

  context.strokeStyle = "rgba(255, 255, 255, 0.14)";
  context.lineWidth = 2;
  roundedRectPath(context, panelX + 12, panelY + 12, panelWidth - 24, panelHeight - 24, 34);
  context.stroke();

  const ribbonX = panelX + 56;
  const ribbonY = panelY + 54;
  const ribbonWidth = Math.min(250 + frame.ribbonLabel.length * 3, panelWidth - 112);
  const ribbonHeight = 48;

  context.fillStyle = palette.ribbon;
  roundedRectPath(context, ribbonX, ribbonY, ribbonWidth, ribbonHeight, 24);
  context.fill();

  context.fillStyle = palette.ribbonText;
  context.font = "600 22px Inter, sans-serif";
  context.textBaseline = "middle";
  context.fillText(frame.ribbonLabel, ribbonX + 24, ribbonY + ribbonHeight / 2);

  const headingX = panelX + 56;
  let cursorY = ribbonY + 108;

  context.fillStyle = palette.textSoft;
  context.font = "600 20px Inter, sans-serif";
  context.textBaseline = "alphabetic";
  context.fillText("Palace in Motion souvenir", headingX, cursorY);

  cursorY += 48;
  context.fillStyle = palette.text;
  context.font = "600 60px 'Cormorant Garamond', serif";
  cursorY = drawWrappedText({
    context,
    text: title.trim() || frame.defaultTitle || frame.title,
    x: headingX,
    y: cursorY,
    maxWidth: panelWidth - 112,
    lineHeight: 66,
    maxLines: 3,
  });

  cursorY += 18;
  context.strokeStyle = palette.line;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(headingX, cursorY);
  context.lineTo(panelX + panelWidth - 56, cursorY);
  context.stroke();

  cursorY += 52;
  context.fillStyle = palette.textSoft;
  context.font = "500 30px Inter, sans-serif";
  cursorY = drawWrappedText({
    context,
    text: caption.trim(),
    x: headingX,
    y: cursorY,
    maxWidth: panelWidth - 112,
    lineHeight: 42,
    maxLines: 7,
  });

  const footerY = panelY + panelHeight - 130;
  context.fillStyle = palette.line;
  context.font = "600 18px Inter, sans-serif";
  context.fillText("HERITAGE FOCUS", headingX, footerY);

  context.fillStyle = palette.text;
  context.font = "600 34px 'Cormorant Garamond', serif";
  context.fillText(focusLabel, headingX, footerY + 42);

  context.fillStyle = palette.textSoft;
  context.font = "500 18px Inter, sans-serif";
  context.fillText("Forbidden City digital heritage keepsake", headingX, footerY + 92);

  const blob = await canvasToBlob(canvas);

  return {
    dataUrl: canvas.toDataURL("image/png"),
    downloadUrl: URL.createObjectURL(blob),
    width: POSTCARD_WIDTH,
    height: POSTCARD_HEIGHT,
  };
}
