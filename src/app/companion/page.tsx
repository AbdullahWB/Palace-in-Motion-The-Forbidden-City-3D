import type { Metadata } from "next";
import { CompanionPageClient } from "@/features/companion/companion-page-client";

export const metadata: Metadata = {
  title: "AI Palace Companion",
  description:
    "Full AI Palace Companion chat with route, Passport, quiz, and tour controls.",
};

export default function CompanionPage() {
  return <CompanionPageClient />;
}
