"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  defaultSelfieBackdropId,
  defaultSelfieFocusId,
  getPostcardFrameById,
  getSelfieBackdropById,
  getSelfieFocusById,
  postcardFrames,
  selfieBackdropOptions,
  selfieFocusOptions,
} from "@/data/selfie";
import {
  composePostcard,
  type PostcardCompositionResult,
} from "@/lib/selfie/compose-postcard";
import { DemoBadgePanel } from "@/components/ui/demo-badge-panel";
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
  const setHasGeneratedPostcard = useAppStore(
    (state) => state.setHasGeneratedPostcard
  );

  const activeFrame = getPostcardFrameById(selectedPostcardFrame);
  const [selectedFocusId, setSelectedFocusId] = useState(defaultSelfieFocusId);
  const activeFocus = getSelfieFocusById(selectedFocusId) ?? selfieFocusOptions[0];
  const [selectedBackdropId, setSelectedBackdropId] = useState(
    defaultSelfieBackdropId
  );
  const activeBackdrop = getSelfieBackdropById(selectedBackdropId);
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
      setGenerationError("Capture or upload your photo first, then generate.");
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
      setHasGeneratedPostcard(true);
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
    <div className="relative min-h-[calc(100svh-5rem)] overflow-hidden">
      <Image
        src={activeBackdrop.imageUrl}
        alt={activeBackdrop.label}
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,12,10,0.38),rgba(16,12,10,0.5))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(183,138,76,0.22),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(138,34,48,0.18),transparent_36%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-7xl flex-col px-6 py-5 md:px-10 md:py-7">
        <section className="rounded-[1.35rem] border border-white/20 bg-[rgba(10,9,8,0.38)] p-4 backdrop-blur-md md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f1d8b2]">
                Selfie and postcard
              </p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-white md:text-5xl">
                Full-view real place selfie mode
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/78 md:text-base">
                Choose a real place backdrop, then capture or upload your selfie
                and generate a polished souvenir composition.
              </p>
            </div>
            <div
              aria-live="polite"
              className="rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm font-semibold text-white"
            >
              {sourceLabel ? `Source: ${sourceLabel}` : "No selfie image selected"}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {selfieBackdropOptions.map((backdrop) => {
              const isActive = backdrop.id === selectedBackdropId;

              return (
                <button
                  key={backdrop.id}
                  type="button"
                  onClick={() => setSelectedBackdropId(backdrop.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold",
                    isActive
                      ? "border-[#f1d8b2] bg-[#f1d8b2] text-[#221914]"
                      : "border-white/30 bg-white/12 text-white hover:bg-white/20"
                  )}
                >
                  {backdrop.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-5 grid flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <section className="rounded-[1.6rem] border border-white/20 bg-[rgba(10,9,8,0.4)] p-5 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f1d8b2]">
                  Live selfie stage
                </p>
                <h2 className="mt-2 font-display text-3xl leading-tight text-white">
                  {title.trim() || activeFrame.defaultTitle || activeFrame.title}
                </h2>
              </div>
              <span className="rounded-full border border-white/25 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                {activeBackdrop.label}
              </span>
            </div>

            <div className="relative mt-4 h-[48vh] min-h-[18rem] overflow-hidden rounded-[1.25rem] border border-white/22 bg-black/30">
              {composition ? (
                <Image
                  src={composition.dataUrl}
                  alt="Generated postcard composition preview"
                  fill
                  unoptimized
                  sizes="(max-width: 1280px) 100vw, 70vw"
                  className="object-cover"
                />
              ) : isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : sourceImage ? (
                <Image
                  src={sourceImage}
                  alt="Selected selfie source"
                  fill
                  unoptimized
                  sizes="(max-width: 1280px) 100vw, 70vw"
                  className="object-cover"
                />
              ) : (
                <>
                  <Image
                    src={activeBackdrop.imageUrl}
                    alt={`${activeBackdrop.label} backdrop`}
                    fill
                    sizes="(max-width: 1280px) 100vw, 70vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,12,10,0.2),rgba(16,12,10,0.45))]" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f1d8b2]">
                      Ready for selfie capture
                    </p>
                    <p className="mt-2 max-w-xl text-sm leading-7 text-white/85">
                      Start camera for a live selfie, or upload your photo to
                      place yourself in front of this full-view background.
                    </p>
                  </div>
                </>
              )}

              {isGenerating ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                  <p className="rounded-full border border-white/30 bg-white/18 px-5 py-2 text-sm font-semibold text-white">
                    Generating postcard...
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleStartCamera}
                disabled={isStartingCamera}
                className={cn(
                  "rounded-full border px-5 py-3 text-sm font-semibold",
                  isStartingCamera
                    ? "cursor-wait border-white/25 bg-white/15 text-white/60"
                    : "border-[#f1d8b2] bg-[#f1d8b2] text-[#271b15] hover:bg-[#f4e0c1]"
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
                    ? "border-white/35 bg-white/12 text-white hover:bg-white/20"
                    : "cursor-not-allowed border-white/20 bg-white/10 text-white/55"
                )}
              >
                Capture photo
              </button>

              <button
                type="button"
                onClick={handleUploadButtonClick}
                className="rounded-full border border-white/35 bg-white/12 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                Upload image
              </button>

              <button
                type="button"
                onClick={handleGeneratePostcard}
                disabled={isGenerating}
                className={cn(
                  "rounded-full border px-5 py-3 text-sm font-semibold",
                  isGenerating
                    ? "cursor-wait border-white/25 bg-white/15 text-white/60"
                    : "border-accent bg-accent text-white hover:bg-accent-strong"
                )}
              >
                {isGenerating ? "Generating..." : "Generate postcard"}
              </button>

              {composition ? (
                <a
                  href={composition.downloadUrl}
                  download={`${activeFrame.id}-postcard.png`}
                  className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/12 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20"
                >
                  Download PNG
                </a>
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
              <p className="mt-4 rounded-[1rem] border border-[#f1d8b2]/40 bg-[#f1d8b2]/16 px-4 py-3 text-sm leading-6 text-white">
                {cameraError}
              </p>
            ) : null}

            {generationError ? (
              <p className="mt-4 rounded-[1rem] border border-[#f1d8b2]/40 bg-[#f1d8b2]/16 px-4 py-3 text-sm leading-6 text-white">
                {generationError}
              </p>
            ) : null}
          </section>

          <aside className="rounded-[1.6rem] border border-white/20 bg-[rgba(10,9,8,0.4)] p-5 backdrop-blur-md xl:max-h-[calc(100svh-11.5rem)] xl:overflow-y-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f1d8b2]">
              Postcard controls
            </p>
            <h3 className="mt-3 font-display text-3xl leading-tight text-white">
              Customize your souvenir
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/78">
              Tune frame, heritage focus, title, and caption. The AI guide can
              still suggest a caption from local heritage context.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f1d8b2]">
                  Theme preset
                </p>
                <div className="mt-3 space-y-2">
                  {postcardFrames.map((frame) => {
                    const isActive = frame.id === activeFrame.id;

                    return (
                      <button
                        key={frame.id}
                        type="button"
                        onClick={() => setSelectedPostcardFrame(frame.id)}
                        className={cn(
                          "w-full rounded-[1rem] border px-3 py-3 text-left",
                          isActive
                            ? "border-[#f1d8b2]/65 bg-[#f1d8b2]/22 text-white"
                            : "border-white/25 bg-white/12 text-white hover:bg-white/20"
                        )}
                      >
                        <p className="font-semibold">{frame.title}</p>
                        <p className="mt-1 text-xs leading-5 text-white/75">
                          {frame.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f1d8b2]">
                  Heritage focus
                </p>
                <div className="mt-3 space-y-2">
                  {selfieFocusOptions.map((focus) => {
                    const isActive = focus.id === activeFocus.id;

                    return (
                      <button
                        key={focus.id}
                        type="button"
                        onClick={() => setSelectedFocusId(focus.id)}
                        className={cn(
                          "w-full rounded-[1rem] border px-3 py-3 text-left",
                          isActive
                            ? "border-[#f1d8b2]/65 bg-[#f1d8b2]/22 text-white"
                            : "border-white/25 bg-white/12 text-white hover:bg-white/20"
                        )}
                      >
                        <p className="font-semibold">{focus.label}</p>
                        <p className="mt-1 text-xs leading-5 text-white/75">
                          {focus.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f1d8b2]">
                  Postcard title
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={activeFrame.defaultTitle || activeFrame.title}
                  className="mt-2 w-full rounded-[1rem] border border-white/25 bg-white/12 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/55 focus:border-[#f1d8b2]/60"
                />
              </label>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f1d8b2]">
                    Caption
                  </span>
                  <button
                    type="button"
                    onClick={handleSuggestCaption}
                    disabled={isSuggestingCaption}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
                      isSuggestingCaption
                        ? "cursor-wait border-white/25 bg-white/15 text-white/60"
                        : "border-white/35 bg-white/12 text-white hover:bg-white/20"
                    )}
                  >
                    {isSuggestingCaption ? "Suggesting" : "Suggest caption"}
                  </button>
                </div>

                <textarea
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  rows={5}
                  placeholder="Write your own caption or use AI suggestion."
                  className="mt-2 w-full rounded-[1rem] border border-white/25 bg-white/12 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/55 focus:border-[#f1d8b2]/60"
                />

                {captionError ? (
                  <p className="mt-3 rounded-[1rem] border border-[#f1d8b2]/40 bg-[#f1d8b2]/16 px-4 py-3 text-sm leading-6 text-white">
                    {captionError}
                  </p>
                ) : null}
              </div>

              <DemoBadgePanel
                announce
                compact
                className="bg-white/12"
                title="Completion badge"
                description="Unlock by finishing tour and postcard steps."
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
