"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, RefObject } from "react";
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
  type SubjectTransform,
} from "@/lib/selfie/compose-postcard";
import { extractForegroundFromSelfie } from "@/lib/selfie/remove-background";
import { DemoBadgePanel } from "@/components/ui/demo-badge-panel";
import { useSitePreferences } from "@/components/preferences/site-preferences-provider";
import { HERITAGE_SCENE_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import type { GuideRequest, GuideResponse } from "@/types/ai-guide";

type TabId = "theme" | "place-focus" | "text-ai" | "compose-export";
type PreparedForeground = { source: string; imageSrc: string; wasBackgroundRemoved: boolean };
type ActiveBackdrop = { imageUrl: string; label: string; sourceType: "preset" | "custom" };
type SelfieStudioProps = {
  mode?: "page" | "modal";
  onClose?: () => void;
  initialBackdrop?: {
    imageUrl: string;
    label: string;
  } | null;
  initialTitle?: string | null;
  initialCaption?: string | null;
  placeLabel?: string | null;
};

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "theme", label: "Theme" },
  { id: "place-focus", label: "Place & Focus" },
  { id: "text-ai", label: "Text & AI" },
  { id: "compose-export", label: "Compose & Export" },
];

const defaultSubjectTransform: SubjectTransform = { scale: 1, offsetX: 0, offsetY: 0 };

function getCameraErrorMessage(error: unknown) {
  if (error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError")) {
    return "Camera permission was denied. You can still upload an image instead.";
  }
  if (error instanceof DOMException && (error.name === "NotFoundError" || error.name === "OverconstrainedError")) {
    return "No compatible camera was found on this device. Upload still works.";
  }
  return "The camera could not be started. Upload an image instead.";
}

async function requestCameraStream() {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1440 }, height: { ideal: 1080 } },
      audio: false,
    });
  } catch (error) {
    if (error instanceof DOMException && (error.name === "OverconstrainedError" || error.name === "NotFoundError")) {
      return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
    throw error;
  }
}

function waitForVideoReady(video: HTMLVideoElement, timeoutMs = 4000) {
  if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      clearInterval(pollId);
      clearTimeout(timeoutId);
      resolve(value);
    };
    const check = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) finish(true);
    };
    const onReady = () => check();
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    const pollId = setInterval(check, 120);
    const timeoutId = setTimeout(() => finish(false), timeoutMs);
    check();
  });
}

function waitForVideoElement(ref: RefObject<HTMLVideoElement | null>, timeoutMs = 1200) {
  if (ref.current) return Promise.resolve(ref.current);
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      if (ref.current) return resolve(ref.current);
      if (performance.now() - start > timeoutMs) return reject(new Error("Camera preview element did not initialize in time."));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    setTimeout(() => cancelAnimationFrame(raf), timeoutMs + 50);
  });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("The selected image could not be read.")));
    reader.onerror = () => reject(new Error("The selected image could not be read."));
    reader.readAsDataURL(file);
  });
}

export function SelfieStudio({
  mode = "page",
  onClose,
  initialBackdrop = null,
  initialTitle = null,
  initialCaption = null,
  placeLabel = null,
}: SelfieStudioProps) {
  const isModal = mode === "modal";
  const { language, theme } = useSitePreferences();
  const isDarkTheme = theme === "dark";
  const selectedPostcardFrame = useAppStore((state) => state.selectedPostcardFrame);
  const setSelectedPostcardFrame = useAppStore((state) => state.setSelectedPostcardFrame);
  const setHasGeneratedPostcard = useAppStore((state) => state.setHasGeneratedPostcard);

  const activeFrame = getPostcardFrameById(selectedPostcardFrame);
  const [activeTab, setActiveTab] = useState<TabId>("theme");
  const [selectedFocusId, setSelectedFocusId] = useState(defaultSelfieFocusId);
  const [selectedPresetBackdropId, setSelectedPresetBackdropId] = useState(defaultSelfieBackdropId);
  const [customBackdropDataUrl, setCustomBackdropDataUrl] = useState<string | null>(
    initialBackdrop?.imageUrl ?? null
  );
  const [customBackdropLabel, setCustomBackdropLabel] = useState<string | null>(
    initialBackdrop?.label ?? null
  );
  const [title, setTitle] = useState(
    initialTitle?.trim() || activeFrame.defaultTitle || activeFrame.title
  );
  const [caption, setCaption] = useState(initialCaption ?? "");
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [preparedForeground, setPreparedForeground] = useState<PreparedForeground | null>(null);
  const [subjectTransform, setSubjectTransform] = useState<SubjectTransform>(defaultSubjectTransform);
  const [composition, setComposition] = useState<PostcardCompositionResult | null>(null);
  const [isCompositionStale, setIsCompositionStale] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [captionError, setCaptionError] = useState<string | null>(null);
  const [captionInfo, setCaptionInfo] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestingCaption, setIsSuggestingCaption] = useState(false);

  const activeFocus = getSelfieFocusById(selectedFocusId) ?? selfieFocusOptions[0];
  const presetBackdrop = getSelfieBackdropById(selectedPresetBackdropId);
  const activeBackdrop: ActiveBackdrop = customBackdropDataUrl
    ? { imageUrl: customBackdropDataUrl, label: customBackdropLabel ?? "Custom place", sourceType: "custom" }
    : { imageUrl: presetBackdrop.imageUrl, label: presetBackdrop.label, sourceType: "preset" };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sourceInputRef = useRef<HTMLInputElement | null>(null);
  const backdropInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);
  useEffect(() => () => { if (composition) URL.revokeObjectURL(composition.downloadUrl); }, [composition]);

  const markStale = () => composition && setIsCompositionStale(true);
  const resetGenerationState = () => { setComposition(null); setIsCompositionStale(false); };

  function stopCameraStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
    setIsCameraReady(false);
  }

  async function runPostcardGeneration(backdrop: ActiveBackdrop) {
    if (!sourceImage) throw new Error("Capture or upload your photo first, then generate.");
    const resolvedTitle = title.trim() || activeFrame.defaultTitle || activeFrame.title;
    const resolvedCaption = caption.trim() || activeFocus.description;
    let fg = preparedForeground;
    if (!fg || fg.source !== sourceImage) {
      setIsRemovingBackground(true);
      const extracted = await extractForegroundFromSelfie(sourceImage);
      fg = { source: sourceImage, imageSrc: extracted.imageSrc, wasBackgroundRemoved: extracted.wasBackgroundRemoved };
      setPreparedForeground(fg);
      setIsRemovingBackground(false);
    }
    const next = await composePostcard({
      photoSrc: fg.imageSrc,
      photoIsCutout: fg.wasBackgroundRemoved,
      backdropSrc: backdrop.imageUrl,
      backdropLabel: backdrop.label,
      subjectTransform,
      frame: activeFrame,
      title: resolvedTitle,
      caption: resolvedCaption,
      focusLabel: activeFocus.label,
    });
    setTitle(resolvedTitle);
    if (!caption.trim()) setCaption(resolvedCaption);
    setComposition(next);
    setIsCompositionStale(false);
    setHasGeneratedPostcard(true);
  }

  async function regenerateIfPossible(backdrop: ActiveBackdrop) {
    if (!sourceImage) return markStale();
    setIsGenerating(true);
    setGenerationError(null);
    try {
      await runPostcardGeneration(backdrop);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "The postcard preview could not be regenerated.");
      markStale();
    } finally {
      setIsGenerating(false);
      setIsRemovingBackground(false);
    }
  }

  async function handleStartCamera() {
    if (!navigator.mediaDevices?.getUserMedia) return setCameraError("This browser does not expose camera capture here. Upload an image instead.");
    if (!window.isSecureContext) return setCameraError("Camera access requires a secure context (https or localhost). Upload an image instead.");
    setIsStartingCamera(true);
    setCameraError(null);
    setGenerationError(null);
    resetGenerationState();
    try {
      stopCameraStream();
      const stream = await requestCameraStream();
      streamRef.current = stream;
      setIsCameraActive(true);
      const videoEl = await waitForVideoElement(videoRef);
      videoEl.srcObject = stream;
      await videoEl.play().catch(() => null);
      const ready = await waitForVideoReady(videoEl, 4500);
      if (!ready) {
        stopCameraStream();
        return setCameraError("Camera stream opened, but no preview frames arrived. Close other apps using the camera and check browser camera permissions.");
      }
      setIsCameraReady(true);
      setSourceLabel("Live camera preview");
    } catch (error) {
      setCameraError(getCameraErrorMessage(error));
    } finally {
      setIsStartingCamera(false);
    }
  }

  async function handleSourceUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    stopCameraStream();
    setCameraError(null);
    setGenerationError(null);
    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      setSourceImage(imageDataUrl);
      setSourceLabel(file.name);
      setPreparedForeground(null);
      resetGenerationState();
      setCaptionInfo(null);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "The selected image could not be read.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleBackdropUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      const nextBackdrop: ActiveBackdrop = { imageUrl: imageDataUrl, label: file.name, sourceType: "custom" };
      setCustomBackdropDataUrl(imageDataUrl);
      setCustomBackdropLabel(file.name);
      markStale();
      await regenerateIfPossible(nextBackdrop);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "The selected place image could not be read.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleCapturePhoto() {
    const video = videoRef.current;
    if (!video || !isCameraActive) return setCameraError("Start camera first, then capture a frame.");
    if (!isCameraReady || !video.videoWidth || !video.videoHeight) {
      const ready = await waitForVideoReady(video, 1600);
      if (!ready) return setCameraError("The camera is active, but no frame is available yet. Wait a moment and try capture again.");
      setIsCameraReady(true);
    }
    if (!video.videoWidth || !video.videoHeight) return setCameraError("The camera is active, but the current frame is not ready yet.");
    const captureCanvas = document.createElement("canvas");
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const captureContext = captureCanvas.getContext("2d");
    if (!captureContext) return setGenerationError("The browser could not capture the current camera frame.");
    captureContext.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
    setSourceImage(captureCanvas.toDataURL("image/png"));
    setSourceLabel("Camera capture");
    setPreparedForeground(null);
    resetGenerationState();
    setCaptionInfo(null);
    stopCameraStream();
  }

  async function handleGeneratePostcard() {
    if (!sourceImage) return setGenerationError("Capture or upload your photo first, then generate.");
    setGenerationError(null);
    setIsGenerating(true);
    try {
      await runPostcardGeneration(activeBackdrop);
      setActiveTab("compose-export");
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "The postcard preview could not be generated.");
      markStale();
    } finally {
      setIsGenerating(false);
      setIsRemovingBackground(false);
    }
  }

  async function handleSelectPresetBackdrop(backdropId: string) {
    setSelectedPresetBackdropId(backdropId);
    setCustomBackdropDataUrl(null);
    setCustomBackdropLabel(null);
    markStale();
    const nextPreset = getSelfieBackdropById(backdropId);
    await regenerateIfPossible({ imageUrl: nextPreset.imageUrl, label: nextPreset.label, sourceType: "preset" });
  }

  async function handleRemoveCustomBackdrop() {
    setCustomBackdropDataUrl(null);
    setCustomBackdropLabel(null);
    markStale();
    const nextPreset = getSelfieBackdropById(selectedPresetBackdropId);
    await regenerateIfPossible({ imageUrl: nextPreset.imageUrl, label: nextPreset.label, sourceType: "preset" });
  }

  async function handleSuggestCaption() {
    setCaptionError(null);
    setCaptionInfo(null);
    setIsSuggestingCaption(true);
    try {
      const payload: GuideRequest = {
        sceneId: HERITAGE_SCENE_ID,
        hotspotId: activeFocus.id === "central-axis" ? null : activeFocus.id,
        focusId: activeFocus.id,
        language,
        question:
          language === "zh"
            ? "请为这张文化纪念明信片建议一句简短题注。"
            : "Suggest a short postcard caption for this heritage souvenir.",
        mode: "fun",
        intent: "caption",
        postcardThemeId: activeFrame.id,
        title: title.trim() || null,
      };
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as GuideResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "The AI guide could not suggest a caption.");
      const suggestedCaption = data.caption?.text?.trim() || data.answer.trim();
      if (!suggestedCaption) throw new Error("The AI guide returned an empty caption.");
      setCaption(suggestedCaption);
      markStale();
      if (data.meta) setCaptionInfo(`Caption source: ${data.meta.provider} (${data.meta.latencyMs}ms)`);
    } catch (error) {
      setCaptionError(error instanceof Error ? error.message : "The AI guide could not suggest a caption.");
    } finally {
      setIsSuggestingCaption(false);
    }
  }

  const stageStatus = !sourceImage
    ? "No selfie image"
    : isRemovingBackground
      ? "Removing background"
      : isGenerating
        ? "Generating postcard"
        : composition && !isCompositionStale
          ? "Postcard generated"
          : composition && isCompositionStale
            ? "Changes need regenerate"
            : "Ready to generate";

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        !isDarkTheme && "text-foreground",
        isModal ? "h-full rounded-[1.8rem]" : "min-h-[calc(100svh-5rem)]"
      )}
    >
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

      <div
        className={cn(
          "relative z-10 mx-auto flex w-full flex-col",
          isModal
            ? "h-full max-w-[92rem] overflow-y-auto px-4 py-4 md:px-5 md:py-5"
            : "min-h-[calc(100svh-5rem)] max-w-7xl px-6 py-5 md:px-10 md:py-7"
        )}
      >
        <section className="rounded-[1.35rem] border border-white/20 bg-[rgba(10,9,8,0.38)] p-5 backdrop-blur-md">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {placeLabel ? (
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/68">
                  {placeLabel}
                </p>
              ) : null}
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f1d8b2]">Selfie and postcard</p>
              <h1
                className={cn(
                  "mt-3 font-display leading-tight text-white",
                  isModal ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl"
                )}
              >
                Full-view real place selfie mode
              </h1>
            </div>
            <div className="space-y-2 text-right">
              <p className="rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm font-semibold text-white">{sourceLabel ? `Selfie: ${sourceLabel}` : "No selfie image selected"}</p>
              <p className="rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm font-semibold text-white">{activeBackdrop.sourceType === "custom" ? `Place: custom (${activeBackdrop.label})` : `Place: preset (${activeBackdrop.label})`}</p>
              {isModal && onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/16"
                >
                  Close
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <div
          className={cn(
            "mt-5 grid flex-1 gap-6",
            isModal
              ? "xl:grid-cols-[minmax(0,1fr)_24rem]"
              : "xl:grid-cols-[minmax(0,1fr)_26rem]"
          )}
        >
          <section className="rounded-[1.8rem] border border-white/20 bg-[rgba(10,9,8,0.4)] p-6 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-3xl text-white">{title.trim() || activeFrame.defaultTitle || activeFrame.title}</h2>
              <span className="rounded-full border border-white/25 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">{stageStatus}</span>
            </div>

            <div
              className={cn(
                "relative mt-4 overflow-hidden rounded-[1.3rem] border border-white/22 bg-black/30",
                isModal ? "h-[38vh] min-h-[16rem] md:h-[42vh]" : "h-[48vh] min-h-[18rem]"
              )}
            >
              {isCameraActive ? (
                <>
                  <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                  {!isCameraReady ? <div className="absolute inset-0 flex items-center justify-center bg-black/40"><p className="rounded-full border border-white/35 bg-white/15 px-5 py-2 text-sm font-semibold text-white">Waiting for camera feed...</p></div> : null}
                </>
              ) : composition ? (
                <Image src={composition.dataUrl} alt="Generated postcard composition preview" fill unoptimized sizes="(max-width: 1280px) 100vw, 70vw" className="object-contain bg-black/45" />
              ) : sourceImage ? (
                <Image src={sourceImage} alt="Selected selfie source" fill unoptimized sizes="(max-width: 1280px) 100vw, 70vw" className="object-cover" />
              ) : (
                <Image src={activeBackdrop.imageUrl} alt={`${activeBackdrop.label} backdrop`} fill sizes="(max-width: 1280px) 100vw, 70vw" className="object-cover" />
              )}
              {isGenerating ? <div className="absolute inset-0 flex items-center justify-center bg-black/45"><p className="rounded-full border border-white/30 bg-white/18 px-5 py-2 text-sm font-semibold text-white">{isRemovingBackground ? "Removing selfie background..." : "Generating postcard..."}</p></div> : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={handleStartCamera} disabled={isStartingCamera} className={cn("rounded-full border px-5 py-3 text-sm font-semibold", isStartingCamera ? "cursor-wait border-white/25 bg-white/15 text-white/60" : "border-[#f1d8b2] bg-[#f1d8b2] text-[#271b15] hover:bg-[#f4e0c1]")}>{isCameraActive ? "Restart camera" : isStartingCamera ? "Starting camera..." : "Start camera"}</button>
              <button type="button" onClick={() => { void handleCapturePhoto(); }} disabled={!isCameraActive || !isCameraReady} className={cn("rounded-full border px-5 py-3 text-sm font-semibold", isCameraActive && isCameraReady ? "border-white/35 bg-white/12 text-white hover:bg-white/20" : "cursor-not-allowed border-white/20 bg-white/10 text-white/55")}>Capture photo</button>
              <button type="button" onClick={() => sourceInputRef.current?.click()} className="rounded-full border border-white/35 bg-white/12 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20">Upload image</button>
            </div>

            <input ref={sourceInputRef} type="file" accept="image/*" onChange={(event) => { void handleSourceUpload(event); }} className="hidden" />
            {cameraError ? <p className="mt-4 rounded-[1rem] border border-[#f1d8b2]/40 bg-[#f1d8b2]/16 px-4 py-3 text-sm leading-6 text-white">{cameraError}</p> : null}
            {generationError ? <p className="mt-4 rounded-[1rem] border border-[#f1d8b2]/40 bg-[#f1d8b2]/16 px-4 py-3 text-sm leading-6 text-white">{generationError}</p> : null}
          </section>

          <aside className="rounded-[1.8rem] border border-white/20 bg-[rgba(10,9,8,0.42)] p-6 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f1d8b2]">Postcard controls</p>
            <h3 className="mt-3 font-display text-3xl leading-tight text-white">Customize your souvenir</h3>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={cn("rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]", activeTab === tab.id ? "border-[#f1d8b2] bg-[#f1d8b2] text-[#2a1d16]" : "border-white/25 bg-white/10 text-white hover:bg-white/18")}>{tab.label}</button>)}
            </div>

            <div className="mt-6 min-h-[24rem] space-y-4">
              {activeTab === "theme" ? postcardFrames.map((frame) => <button key={frame.id} type="button" onClick={() => { setSelectedPostcardFrame(frame.id); setTitle(frame.defaultTitle || frame.title); markStale(); }} className={cn("w-full rounded-[1rem] border px-3 py-3 text-left", frame.id === activeFrame.id ? "border-[#f1d8b2]/65 bg-[#f1d8b2]/22 text-white" : "border-white/25 bg-white/12 text-white hover:bg-white/20")}><p className="font-semibold">{frame.title}</p><p className="mt-1 text-xs leading-5 text-white/75">{frame.description}</p></button>) : null}
              {activeTab === "place-focus" ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f1d8b2]">Place source</p>
                  {selfieBackdropOptions.map((backdrop) => <button key={backdrop.id} type="button" onClick={() => { void handleSelectPresetBackdrop(backdrop.id); }} className={cn("w-full rounded-[1rem] border px-3 py-2.5 text-left text-sm font-semibold", activeBackdrop.sourceType === "preset" && selectedPresetBackdropId === backdrop.id ? "border-[#f1d8b2]/65 bg-[#f1d8b2]/22 text-white" : "border-white/25 bg-white/12 text-white hover:bg-white/20")}>{backdrop.label}</button>)}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => backdropInputRef.current?.click()} className="rounded-full border border-white/35 bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-white/20">{customBackdropDataUrl ? "Replace place image" : "Upload place image"}</button>
                    {customBackdropDataUrl ? <button type="button" onClick={() => { void handleRemoveCustomBackdrop(); }} className="rounded-full border border-white/35 bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-white/20">Remove custom place</button> : null}
                  </div>
                  <input ref={backdropInputRef} type="file" accept="image/*" onChange={(event) => { void handleBackdropUpload(event); }} className="hidden" />
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f1d8b2]">Heritage focus</p>
                  {selfieFocusOptions.map((focus) => <button key={focus.id} type="button" onClick={() => { setSelectedFocusId(focus.id); markStale(); }} className={cn("w-full rounded-[1rem] border px-3 py-2.5 text-left text-sm font-semibold", focus.id === activeFocus.id ? "border-[#f1d8b2]/65 bg-[#f1d8b2]/22 text-white" : "border-white/25 bg-white/12 text-white hover:bg-white/20")}>{focus.label}</button>)}
                </>
              ) : null}
              {activeTab === "text-ai" ? (
                <>
                  <input value={title} onChange={(event) => { setTitle(event.target.value); markStale(); }} placeholder={activeFrame.defaultTitle || activeFrame.title} className="w-full rounded-[1rem] border border-white/25 bg-white/12 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/55 focus:border-[#f1d8b2]/60" />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f1d8b2]">Caption</span>
                    <button type="button" onClick={() => { void handleSuggestCaption(); }} disabled={isSuggestingCaption} className={cn("rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]", isSuggestingCaption ? "cursor-wait border-white/25 bg-white/15 text-white/60" : "border-white/35 bg-white/12 text-white hover:bg-white/20")}>{isSuggestingCaption ? "Suggesting" : "Suggest caption"}</button>
                  </div>
                  <textarea value={caption} onChange={(event) => { setCaption(event.target.value); markStale(); }} rows={6} placeholder="Write your own caption or use AI suggestion." className="w-full rounded-[1rem] border border-white/25 bg-white/12 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/55 focus:border-[#f1d8b2]/60" />
                  {captionInfo ? <p className="rounded-[1rem] border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/85">{captionInfo}</p> : null}
                  {captionError ? <p className="rounded-[1rem] border border-[#f1d8b2]/40 bg-[#f1d8b2]/16 px-4 py-3 text-sm leading-6 text-white">{captionError}</p> : null}
                </>
              ) : null}
              {activeTab === "compose-export" ? (
                <>
                  <label className="block"><div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-white/80"><span>Scale</span><span>{subjectTransform.scale.toFixed(2)}x</span></div><input type="range" min={0.6} max={1.6} step={0.05} value={subjectTransform.scale} onChange={(event) => { setSubjectTransform((prev) => ({ ...prev, scale: Number(event.target.value) })); markStale(); }} className="mt-2 w-full" /></label>
                  <label className="block"><div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-white/80"><span>Horizontal</span><span>{subjectTransform.offsetX}%</span></div><input type="range" min={-35} max={35} step={1} value={subjectTransform.offsetX} onChange={(event) => { setSubjectTransform((prev) => ({ ...prev, offsetX: Number(event.target.value) })); markStale(); }} className="mt-2 w-full" /></label>
                  <label className="block"><div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-white/80"><span>Vertical</span><span>{subjectTransform.offsetY}%</span></div><input type="range" min={-35} max={35} step={1} value={subjectTransform.offsetY} onChange={(event) => { setSubjectTransform((prev) => ({ ...prev, offsetY: Number(event.target.value) })); markStale(); }} className="mt-2 w-full" /></label>
                  <button type="button" onClick={() => { setSubjectTransform(defaultSubjectTransform); markStale(); }} className="rounded-full border border-white/35 bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-white/20">Reset placement</button>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => { void handleGeneratePostcard(); }} disabled={isGenerating} className={cn("rounded-full border px-5 py-3 text-sm font-semibold", isGenerating ? "cursor-wait border-white/25 bg-white/15 text-white/60" : "border-accent bg-accent text-white hover:bg-accent-strong")}>{composition && isCompositionStale ? "Regenerate postcard" : "Generate postcard"}</button>
                    {composition ? <a href={composition.downloadUrl} download={`${activeFrame.id}-postcard.png`} className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/12 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20">Download PNG</a> : null}
                  </div>
                  <DemoBadgePanel announce compact className="bg-white/12" title="Completion badge" description="Unlock by finishing the Explore route and postcard steps." />
                </>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
