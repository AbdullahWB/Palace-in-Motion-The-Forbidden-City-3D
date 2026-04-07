import type {
  BilingualText,
  ExploreExperienceData,
  ExplorePlace,
  ExplorePlacePhoto,
  ExplorePlaceSlug,
  ExploreSearchState,
} from "@/types/content";

function copy(zh: string, en: string): BilingualText {
  return { zh, en };
}

function buildPhoto(
  id: string,
  src: string,
  zhCaption: string,
  enCaption: string,
  depth: number
): ExplorePlacePhoto {
  return {
    id,
    src,
    alt: copy(zhCaption, enCaption),
    caption: copy(zhCaption, enCaption),
    depth,
  };
}

const exploreAssetBase = "/explore";

const tianyiSceneA = `${exploreAssetBase}/places/tianyi-men/scene-a.svg`;
const tianyiSceneB = `${exploreAssetBase}/places/tianyi-men/scene-b.svg`;
const yangxinSceneA = `${exploreAssetBase}/places/yangxin-dian/scene-a.svg`;
const yangxinSceneB = `${exploreAssetBase}/places/yangxin-dian/scene-b.svg`;
const fengxianSceneA = `${exploreAssetBase}/places/fengxian-dian/scene-a.svg`;
const fengxianSceneB = `${exploreAssetBase}/places/fengxian-dian/scene-b.svg`;
const qianqingSceneA = `${exploreAssetBase}/places/qianqing-men/scene-a.svg`;
const qianqingSceneB = `${exploreAssetBase}/places/qianqing-men/scene-b.svg`;
const huangjiSceneA = `${exploreAssetBase}/places/huangji-dian/scene-a.svg`;
const huangjiSceneB = `${exploreAssetBase}/places/huangji-dian/scene-b.svg`;
const shoukangSceneA = `${exploreAssetBase}/places/shoukang-gong/scene-a.svg`;
const shoukangSceneB = `${exploreAssetBase}/places/shoukang-gong/scene-b.svg`;

const explorePlaces: ExplorePlace[] = [
  {
    slug: "tianyi-men",
    title: copy("\u5929\u4e00\u95e8", "Tianyi Men"),
    badgeLabel: copy("\u7ecf\u4ece\u82b1\u56ed\u5165\u5883", "Garden threshold"),
    shortDescription: copy(
      "\u4e00\u5904\u88ab\u6811\u51a0\u5305\u56f4\u7684\u5b89\u9759\u5165\u53e3\uff0c\u9002\u5408\u7528\u4f5c\u63a2\u7d22\u6545\u5bab\u6df1\u5904\u7684\u7b2c\u4e00\u6b65\u3002",
      "A quiet threshold wrapped by tall cypress canopies, suited to opening a calmer path into the deeper palace grounds."
    ),
    longDescription: copy(
      "\u5929\u4e00\u95e8\u88ab\u8bbe\u8ba1\u6210\u4e00\u4e2a\u7531\u666f\u89c2\u8f6c\u5411\u5efa\u7b51\u7684\u8fc7\u6e21\u70b9\u3002\u6811\u5f71\u3001\u5730\u9762\u8f74\u7ebf\u548c\u4e2d\u95f4\u5c0f\u54c1\u96d5\u5851\u8ba9\u7a7a\u95f4\u8bfb\u8d77\u6765\u66f4\u50cf\u4e00\u4e2a\u88ab\u5f15\u5bfc\u8fdb\u5165\u7684\u82b1\u56ed\u95e8\u5e8f\u3002\u5728\u6b64\u7248\u4e2d\uff0c\u5b83\u662f\u6b22\u8fce\u7528\u6237\u8fdb\u5165\u6545\u5bab\u63a2\u7d22\u8def\u5f84\u7684\u67d4\u548c\u8d77\u70b9\u3002",
      "Tianyi Men acts as a transition from landscape into architecture. Tree shadows, axial paving, and a centered sculptural focal point make the scene feel like a guided garden threshold. In this version it serves as a soft welcoming entry into the palace exploration path."
    ),
    markerPosition: { x: 62, y: 74 },
    coverSrc: tianyiSceneA,
    defaultPhotoId: "tianyi-1",
    gallery: [
      buildPhoto(
        "tianyi-1",
        tianyiSceneA,
        "\u5929\u4e00\u95e8\u5168\u666f\u89c6\u89d2",
        "Wide view of Tianyi Men",
        0.2
      ),
      buildPhoto(
        "tianyi-2",
        tianyiSceneB,
        "\u6797\u95f4\u95e8\u9053\u89d2\u5ea6",
        "Tree-lined approach angle",
        0.34
      ),
      buildPhoto(
        "tianyi-3",
        tianyiSceneA,
        "\u8f74\u7ebf\u6b65\u9053\u7ec4\u56fe",
        "Axial walkway composition",
        0.18
      ),
      buildPhoto(
        "tianyi-4",
        tianyiSceneB,
        "\u82b1\u56ed\u5165\u5883\u7ec4\u56fe",
        "Garden-entry composition",
        0.3
      ),
    ],
  },
  {
    slug: "yangxin-dian",
    title: copy("\u517b\u5fc3\u6bbf", "Yangxin Dian"),
    badgeLabel: copy("\u5bab\u5ef7\u65e5\u5e38\u4e4b\u6240", "Imperial daily chamber"),
    shortDescription: copy(
      "\u7ea2\u5899\u3001\u91d1\u5f69\u548c\u7b80\u6d01\u9662\u843d\u7ec4\u6210\u4e00\u4e2a\u66f4\u8fd1\u8ddd\u79bb\u7684\u5185\u5ef7\u7a7a\u95f4\u3002",
      "Red walls, gilded detail, and a compact court produce a more intimate inner-palace atmosphere."
    ),
    longDescription: copy(
      "\u517b\u5fc3\u6bbf\u7684\u5370\u8c61\u4e0d\u662f\u5f00\u9604\u5de8\u5927\uff0c\u800c\u662f\u4eb2\u8fd1\u4e14\u88ab\u4ec0\u7ec6\u7ec4\u88c5\u7684\u79e9\u5e8f\u3002\u8f83\u5c0f\u7684\u5ead\u9662\u3001\u538b\u7f29\u7684\u524d\u573a\u548c\u6b63\u95e8\u5f62\u6210\u4e00\u79cd\u66f4\u63a5\u8fd1\u5bab\u5ef7\u751f\u6d3b\u7684\u89c2\u89c9\u7ecf\u9a8c\u3002\u8fd9\u4e2a\u865a\u62df\u7248\u7528\u5b83\u4f5c\u4e3a\u5185\u5ef7\u7cfb\u5217\u573a\u6240\u7684\u4ee3\u8868\u3002",
      "Yangxin Dian reads less as monumental spectacle and more as intimate, tightly assembled order. The smaller forecourt and compressed frontal composition shift the experience toward palace life rather than grand ceremony. Here it stands in for the inner-court domestic sequence."
    ),
    markerPosition: { x: 54, y: 60 },
    coverSrc: yangxinSceneA,
    defaultPhotoId: "yangxin-1",
    gallery: [
      buildPhoto(
        "yangxin-1",
        yangxinSceneA,
        "\u517b\u5fc3\u6bbf\u6b63\u9762",
        "Front view of Yangxin Dian",
        0.24
      ),
      buildPhoto(
        "yangxin-2",
        yangxinSceneB,
        "\u9662\u843d\u5165\u53e3\u8fd1\u89c6",
        "Closer courtyard entrance",
        0.32
      ),
      buildPhoto(
        "yangxin-3",
        yangxinSceneA,
        "\u5bb6\u5e38\u5ead\u9662\u89d2\u5ea6",
        "Domestic court angle",
        0.2
      ),
    ],
  },
  {
    slug: "fengxian-dian",
    title: copy("\u5949\u5148\u6bbf", "Fengxian Dian"),
    badgeLabel: copy("\u5b97\u5e99\u6c14\u8c61", "Ancestral hall tone"),
    shortDescription: copy(
      "\u5f88\u5f3a\u7684\u5bf9\u79f0\u548c\u53f0\u57fa\u6bd4\u4f8b\u8ba9\u5b83\u8bfb\u8d77\u6765\u66f4\u6b63\u5f0f\uff0c\u4e5f\u66f4\u5b89\u9759\u3002",
      "Strong symmetry and a raised plinth give it a more formal and composed reading."
    ),
    longDescription: copy(
      "\u5949\u5148\u6bbf\u7684\u5f62\u8c61\u66f4\u6ce8\u91cd\u89c2\u8005\u5bf9\u6b63\u9762\u7684\u51dd\u89c6\u3002\u53f0\u57fa\u548c\u680f\u6746\u5c06\u4eba\u7684\u8def\u7ebf\u5f15\u5411\u4e2d\u5fc3\uff0c\u540c\u65f6\u4fdd\u7559\u51b7\u9759\u7a33\u5b9a\u7684\u5b97\u5e99\u6c14\u8d28\u3002\u8fd9\u91cc\u7684\u865a\u62df\u5185\u5bb9\u7528\u6765\u4f53\u73b0\u6545\u5bab\u4e2d\u66f4\u80c3\u6b63\u548c\u5b97\u5e99\u611f\u7684\u5efa\u7b51\u4e00\u9762\u3002",
      "Fengxian Dian emphasizes sustained frontal viewing. The terrace and railings guide the visitor toward the center while preserving a calm ancestral-hall atmosphere. In this dummy set it represents the more solemn, temple-like side of the Forbidden City."
    ),
    markerPosition: { x: 48, y: 44 },
    coverSrc: fengxianSceneA,
    defaultPhotoId: "fengxian-1",
    gallery: [
      buildPhoto(
        "fengxian-1",
        fengxianSceneA,
        "\u5949\u5148\u6bbf\u53f0\u57fa\u7ec4\u56fe",
        "Fengxian Dian plinth composition",
        0.3
      ),
      buildPhoto(
        "fengxian-2",
        fengxianSceneB,
        "\u8f74\u7ebf\u6b63\u9762\u89d2\u5ea6",
        "Axial front-facing angle",
        0.22
      ),
    ],
  },
  {
    slug: "qianqing-men",
    title: copy("\u4e7e\u6e05\u95e8", "Qianqing Men"),
    badgeLabel: copy("\u7ea2\u95e8\u4e0e\u8fc7\u6e21", "Threshold of red gates"),
    shortDescription: copy(
      "\u9760\u8fd1\u95e8\u53f6\u7684\u7ea2\u8272\u7ec4\u56fe\u8ba9\u7a7a\u95f4\u66f4\u5177\u538b\u8feb\u611f\uff0c\u4e5f\u66f4\u6e32\u67d3\u901a\u8fc7\u4e4b\u610f\u3002",
      "A near-door red composition makes the view tighter and more charged, emphasizing passage and threshold."
    ),
    longDescription: copy(
      "\u4e7e\u6e05\u95e8\u7684\u4f53\u9a8c\u91cd\u70b9\u4e0d\u5728\u5f00\u9614\u89c6\u91ce\uff0c\u800c\u5728\u95e8\u6247\u3001\u7ea2\u5899\u548c\u88c5\u9970\u7ec6\u8282\u5e26\u6765\u7684\u5f3a\u5ea6\u3002\u5728\u573a\u666f\u4e2d\uff0c\u5b83\u88ab\u5904\u7406\u6210\u4e00\u4e2a\u66f4\u7d27\u5bc6\u7684\u901a\u884c\u70b9\uff0c\u8ba9\u4eba\u5bf9\u6545\u5bab\u95e8\u5e8f\u7684\u5c42\u7ea7\u611f\u6709\u66f4\u76f4\u63a5\u7684\u611f\u53d7\u3002",
      "Qianqing Men is less about broad view and more about the intensity of painted doors, red walls, and decorative detail. In the dummy experience it becomes a tighter passage point that makes palace thresholds feel immediate and layered."
    ),
    markerPosition: { x: 55, y: 30 },
    coverSrc: qianqingSceneA,
    defaultPhotoId: "qianqing-1",
    gallery: [
      buildPhoto(
        "qianqing-1",
        qianqingSceneA,
        "\u4e7e\u6e05\u95e8\u95e8\u53f6\u8fd1\u89c6",
        "Close view of Qianqing Men doors",
        0.38
      ),
      buildPhoto(
        "qianqing-2",
        qianqingSceneB,
        "\u8d70\u9053\u5f0f\u900f\u89c6",
        "Walk-through perspective",
        0.26
      ),
      buildPhoto(
        "qianqing-3",
        qianqingSceneA,
        "\u8d64\u7ea2\u95e8\u5e8f\u7ec4\u56fe",
        "Crimson gate sequence",
        0.34
      ),
      buildPhoto(
        "qianqing-4",
        qianqingSceneB,
        "\u95e8\u5185\u89d2\u5ea6",
        "Inner threshold angle",
        0.2
      ),
    ],
  },
  {
    slug: "huangji-dian",
    title: copy("\u7687\u6781\u6bbf", "Huangji Dian"),
    badgeLabel: copy("\u5bff\u5bab\u6b63\u5ead", "Longevity court hall"),
    shortDescription: copy(
      "\u5f00\u9614\u7684\u524d\u573a\u548c\u51e0\u4e4e\u6ee1\u5e45\u7684\u5efa\u7b51\u7acb\u9762\u8ba9\u5b83\u663e\u5f97\u6e29\u6696\u3001\u660e\u4eae\u4e14\u7a33\u91cd\u3002",
      "A broad forecourt and almost full-width facade make the hall feel bright, warm, and steady."
    ),
    longDescription: copy(
      "\u7687\u6781\u6bbf\u5728\u6b64\u7248\u7684\u4f5c\u7528\u662f\u5448\u73b0\u53e6\u4e00\u79cd\u5f00\u655e\u7684\u5ba4\u5916\u6b63\u5ead\u4f53\u9a8c\u3002\u89c2\u8005\u7acb\u5728\u5f00\u9614\u524d\u573a\uff0c\u4f1a\u66f4\u76f4\u63a5\u5730\u89c2\u5bdf\u5c4b\u6a90\u3001\u67f1\u5217\u548c\u5730\u9762\u8f74\u7ebf\u5171\u540c\u5efa\u7acb\u7684\u7a7a\u95f4\u79e9\u5e8f\u3002",
      "Huangji Dian represents a brighter, more open forecourt experience. From the wide apron, the viewer can read the eaves, colonnade, and central paving as a single ordered composition."
    ),
    markerPosition: { x: 63, y: 22 },
    coverSrc: huangjiSceneA,
    defaultPhotoId: "huangji-1",
    gallery: [
      buildPhoto(
        "huangji-1",
        huangjiSceneA,
        "\u7687\u6781\u6bbf\u5b8f\u89c2\u89c6\u89d2",
        "Wide view of Huangji Dian",
        0.18
      ),
      buildPhoto(
        "huangji-2",
        huangjiSceneB,
        "\u7acb\u9762\u53ca\u67f1\u5217",
        "Facade and column rhythm",
        0.28
      ),
      buildPhoto(
        "huangji-3",
        huangjiSceneA,
        "\u524d\u573a\u8f74\u7ebf\u7ec4\u56fe",
        "Forecourt axial composition",
        0.2
      ),
      buildPhoto(
        "huangji-4",
        huangjiSceneB,
        "\u660e\u4eae\u5c4b\u9762\u7ec4\u56fe",
        "Sunlit roof composition",
        0.26
      ),
      buildPhoto(
        "huangji-5",
        huangjiSceneA,
        "\u5bff\u5bab\u6c14\u8c61\u7ec4\u56fe",
        "Longevity-court atmosphere",
        0.22
      ),
    ],
  },
  {
    slug: "shoukang-gong",
    title: copy("\u5bff\u5eb7\u5bab", "Shoukang Gong"),
    badgeLabel: copy("\u5b89\u9759\u5e74\u5c45\u9662\u843d", "Quiet residential court"),
    shortDescription: copy(
      "\u9633\u5149\u4e0b\u7684\u5ead\u9662\u6bd4\u8f83\u5b89\u9759\uff0c\u66f4\u50cf\u662f\u7ed3\u675f\u63a2\u7d22\u65f6\u7684\u6536\u675f\u573a\u6240\u3002",
      "This quieter sunlit court feels more residential and works well as a softer closing place in the route."
    ),
    longDescription: copy(
      "\u5bff\u5eb7\u5bab\u4ee5\u6bd4\u8f83\u5e73\u7f13\u7684\u573a\u666f\u5c3a\u5ea6\u548c\u5145\u8db3\u7684\u65e5\u7167\u663e\u5f97\u683c\u5916\u6e29\u548c\u3002\u5b83\u9002\u5408\u5728\u8def\u5f84\u672b\u7aef\u63d0\u4f9b\u4e00\u4e2a\u66f4\u9759\u7684\u89c2\u89c6\u7ed3\u5c3e\uff0c\u4e5f\u8ba9\u7ec4\u56fe\u4e2d\u7684\u6811\u5f71\u548c\u5730\u9762\u53cd\u5149\u6709\u66f4\u5927\u7684\u8868\u73b0\u7a7a\u95f4\u3002",
      "Shoukang Gong is intentionally softer in scale and brighter in light. It works as a quiet closing moment in the route, giving tree shadow and reflected ground light a larger role in the spatial impression."
    ),
    markerPosition: { x: 35, y: 18 },
    coverSrc: shoukangSceneA,
    defaultPhotoId: "shoukang-1",
    gallery: [
      buildPhoto(
        "shoukang-1",
        shoukangSceneA,
        "\u5bff\u5eb7\u5bab\u6b63\u9662",
        "Main court of Shoukang Gong",
        0.24
      ),
      buildPhoto(
        "shoukang-2",
        shoukangSceneB,
        "\u65e5\u7167\u56de\u5eca\u89d2\u5ea6",
        "Sunlit corridor angle",
        0.3
      ),
    ],
  },
];

export const exploreExperience: ExploreExperienceData = {
  welcome: {
    id: "palace-open-view",
    heroSrc: `${exploreAssetBase}/welcome/open-courtyard.svg`,
    title: copy("\u5165\u5883\u6545\u5bab", "Enter the Palace"),
    subtitle: copy(
      "\u4ece\u4e00\u5904\u5f00\u9614\u89c6\u91ce\u5f00\u59cb\uff0c\u6253\u5f00\u5bab\u57ce\u5730\u56fe\uff0c\u7136\u540e\u9009\u62e9\u4f60\u60f3\u6df1\u5165\u7684\u4e3b\u8981\u573a\u6240\u3002",
      "Begin from a calm open-place view, open the palace map, and then step into the main spaces you want to explore."
    ),
    ctaLabel: copy("\u6253\u5f00\u5bab\u57ce\u5730\u56fe", "Open palace map"),
  },
  map: {
    imageSrc: `${exploreAssetBase}/map/palace-map.svg`,
    alt: copy(
      "\u865a\u62df\u6545\u5bab\u5e73\u9762\u5bfc\u89c8\u5730\u56fe",
      "Dummy palace plan map for the explore overlay"
    ),
    minScale: 0.8,
    maxScale: 2.2,
    initialScale: 1,
    markers: explorePlaces.map((place) => ({
      placeSlug: place.slug,
      x: place.markerPosition.x,
      y: place.markerPosition.y,
      label: place.title,
    })),
  },
  places: explorePlaces,
};

const placeSlugSet = new Set<ExplorePlaceSlug>(explorePlaces.map((place) => place.slug));

export function isExplorePlaceSlug(value: string | null | undefined): value is ExplorePlaceSlug {
  return value ? placeSlugSet.has(value as ExplorePlaceSlug) : false;
}

export function getExplorePlaceBySlug(placeSlug: ExplorePlaceSlug | null | undefined) {
  return explorePlaces.find((place) => place.slug === placeSlug) ?? null;
}

function firstString(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

export function getExplorePhotoById(
  place: ExplorePlace | null | undefined,
  photoId: string | null | undefined
) {
  if (!place) {
    return null;
  }

  return (
    place.gallery.find((photo) => photo.id === photoId) ??
    place.gallery.find((photo) => photo.id === place.defaultPhotoId) ??
    place.gallery[0] ??
    null
  );
}

export function normalizeExploreSearchState(
  searchParams: Record<string, string | string[] | undefined>
): ExploreSearchState {
  const requestedView = firstString(searchParams.view);
  const requestedPlace = firstString(searchParams.place);
  const requestedPhoto = firstString(searchParams.photo);

  if (requestedView === "map") {
    return {
      view: "map",
      placeSlug: null,
      photoId: null,
    };
  }

  if (requestedView === "place" && isExplorePlaceSlug(requestedPlace)) {
    const place = getExplorePlaceBySlug(requestedPlace);
    const activePhoto = getExplorePhotoById(place, requestedPhoto);

    return {
      view: "place",
      placeSlug: place?.slug ?? null,
      photoId: activePhoto?.id ?? null,
    };
  }

  return {
    view: "welcome",
    placeSlug: null,
    photoId: null,
  };
}
