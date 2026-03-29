type ForegroundExtractionResult = {
  imageSrc: string;
  wasBackgroundRemoved: boolean;
};

let removeBackgroundFn:
  | ((typeof import("@imgly/background-removal"))["removeBackground"])
  | null = null;

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Background removal result could not be read."));
    };

    reader.onerror = () => {
      reject(new Error("Background removal result could not be read."));
    };

    reader.readAsDataURL(blob);
  });
}

async function getRemoveBackgroundFn() {
  if (removeBackgroundFn) {
    return removeBackgroundFn;
  }

  const bgModule = await import("@imgly/background-removal");
  removeBackgroundFn = bgModule.removeBackground ?? bgModule.default;
  return removeBackgroundFn;
}

export async function extractForegroundFromSelfie(
  imageSrc: string
): Promise<ForegroundExtractionResult> {
  try {
    const removeBackground = await getRemoveBackgroundFn();
    const resultBlob = await removeBackground(imageSrc, {
      device: "cpu",
      model: "isnet_quint8",
      proxyToWorker: false,
      output: {
        format: "image/png",
        quality: 1,
      },
    });
    const resultDataUrl = await blobToDataUrl(resultBlob);

    return {
      imageSrc: resultDataUrl,
      wasBackgroundRemoved: true,
    };
  } catch {
    return {
      imageSrc,
      wasBackgroundRemoved: false,
    };
  }
}
