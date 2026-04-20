import { ImmersiveStatusScreen } from "@/components/ui/app-status-screens";

export default function Loading() {
  return (
    <ImmersiveStatusScreen
      kind="loading"
      eyebrow={{ zh: "全景故宫", en: "Panoramic Palace" }}
      statusLabel={{ zh: "首页加载中", en: "Homepage loading" }}
      title={{ zh: "正在准备故宫入口场景…", en: "Preparing the palace entry scene..." }}
      description={{
        zh: "正在加载欢迎视图、地图入口、背景媒体和当前沉浸式体验所需的资源。",
        en: "Loading the welcome view, map entry, background media, and the assets needed for the immersive palace route.",
      }}
    />
  );
}
