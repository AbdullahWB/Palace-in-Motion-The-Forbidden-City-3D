import { ImmersiveStatusScreen } from "@/components/ui/app-status-screens";

export default function Loading() {
  return (
    <ImmersiveStatusScreen
      kind="loading"
      eyebrow={{ zh: "三维视图", en: "3D View" }}
      statusLabel={{ zh: "场景预热中", en: "Scene warming up" }}
      title={{
        zh: "正在准备全屏故宫三维展示…",
        en: "Preparing the fullscreen Forbidden City 3D showcase...",
      }}
      description={{
        zh: "正在加载展示外壳、场景资源和嵌入式三维视图。",
        en: "Loading the showcase shell, scene resources, and the embedded 3D view.",
      }}
    />
  );
}
