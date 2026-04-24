import Link from "next/link";
import { ImmersiveStatusScreen } from "@/components/ui/app-status-screens";

export default function NotFound() {
  return (
    <ImmersiveStatusScreen
      kind="error"
      code="404"
      eyebrow={{ zh: "页面未找到", en: "Page not found" }}
      statusLabel={{ zh: "路由不可用", en: "Route unavailable" }}
      title={{ zh: "这个页面不在当前故宫体验里。", en: "This page is not part of the current palace experience." }}
      description={{
        zh: "你打开的地址不存在，或者旧链接已经失效。可以返回主页、直接打开地图，或进入 3D 视图。",
        en: "The URL you opened does not exist, or the older link is no longer valid. Return home, reopen the map, or jump into the 3D view.",
      }}
      actions={
        <>
          <Link
            href="/"
            className="inline-flex rounded-full border border-accent/18 bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-strong"
          >
            Return home
          </Link>
          <Link
            href="/?view=map"
            className="inline-flex rounded-full border border-border bg-surface-strong px-5 py-3 text-sm font-semibold text-foreground hover:bg-white/80"
          >
            Open map
          </Link>
          <Link
            href="/3d-view"
            prefetch={false}
            className="inline-flex rounded-full border border-border bg-surface-strong px-5 py-3 text-sm font-semibold text-foreground hover:bg-white/80"
          >
            Open 3D view
          </Link>
        </>
      }
    />
  );
}
