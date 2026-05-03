import type { NavItem } from "@/types/content";
import { appRoutes } from "@/lib/app-routes";

export const navigationItems: NavItem[] = [
  {
    label: "Home",
    href: appRoutes.home,
    description: "Fullscreen palace route with map, DeepSeek guidance, and integrated selfie mode.",
  },
  {
    label: "Companion",
    href: appRoutes.companion,
    description: "Full AI Palace Companion chat with Passport, route, quiz, and tour controls.",
  },
  {
    label: "3D View",
    href: appRoutes.threeD,
    description: "Fullscreen orbitable Forbidden City showcase with a model-ready viewer shell.",
  },
];
