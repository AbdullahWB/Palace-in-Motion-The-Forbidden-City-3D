import { StandardStatusScreen } from "@/components/ui/app-status-screens";

export default function Loading() {
  return (
    <StandardStatusScreen
      kind="loading"
      eyebrow={{ zh: "合影与明信片", en: "Selfie and postcard" }}
      statusLabel={{ zh: "正在跳转", en: "Redirecting" }}
      title={{ zh: "正在准备纪念合影工作台…", en: "Preparing the souvenir studio..." }}
      description={{
        zh: "正在同步自拍入口、明信片预览和当前场景的纪念内容。",
        en: "Syncing the selfie entry, postcard preview, and the current scene’s souvenir context.",
      }}
      canvasHeightClassName="h-[34rem]"
    />
  );
}
