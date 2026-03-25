"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  defaultSelfieFocusId,
  getPostcardFrameById,
  getSelfieFocusById,
  postcardFrames,
  selfieFocusOptions,
} from "@/data/selfie";
import { PostcardPreview } from "@/features/selfie/postcard-preview";
import {
  composePostcard,
  type PostcardCompositionResult,
} from "@/lib/selfie/compose-postcard";
import { HERITAGE_SCENE_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import type { GuideRequest, GuideResponse } from "@/types/ai-guide";

function getCameraErrorMessage(error: unknown) {
  if (
    error instanceof DOMException &&
    (error.name === "NotAllowedError" || error.name === "SecurityError")
  ) {
    return "Camera permission was denied. You can still upload an image instead.";
  }

  if (
    error instanceof DOMException &&
    (error.name === "NotFoundError" || error.name === "OverconstrainedError")
  ) {
    return "No compatible camera was found on this device. Upload still works.";
  }

  return "The camera could not be started. Upload an image instead.";
}

export function SelfieStudio() {
  const selectedPostcardFrame = useAppStore(
    (state) => state.selectedPostcardFrame
  );
  const setSelectedPostcardFrame = useAppStore(
    (state) => state.setSelectedPostcardFrame
  );

  const activeFrame = getPostcardFrameById(selectedPostcardFrame);
  const [selectedFocusId, setSelectedFocusId] = useState(defaultSelfieFocusId);
  const activeFocus = getSelfieFocusById(selectedFocusId) ?? selfieFocusOptions[0];
  const [title, setTitle] = useState(
    activeFrame.defaultTitle ?? activeFrame.title
  );
  const [caption, setCaption] = useState("");
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [composition, setComposition] =
    useState<PostcardCompositionResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [captionError, setCaptionError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestingCaption, setIsSuggestingCaption] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (composition) {
        URL.revokeObjectURL(composition.downloadUrl);
      }
    };
  }, [composition]);

  function stopCameraStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  }

  async function handleStartCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "This browser does not expose camera capture here. Upload an image instead."
      );
      return;
    }

    setIsStartingCamera(true);
    setCameraError(null);

    try {
      stopCameraStream();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1440 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => null);
      }

      setIsCameraActive(true);
    } catch (error) {
      setCameraError(getCameraErrorMessage(error));
    } finally {
      setIsStartingCamera(false);
    }
  }

  function handleUploadButtonClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    stopCameraStream();
    setCameraError(null);

    const reader = new FileReader();

    reader.onload = () => {
      setSourceImage(typeof reader.result === "string" ? reader.result : null);
      setSourceLabel(file.name);
      setComposition(null);
      setGenerationError(null);
    };

    reader.onerror = () => {
      setGenerationError("The selected image could not be read.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function handleCapturePhoto() {
    const video = videoRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError("The camera is active, but the current frame is not ready yet.");
      return;
    }

    const captureCanvas = document.createElement("canvas");
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;

    const captureContext = captureCanvas.getContext("2d");

    if (!captureContext) {
      setGenerationError("The browser could not capture the current camera frame.");
      return;
    }

    captureContext.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
    setSourceImage(captureCanvas.toDataURL("image/png"));
    setSourceLabel("Camera capture");
    setComposition(null);
    setGenerationError(null);
    stopCameraStream();
  }

  async function handleGeneratePostcard() {
    if (!sourceImage) {
      setGenerationError("Add a camera capture or uploaded image before generating.");
      return;
    }

    setGenerationError(null);
    setIsGenerating(true);

    const resolvedTitle = title.trim() || activeFrame.defaultTitle || activeFrame.title;
    const resolvedCaption = caption.trim() || activeFocus.description;

    try {
      const nextComposition = await composePostcard({
        photoSrc: sourceImage,
        frame: activeFrame,
        title: resolvedTitle,
        caption: resolvedCaption,
        focusLabel: activeFocus.label,
      });

      setTitle(resolvedTitle);

      if (!caption.trim()) {
        setCaption(resolvedCaption);
      }

      setComposition(nextComposition);
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "The postcard preview could not be generated."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSuggestCaption() {
    setCaptionError(null);
    setIsSuggestingCaption(true);

    try {
      const payload: GuideRequest = {
        sceneId: HERITAGE_SCENE_ID,
        hotspotId: activeFocus.id === "central-axis" ? null : activeFocus.id,
        focusId: activeFocus.id,
        question: "Suggest a short postcard caption for this heritage souvenir.",
        mode: "fun",
        intent: "caption",
        postcardThemeId: activeFrame.id,
        title: title.trim() || null,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as GuideResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "The AI guide could not suggest a caption.");
      }

      setCaption(data.answer.trim());
    } catch (error) {
      setCaptionError(
        error instanceof Error
          ? error.message
          : "The AI guide could not suggest a caption."
      );
    } finally {
      setIsSuggestingCaption(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.32fr)_24rem]">
      <div className="space-y-6">
        <PostcardPreview
          frame={activeFrame}
          composition={composition}
          sourceImage={sourceImage}
          focusLabel={activeFocus.label}
          title={title}
          caption={caption}
          isCameraActive={isCameraActive}
          isGenerating={isGenerating}
          videoRef={videoRef}
        />

        <section className="paper-panel rounded-[1.8rem] border border-border p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                Media input
              </p>
              <h3 className="mt-3 font-display text-3xl text-foreground">
                Capture or upload your souvenir image
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                Use a live camera frame for a playful museum postcard, or upload
                an existing image for a cleaner composition pass.
              </p>
            </div>

            <div className="rounded-[1.25rem] border border-accent/15 bg-accent/8 px-4 py-3 text-sm leading-6 text-muted">
              {isCameraActive
                ? "Camera live. Capture when the framing feels right."
                : sourceLabel
                  ? `Current source: ${sourceLabel}`
                  : "No image selected yet."}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleStartCamera}
              disabled={isStartingCamera}
              className={cn(
                "rounded-full border px-5 py-3 text-sm font-semibold",
                isStartingCamera
                  ? "cursor-wait border-border bg-white/60 text-muted"
                  : "border-accent bg-accent text-white hover:-translate-y-0.5 hover:bg-accent-strong"
              )}
            >
              {isCameraActive
                ? "Restart camera"
                : isStartingCamera
                  ? "Starting camera..."
                  : "Start camera"}
            </button>

            <button
              type="button"
              onClick={handleCapturePhoto}
              disabled={!isCameraActive}
              className={cn(
                "rounded-full border px-5 py-3 text-sm font-semibold",
                isCameraActive
                  ? "border-border bg-white/82 text-foreground hover:-translate-y-0.5 hover:bg-white"
                  : "cursor-not-allowed border-border bg-white/60 text-muted"
              )}
            >
              Capture photo
            </button>

            <button
              type="button"
              onClick={handleUploadButtonClick}
              className="rounded-full border border-border bg-white/82 px-5 py-3 text-sm font-semibold text-foreground hover:-translate-y-0.5 hover:bg-white"
            >
              Upload image
            </button>

            {isCameraActive ? (
              <button
                type="button"
                onClick={stopCameraStream}
                className="rounded-full border border-border bg-white/82 px-5 py-3 text-sm font-semibold text-foreground hover:-translate-y-0.5 hover:bg-white"
              >
                Stop camera
              </button>
            ) : null}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {cameraError ? (
            <p className="mt-4 rounded-[1.1rem] border border-accent/15 bg-accent/8 px-4 py-3 text-sm leading-6 text-muted">
              {cameraError}
            </p>
          ) : null}
        </section>
      </div>

      <div className="space-y-6">
        <aside className="paper-panel rounded-[1.8rem] border border-border p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
            Postcard controls
          </p>
          <h3 className="mt-3 font-display text-3xl text-foreground">
            Build a Forbidden City keepsake
          </h3>
          <p className="mt-3 text-sm leading-7 text-muted">
            Theme, focus, title, and caption all stay local to this page. The
            AI helper only suggests wording grounded in the shared heritage
            content system.
          </p>

          <div className="mt-6 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                Theme preset
              </p>
              <div className="mt-3 space-y-3">
                {postcardFrames.map((frame) => {
                  const isActive = frame.id === activeFrame.id;

                  return (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() => setSelectedPostcardFrame(frame.id)}
                      className={cn(
                        "w-full rounded-[1.35rem] border px-4 py-4 text-left",
                        isActive
                          ? "border-accent/25 bg-accent/10"
                          : "border-border bg-white/80 hover:bg-white"
                      )}
                    >
                      <p className="font-semibold text-foreground">{frame.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {frame.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                Heritage focus
              </p>
              <div className="mt-3 space-y-3">
                {selfieFocusOptions.map((focus) => {
                  const isActive = focus.id === activeFocus.id;

                  return (
                    <button
                      key={focus.id}
                      type="button"
                      onClick={() => setSelectedFocusId(focus.id)}
                      className={cn(
                        "w-full rounded-[1.35rem] border px-4 py-4 text-left",
                        isActive
                          ? "border-accent/25 bg-accent/10"
                          : "border-border bg-white/80 hover:bg-white"
                      )}
                    >
                      <p className="font-semibold text-foreground">{focus.label}</p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {focus.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                Postcard title
              </span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={activeFrame.defaultTitle || activeFrame.title}
                className="mt-2 w-full rounded-[1.25rem] border border-border bg-white/85 px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-accent/30"
              />
            </label>

            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
                  Caption
                </span>
                <button
                  type="button"
                  onClick={handleSuggestCaption}
                  disabled={isSuggestingCaption}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold",
                    isSuggestingCaption
                      ? "cursor-wait border-border bg-white/60 text-muted"
                      : "border-border bg-white/82 text-foreground hover:-translate-y-0.5 hover:bg-white"
                  )}
                >
                  {isSuggestingCaption ? "Suggesting..." : "Suggest caption"}
                </button>
              </div>

              <textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                rows={5}
                placeholder="Write a short memory note, or let the AI guide suggest one."
                className="mt-2 w-full rounded-[1.25rem] border border-border bg-white/85 px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-accent/30"
              />

              {captionError ? (
                <p className="mt-3 rounded-[1.1rem] border border-accent/15 bg-accent/8 px-4 py-3 text-sm leading-6 text-muted">
                  {captionError}
                </p>
              ) : null}
            </div>
          </div>
        </aside>

        <aside className="paper-panel rounded-[1.8rem] border border-border p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
            Generate postcard
          </p>
          <h3 className="mt-3 font-display text-3xl text-foreground">
            Render a demo-ready composition
          </h3>
          <p className="mt-3 text-sm leading-7 text-muted">
            The postcard preview is built entirely in the browser. Change the
            content or theme, then generate again to refresh the exported image.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGeneratePostcard}
              disabled={isGenerating}
              className={cn(
                "rounded-full border px-5 py-3 text-sm font-semibold",
                isGenerating
                  ? "cursor-wait border-border bg-white/60 text-muted"
                  : "border-accent bg-accent text-white hover:-translate-y-0.5 hover:bg-accent-strong"
              )}
            >
              {isGenerating ? "Generating..." : "Generate postcard"}
            </button>

            {composition ? (
              <a
                href={composition.downloadUrl}
                download={`${activeFrame.id}-postcard.png`}
                className="inline-flex items-center justify-center rounded-full border border-border bg-white/82 px-5 py-3 text-sm font-semibold text-foreground hover:-translate-y-0.5 hover:bg-white"
              >
                Download PNG
              </a>
            ) : null}
          </div>

          {generationError ? (
            <p className="mt-4 rounded-[1.1rem] border border-accent/15 bg-accent/8 px-4 py-3 text-sm leading-6 text-muted">
              {generationError}
            </p>
          ) : null}

          <div className="mt-6 rounded-[1.35rem] border border-accent/15 bg-accent/8 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-soft">
              Output status
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {composition
                ? `Generated at ${composition.width} x ${composition.height}.`
                : "No postcard generated yet. Capture or upload an image first."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
