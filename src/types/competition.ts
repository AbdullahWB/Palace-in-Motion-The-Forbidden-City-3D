import type {
  ExploreJourneyRouteId,
  ExplorePlaceSlug,
} from "@/types/content";

export type AchievementMissionType =
  | "route"
  | "quiz"
  | "preservation"
  | "diary"
  | "three-d";

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
