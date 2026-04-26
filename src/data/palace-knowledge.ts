import { exploreExperience } from "@/data/panorama";
import { pickLocalizedText } from "@/lib/i18n";
import type {
  ExploreJourneyRouteId,
  ExplorePlace,
  ExplorePlaceSlug,
} from "@/types/content";
import type {
  CustomTourState,
  PalaceKnowledgeEntry,
  PalaceKnowledgeQuizQuestion,
  TourBuilderInterest,
} from "@/types/ai-guide";
import type { AppLanguage } from "@/types/preferences";

type KnowledgeDetail = Omit<
  PalaceKnowledgeEntry,
  "routeIds" | "shortDescription"
>;

const sourceNote = {
  zh: "基于本项目内置的宫殿导览资料；需要更精确史实前应补充馆方或学术来源。",
  en: "Based on the local Palace in Motion guide content; add museum or academic sources before making more specific historical claims.",
};

function quiz(
  id: string,
  question: string,
  correct: string,
  wrongA: string,
  wrongB: string,
  explanation: string,
  stampLabel: string
): PalaceKnowledgeQuizQuestion {
  return {
    id,
    question: {
      zh: question,
      en: question,
    },
    options: [
      {
        id: "a",
        text: {
          zh: correct,
          en: correct,
        },
      },
      {
        id: "b",
        text: {
          zh: wrongA,
          en: wrongA,
        },
      },
      {
        id: "c",
        text: {
          zh: wrongB,
          en: wrongB,
        },
      },
    ],
    correctOptionId: "a",
    explanation: {
      zh: explanation,
      en: explanation,
    },
    stampLabel: {
      zh: stampLabel,
      en: stampLabel,
    },
  };
}

const knowledgeDetails: Record<ExplorePlaceSlug, KnowledgeDetail> = {
  "tianyi-men": {
    placeSlug: "tianyi-men",
    historyNote: {
      zh: "Tianyi Men is treated here as a garden threshold: a quieter entry point where trees, paving, and gate sequence slow the visitor before the deeper palace route.",
      en: "Tianyi Men is treated here as a garden threshold: a quieter entry point where trees, paving, and gate sequence slow the visitor before the deeper palace route.",
    },
    thingsToNotice: [
      {
        zh: "The shift from landscape shade into a more ordered architectural path.",
        en: "The shift from landscape shade into a more ordered architectural path.",
      },
      {
        zh: "The centered approach and small focal details that make the entrance feel guided.",
        en: "The centered approach and small focal details that make the entrance feel guided.",
      },
    ],
    quiz: [
      quiz(
        "tianyi-threshold",
        "What role does Tianyi Men play in this journey?",
        "It works as a calm threshold into the palace route.",
        "It is presented as the final ceremonial hall.",
        "It is only a decorative roof study.",
        "The local guide describes Tianyi Men as a transition from garden atmosphere into architecture.",
        "Garden Threshold"
      ),
    ],
    sourceNote,
    recommendedModes: ["short", "tourist", "fun"],
  },
  "taihe-dian": {
    placeSlug: "taihe-dian",
    historyNote: {
      zh: "Taihe Dian is the main ceremonial anchor of this experience, using forecourt scale, raised terraces, and layered rooflines to express outer-court order.",
      en: "Taihe Dian is the main ceremonial anchor of this experience, using forecourt scale, raised terraces, and layered rooflines to express outer-court order.",
    },
    thingsToNotice: [
      {
        zh: "The broad forecourt that makes the hall feel formal before the building itself is reached.",
        en: "The broad forecourt that makes the hall feel formal before the building itself is reached.",
      },
      {
        zh: "The roof hierarchy and raised base that signal ceremonial importance.",
        en: "The roof hierarchy and raised base that signal ceremonial importance.",
      },
    ],
    quiz: [
      quiz(
        "taihe-order",
        "What does Taihe Dian most strongly represent in this app?",
        "Outer-court ceremonial order and hierarchy.",
        "A hidden residential garden.",
        "A modern exhibition room.",
        "Its scale, roof hierarchy, and raised platform make it the clearest ceremonial anchor.",
        "Ceremonial Axis Explorer"
      ),
    ],
    sourceNote,
    recommendedModes: ["detailed", "tourist", "quiz"],
  },
  "zhonghe-dian": {
    placeSlug: "zhonghe-dian",
    historyNote: {
      zh: "Zhonghe Dian is used as an intermediate stop where the route compresses after the major forecourt, helping the visitor read sequence instead of only monumentality.",
      en: "Zhonghe Dian is used as an intermediate stop where the route compresses after the major forecourt, helping the visitor read sequence instead of only monumentality.",
    },
    thingsToNotice: [
      {
        zh: "How the route tightens after a larger ceremonial space.",
        en: "How the route tightens after a larger ceremonial space.",
      },
      {
        zh: "The way smaller scale can still support formal procession.",
        en: "The way smaller scale can still support formal procession.",
      },
    ],
    quiz: [
      quiz(
        "zhonghe-sequence",
        "Why is Zhonghe Dian useful in the route reading?",
        "It helps explain sequence and transition between larger halls.",
        "It removes the central-axis idea.",
        "It is unrelated to palace movement.",
        "The guide uses Zhonghe Dian to show how the ceremonial route changes pace between major stops.",
        "Sequence Reader"
      ),
    ],
    sourceNote,
    recommendedModes: ["short", "detailed", "quiz"],
  },
  "baohe-dian": {
    placeSlug: "baohe-dian",
    historyNote: {
      zh: "Baohe Dian closes the formal outer-court sequence in this journey, giving the route a broader ending after the central ceremonial halls.",
      en: "Baohe Dian closes the formal outer-court sequence in this journey, giving the route a broader ending after the central ceremonial halls.",
    },
    thingsToNotice: [
      {
        zh: "The open forecourt and how it lets the building read from a distance.",
        en: "The open forecourt and how it lets the building read from a distance.",
      },
      {
        zh: "Roofline composition as a visual marker of hierarchy.",
        en: "Roofline composition as a visual marker of hierarchy.",
      },
    ],
    quiz: [
      quiz(
        "baohe-closure",
        "What is Baohe Dian's route role here?",
        "It acts as a formal closing hall in the outer-court sequence.",
        "It starts the garden route only.",
        "It is used only for selfie mode.",
        "The route treats Baohe Dian as a broader final ceremonial stop before moving inward.",
        "Outer Court Finisher"
      ),
    ],
    sourceNote,
    recommendedModes: ["tourist", "detailed", "quiz"],
  },
  "qianqing-men": {
    placeSlug: "qianqing-men",
    historyNote: {
      zh: "Qianqing Men is presented as a charged red threshold where passage, gate leaves, and painted surfaces make the palace sequence feel more immediate.",
      en: "Qianqing Men is presented as a charged red threshold where passage, gate leaves, and painted surfaces make the palace sequence feel more immediate.",
    },
    thingsToNotice: [
      {
        zh: "The close red gate composition and sense of compression.",
        en: "The close red gate composition and sense of compression.",
      },
      {
        zh: "How threshold spaces separate public ceremony from more intimate palace areas.",
        en: "How threshold spaces separate public ceremony from more intimate palace areas.",
      },
    ],
    quiz: [
      quiz(
        "qianqing-threshold",
        "What should you notice first at Qianqing Men?",
        "The red gate threshold and its compressed passage feeling.",
        "A large garden pond.",
        "A detached mountain view.",
        "The local scene makes Qianqing Men feel like an intense passage point through doors and red walls.",
        "Threshold Keeper"
      ),
    ],
    sourceNote,
    recommendedModes: ["short", "fun", "tourist"],
  },
  "yangxin-dian": {
    placeSlug: "yangxin-dian",
    historyNote: {
      zh: "Yangxin Dian shifts the route toward inner-court life, emphasizing residence, governance, and a more intimate rhythm than the major outer-court halls.",
      en: "Yangxin Dian shifts the route toward inner-court life, emphasizing residence, governance, and a more intimate rhythm than the major outer-court halls.",
    },
    thingsToNotice: [
      {
        zh: "The more intimate scale compared with the formal outer-court halls.",
        en: "The more intimate scale compared with the formal outer-court halls.",
      },
      {
        zh: "The facade, courtyard, and daily-life cues rather than pure monumentality.",
        en: "The facade, courtyard, and daily-life cues rather than pure monumentality.",
      },
    ],
    quiz: [
      quiz(
        "yangxin-life",
        "Which theme best fits Yangxin Dian in this experience?",
        "Inner-court life and governance at a closer scale.",
        "Only garden scenery.",
        "Only a map marker with no story.",
        "Yangxin Dian is used to move from formal ceremony toward daily palace life.",
        "Inner Court Observer"
      ),
    ],
    sourceNote,
    recommendedModes: ["tourist", "child", "detailed"],
  },
  "jingren-gong": {
    placeSlug: "jingren-gong",
    historyNote: {
      zh: "Jingren Gong is framed as a quieter court where the visitor can read residence, facade rhythm, and smaller palace-scale detail.",
      en: "Jingren Gong is framed as a quieter court where the visitor can read residence, facade rhythm, and smaller palace-scale detail.",
    },
    thingsToNotice: [
      {
        zh: "The quieter court atmosphere and more domestic scale.",
        en: "The quieter court atmosphere and more domestic scale.",
      },
      {
        zh: "Facade rhythm, shadows, and courtyard edges.",
        en: "Facade rhythm, shadows, and courtyard edges.",
      },
    ],
    quiz: [
      quiz(
        "jingren-court",
        "How does Jingren Gong differ from the grand ceremonial halls?",
        "It feels quieter and closer to residential court life.",
        "It is presented as the biggest outer-court hall.",
        "It is only a bridge over water.",
        "The local guide uses Jingren Gong to show a calmer, smaller palace rhythm.",
        "Quiet Court Stamp"
      ),
    ],
    sourceNote,
    recommendedModes: ["short", "tourist", "quiz"],
  },
  "fengxian-dian": {
    placeSlug: "fengxian-dian",
    historyNote: {
      zh: "Fengxian Dian adds a devotional and ancestral layer to the inner-court route, balancing daily palace life with ritual memory.",
      en: "Fengxian Dian adds a devotional and ancestral layer to the inner-court route, balancing daily palace life with ritual memory.",
    },
    thingsToNotice: [
      {
        zh: "How the stop changes the route from residence toward ritual memory.",
        en: "How the stop changes the route from residence toward ritual memory.",
      },
      {
        zh: "The facade and court arrangement as a quieter ritual setting.",
        en: "The facade and court arrangement as a quieter ritual setting.",
      },
    ],
    quiz: [
      quiz(
        "fengxian-ritual",
        "What layer does Fengxian Dian add to the Inner Court Life route?",
        "Devotional and ancestral ritual memory.",
        "A playful garden-only stop.",
        "A modern shopping street.",
        "The guide positions Fengxian Dian as part of the route's residence and devotion theme.",
        "Ritual Memory Stamp"
      ),
    ],
    sourceNote,
    recommendedModes: ["detailed", "tourist", "quiz"],
  },
  "huangji-dian": {
    placeSlug: "huangji-dian",
    historyNote: {
      zh: "Huangji Dian is used as a bright longevity-court hall where forecourt width, columns, and rooflines create a steady ordered composition.",
      en: "Huangji Dian is used as a bright longevity-court hall where forecourt width, columns, and rooflines create a steady ordered composition.",
    },
    thingsToNotice: [
      {
        zh: "The sunlit forecourt and full facade.",
        en: "The sunlit forecourt and full facade.",
      },
      {
        zh: "Column rhythm and roofline as a stable visual order.",
        en: "Column rhythm and roofline as a stable visual order.",
      },
    ],
    quiz: [
      quiz(
        "huangji-bright",
        "What visual mood does Huangji Dian create here?",
        "A bright, steady, ordered forecourt atmosphere.",
        "A dark hidden passage.",
        "An underwater garden scene.",
        "The local content emphasizes the broad forecourt, facade, columns, and sunlit roof composition.",
        "Longevity Court Stamp"
      ),
    ],
    sourceNote,
    recommendedModes: ["fun", "tourist", "detailed"],
  },
  "shoukang-gong": {
    placeSlug: "shoukang-gong",
    historyNote: {
      zh: "Shoukang Gong is a softer residential court in this experience, useful for slowing the route and ending with light, shade, and calm.",
      en: "Shoukang Gong is a softer residential court in this experience, useful for slowing the route and ending with light, shade, and calm.",
    },
    thingsToNotice: [
      {
        zh: "Sunlit courtyard scale and a quieter closing mood.",
        en: "Sunlit courtyard scale and a quieter closing mood.",
      },
      {
        zh: "Tree shadow and reflected ground light as part of the palace atmosphere.",
        en: "Tree shadow and reflected ground light as part of the palace atmosphere.",
      },
    ],
    quiz: [
      quiz(
        "shoukang-calm",
        "Why is Shoukang Gong useful near the end of a route?",
        "It slows the experience with a calmer residential court.",
        "It returns to the loudest outer-court ceremony.",
        "It removes all courtyard atmosphere.",
        "The guide describes Shoukang Gong as a quiet, sunlit residential closing moment.",
        "Quiet Residence Stamp"
      ),
    ],
    sourceNote,
    recommendedModes: ["short", "child", "tourist"],
  },
};

const routeIdsByPlaceSlug = exploreExperience.places.reduce(
  (accumulator, place) => {
    accumulator[place.slug] = exploreExperience.journeys
      .filter((journey) => journey.placeOrder.includes(place.slug))
      .map((journey) => journey.id);

    return accumulator;
  },
  {} as Record<ExplorePlaceSlug, ExploreJourneyRouteId[]>
);

export const palaceKnowledgeEntries: PalaceKnowledgeEntry[] =
  exploreExperience.places.map((place) => ({
    ...knowledgeDetails[place.slug],
    shortDescription: place.shortDescription,
    routeIds: routeIdsByPlaceSlug[place.slug] ?? [],
  }));

const palaceKnowledgeByPlaceSlug = new Map(
  palaceKnowledgeEntries.map((entry) => [entry.placeSlug, entry])
);

export function getPalaceKnowledgeByPlaceSlug(
  placeSlug: ExplorePlaceSlug | null | undefined
) {
  return placeSlug ? palaceKnowledgeByPlaceSlug.get(placeSlug) ?? null : null;
}

export function getQuizQuestionForPlace(
  placeSlug: ExplorePlaceSlug | null | undefined
) {
  return getPalaceKnowledgeByPlaceSlug(placeSlug)?.quiz[0] ?? null;
}

export function getPalaceKnowledgeForRoute(
  routeId: ExploreJourneyRouteId | null | undefined
) {
  if (!routeId) {
    return [];
  }

  return palaceKnowledgeEntries.filter((entry) => entry.routeIds.includes(routeId));
}

const interestPlaceOrder: Record<TourBuilderInterest, ExplorePlaceSlug[]> = {
  architecture: [
    "taihe-dian",
    "zhonghe-dian",
    "baohe-dian",
    "huangji-dian",
    "qianqing-men",
  ],
  history: [
    "taihe-dian",
    "qianqing-men",
    "yangxin-dian",
    "fengxian-dian",
    "huangji-dian",
  ],
  gardens: [
    "tianyi-men",
    "shoukang-gong",
    "jingren-gong",
    "yangxin-dian",
  ],
  photography: [
    "tianyi-men",
    "taihe-dian",
    "qianqing-men",
    "huangji-dian",
    "shoukang-gong",
  ],
  overview: [
    "tianyi-men",
    "taihe-dian",
    "yangxin-dian",
    "qianqing-men",
    "shoukang-gong",
  ],
};

function getStopCount(timeBudget: 5 | 10 | 20) {
  if (timeBudget === 5) {
    return 2;
  }

  if (timeBudget === 10) {
    return 4;
  }

  return 5;
}

function getInterestLabel(interest: TourBuilderInterest, language: AppLanguage) {
  const labels: Record<TourBuilderInterest, { zh: string; en: string }> = {
    architecture: { zh: "建筑", en: "Architecture" },
    history: { zh: "历史", en: "History" },
    gardens: { zh: "园林", en: "Gardens" },
    photography: { zh: "摄影", en: "Photography" },
    overview: { zh: "快速总览", en: "Quick overview" },
  };

  return pickLocalizedText(labels[interest], language);
}

function mergeInterestStops(interests: TourBuilderInterest[]) {
  const selectedInterests = interests.length ? interests : ["overview" as const];
  const orderedStops: ExplorePlaceSlug[] = [];

  selectedInterests.forEach((interest) => {
    interestPlaceOrder[interest].forEach((placeSlug) => {
      if (!orderedStops.includes(placeSlug)) {
        orderedStops.push(placeSlug);
      }
    });
  });

  return orderedStops;
}

function getPlaceTitle(placeSlug: ExplorePlaceSlug, language: AppLanguage) {
  const place = exploreExperience.places.find(
    (candidate): candidate is ExplorePlace => candidate.slug === placeSlug
  );

  return pickLocalizedText(place?.title, language);
}

export function buildCustomTourRecommendation({
  timeBudget,
  interests,
  language,
}: {
  timeBudget: 5 | 10 | 20;
  interests: TourBuilderInterest[];
  language: AppLanguage;
}): CustomTourState {
  const normalizedInterests: TourBuilderInterest[] = interests.length
    ? interests
    : ["overview"];
  const orderedPlaceSlugs = mergeInterestStops(normalizedInterests).slice(
    0,
    getStopCount(timeBudget)
  );
  const interestLabels = normalizedInterests.map((interest) =>
    getInterestLabel(interest, language)
  );
  const stopTitles = orderedPlaceSlugs.map((placeSlug) =>
    getPlaceTitle(placeSlug, language)
  );
  const title =
    language === "zh"
      ? `${timeBudget} 分钟智能故宫路线`
      : `${timeBudget}-minute smart palace tour`;
  const explanation =
    language === "zh"
      ? `这条本地导览路线优先考虑${interestLabels.join("、")}，并把 ${timeBudget} 分钟内的站点数量控制在合理范围：${stopTitles.join(" -> ")}。`
      : `This local guide route prioritizes ${interestLabels.join(", ")} and keeps the stop count realistic for ${timeBudget} minutes: ${stopTitles.join(" -> ")}.`;

  return {
    id: `custom-${timeBudget}-${normalizedInterests.join("-")}-${Date.now()}`,
    title,
    timeBudget,
    interests: normalizedInterests,
    orderedPlaceSlugs,
    explanation,
    currentStopIndex: 0,
    createdAt: Date.now(),
  };
}
