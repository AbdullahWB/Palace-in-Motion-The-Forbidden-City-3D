import { ImmersiveStatusScreen } from "@/components/ui/app-status-screens";

export default function Loading() {
  return (
    <ImmersiveStatusScreen
      kind="loading"
      eyebrow={{ zh: "探索入口", en: "Explore entry" }}
      statusLabel={{ zh: "跳转中", en: "Redirecting" }}
      title={{ zh: "正在打开沉浸式故宫路线…", en: "Opening the immersive palace route..." }}
      description={{
        zh: "正在进入当前的主页探索体验，并同步地图、场景和背景资源。",
        en: "Moving into the current homepage exploration flow and syncing the map, scenes, and background media.",
      }}
    />
  );
}
