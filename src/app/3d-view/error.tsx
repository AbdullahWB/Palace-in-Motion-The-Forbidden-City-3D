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
      title={{
        zh: "故宫三维展示暂时不可用。",
        en: "The Forbidden City 3D showcase is temporarily unavailable.",
      }}
      description={{
        zh: "嵌入式三维场景没有正常完成加载。可以重新尝试，或者返回首页继续从探索视图进入其他内容。",
        en: "The embedded 3D scene did not finish loading correctly. Retry the scene, or return home and continue from the main exploration flow.",
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
