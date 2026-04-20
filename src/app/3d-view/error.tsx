"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ImmersiveStatusScreen } from "@/components/ui/app-status-screens";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ImmersiveStatusScreen
      kind="error"
      code={error.digest ?? "3D"}
      eyebrow={{ zh: "三维场景错误", en: "3D scene error" }}
      statusLabel={{ zh: "场景加载失败", en: "Scene load failed" }}
      title={{ zh: "3D 故宫场景暂时不可用。", en: "The 3D Forbidden City scene is temporarily unavailable." }}
      description={{
        zh: "嵌入式三维场景没有正常完成加载。可以重试，或返回主页继续使用地图和场景探索。",
        en: "The embedded 3D scene did not finish loading correctly. Retry the scene, or return to the homepage and continue with map-based exploration.",
      }}
      actions={
        <>
          <button
            type="button"
            onClick={unstable_retry}
            className="inline-flex rounded-full border border-accent/18 bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-strong"
          >
            Retry 3D scene
          </button>
          <Link
            href="/"
            className="inline-flex rounded-full border border-border bg-surface-strong px-5 py-3 text-sm font-semibold text-foreground hover:bg-white/80"
          >
            Return home
          </Link>
        </>
      }
    />
  );
}
