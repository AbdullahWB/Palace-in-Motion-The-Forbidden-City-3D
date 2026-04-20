import { ImmersiveStatusScreen } from "@/components/ui/app-status-screens";

export default function Loading() {
  return (
    <ImmersiveStatusScreen
      kind="loading"
      eyebrow={{ zh: "导览入口", en: "Tour entry" }}
      statusLabel={{ zh: "跳转中", en: "Redirecting" }}
      title={{ zh: "正在接入当前探索主页…", en: "Connecting to the current explore homepage..." }}
      description={{
        zh: "原 tour 路径会回到新的全景探索主页，并保留沉浸式体验流程。",
        en: "The old tour route now resolves into the main panoramic homepage while preserving the immersive experience flow.",
      }}
    />
  );
}
