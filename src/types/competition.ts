import type {
  ExploreJourneyRouteId,
  ExplorePlaceSlug,
} from "@/types/content";

export type AchievementMissionType =
  | "route"
  | "quiz"
  | "preservation"
  | "diary"
  | "three-d"
  | "classroom";

export type AchievementMissionState = {
  id: string;
  type: AchievementMissionType;
  title: string;
  description: string;
  completed: boolean;
  completedAt: number | null;
  relatedPlaceSlug?: ExplorePlaceSlug | null;
  routeId?: ExploreJourneyRouteId | null;
};

export type ClassroomDifficulty = "starter" | "standard" | "challenge";
export type ClassroomRouteChoice = ExploreJourneyRouteId | "full-palace";

export type ClassroomAssignmentState = {
  id: string;
  title: string;
  routeId: ClassroomRouteChoice;
  difficulty: ClassroomDifficulty;
  requiredPlaceSlugs: ExplorePlaceSlug[];
  worksheetText: string;
  createdAt: number;
};

export type ClassroomReportState = {
  id: string;
  assignmentId: string;
  title: string;
  visitedCount: number;
  correctQuizCount: number;
  routeSealCount: number;
  completedMissionCount: number;
  reportText: string;
  createdAt: number;
};
