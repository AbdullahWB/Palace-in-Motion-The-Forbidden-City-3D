import type { FeatureCard } from "@/types/content";

export const featureCards: FeatureCard[] = [
  {
    title: "Explore the palace grounds",
    body: "A live React Three Fiber canvas already runs on this route, giving the project a safe baseline for future spatial storytelling.",
    href: "/explore",
  },
  {
    title: "Guide visitors through a narrative path",
    body: "The tour route holds the narrative shell, stop selection state, and future AI-guide insertion points without fake orchestration logic.",
    href: "/tour",
  },
  {
    title: "Frame a memory as a postcard",
    body: "The selfie route focuses on presentation scaffolding, postcard styling, and route-specific state that can later power capture and export.",
    href: "/selfie",
  },
];

export const landingMetrics = [
  {
    value: "4",
    label: "Primary routes",
    description: "Each route is scaffolded and renders from the App Router.",
  },
  {
    value: "1",
    label: "Live 3D scene",
    description: "Only `/explore` mounts the canvas so scope stays controlled.",
  },
  {
    value: "0",
    label: "Fake backends",
    description: "No APIs, persistence, or mock business logic were introduced.",
  },
] as const;

export const landingHighlights = [
  {
    title: "Shared shell",
    description:
      "Header, mobile navigation, footer, typography, and layout primitives establish a consistent base for future sections.",
  },
  {
    title: "Typed placeholders",
    description:
      "Navigation links, tour stops, and postcard frames live in dedicated data modules so the routes stay declarative.",
  },
  {
    title: "Composable features",
    description:
      "Route-specific UI is kept inside feature folders, which gives later work a clean place for scene logic, storytelling, and media workflows.",
  },
] as const;
