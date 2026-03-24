import type { PostcardFrame } from "@/types/content";

export const postcardFrames: PostcardFrame[] = [
  {
    id: "imperial-red",
    title: "Imperial Red",
    accentToken: "imperial-red",
  },
  {
    id: "bronze-trim",
    title: "Bronze Trim",
    accentToken: "sunlit-bronze",
  },
  {
    id: "ink-studio",
    title: "Ink Studio",
    accentToken: "jade-ink",
  },
];

export const defaultPostcardFrameId = postcardFrames[0].id;
