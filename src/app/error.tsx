"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ImmersiveStatusScreen,
  StandardStatusScreen,
} from "@/components/ui/app-status-screens";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const pathname = usePathname();
  const isStandardRoute = pathname === "/selfie";

  useEffect(() => {
    console.error(error);
  }, [error]);

  const actions = (
    <>
      <button
        type="button"
        onClick={unstable_retry}
        className="inline-flex rounded-full border border-accent/18 bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-strong"
      >
        Retry
      </button>
      <Link
        href="/"
        className="inline-flex rounded-full border border-border bg-surface-strong px-5 py-3 text-sm font-semibold text-foreground hover:bg-white/80"
      >
        Home
      </Link>
      <Link
        href="/3d-view"
        prefetch={false}
        className="inline-flex rounded-full border border-border bg-surface-strong px-5 py-3 text-sm font-semibold text-foreground hover:bg-white/80"
      >
        3D view
      </Link>
    </>
  );

  if (isStandardRoute) {
    return (
      <StandardStatusScreen
        kind="error"
        eyebrow={{ zh: "页面错误", en: "Page error" }}
        statusLabel={{ zh: "渲染失败", en: "Render failed" }}
        title={{ zh: "当前页面没有正常渲染。", en: "This page did not render correctly." }}
        description={{
          zh: "可以重试当前页面，或者回到主页继续使用故宫体验。",
          en: "Retry this page, or return to the main palace experience.",
        }}
        actions={actions}
      />
    );
  }

  return (
    <ImmersiveStatusScreen
      kind="error"
      code={error.digest ?? "APP"}
      eyebrow={{ zh: "系统错误", en: "Application error" }}
      statusLabel={{ zh: "渲染失败", en: "Render failed" }}
      title={{ zh: "故宫体验暂时无法展示。", en: "The palace experience is temporarily unavailable." }}
      description={{
        zh: "当前页面在渲染过程中发生了错误。可以立即重试，或者返回主页与 3D 视图继续浏览。",
        en: "Something failed while rendering this route. Retry now, or continue from the homepage or the 3D view.",
      }}
      actions={actions}
    />
  );
}
