import { ImmersiveStatusScreen } from "@/components/ui/app-status-screens";

export default function Loading() {
  return (
    <ImmersiveStatusScreen
      kind="loading"
      eyebrow={{ zh: "三维视图", en: "3D View" }}
      statusLabel={{ zh: "场景预热中", en: "Scene warming up" }}
      title={{ zh: "正在准备全屏 3D 故宫场景…", en: "Preparing the fullscreen 3D palace scene..." }}
      description={{
        zh: "正在加载三维展示壳层、场景资源和嵌入式 Forbidden City 模型视图。",
        en: "Loading the 3D showcase shell, scene resources, and the embedded Forbidden City model view.",
      }}
    />
  );
}
