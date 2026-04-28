import type { Metadata } from "next";
import { ClassroomToolkitPage } from "@/features/classroom/classroom-toolkit-page";

export const metadata: Metadata = {
  title: "Classroom Toolkit",
  description:
    "Local-first teacher tools for assigning routes, quizzes, preservation prompts, and Travel Diary reflection.",
};

export default function ClassroomPage() {
  return <ClassroomToolkitPage />;
}
