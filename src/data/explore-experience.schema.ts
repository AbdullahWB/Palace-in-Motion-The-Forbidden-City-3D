import { z } from "zod";

const bilingualTextSchema = z.object({
  zh: z.string().min(1),
  en: z.string().min(1),
});

const placeSlugSchema = z.enum([
  "tianyi-men",
  "yangxin-dian",
  "fengxian-dian",
  "qianqing-men",
  "huangji-dian",
  "shoukang-gong",
  "taihe-dian",
  "zhonghe-dian",
  "baohe-dian",
  "jingren-gong",
]);

const journeyRouteIdSchema = z.enum([
  "ceremonial-axis",
  "inner-court-life",
  "garden-quiet-spaces",
]);

const explorePlacePhotoSchema = z.object({
  id: z.string().min(1),
  src: z.string().min(1),
  alt: bilingualTextSchema,
  caption: bilingualTextSchema,
  depth: z.number(),
});

const explorePlaceSchema = z.object({
  slug: placeSlugSchema,
  title: bilingualTextSchema,
  badgeLabel: bilingualTextSchema,
  shortDescription: bilingualTextSchema,
  longDescription: bilingualTextSchema,
  markerPosition: z.object({
    x: z.number(),
    y: z.number(),
  }),
  coverSrc: z.string().min(1),
  defaultPhotoId: z.string().min(1),
  gallery: z.array(explorePlacePhotoSchema).min(1),
});

const exploreJourneySchema = z.object({
  id: journeyRouteIdSchema,
  title: bilingualTextSchema,
  description: bilingualTextSchema,
  intro: bilingualTextSchema,
  coverSrc: z.string().min(1),
  accent: z.string().min(1),
  placeOrder: z.array(placeSlugSchema).min(1),
});

const passportSealSchema = z.object({
  id: z.string().min(1),
  routeId: journeyRouteIdSchema,
  title: bilingualTextSchema,
  description: bilingualTextSchema,
  accent: z.string().min(1),
});

export const exploreExperienceSchema = z
  .object({
    welcome: z.object({
      id: z.string().min(1),
      heroSrc: z.string().min(1),
      heroVideoSrc: z.string().min(1),
      heroVideoPosterSrc: z.string().optional(),
      title: bilingualTextSchema,
      subtitle: bilingualTextSchema,
      ctaLabel: bilingualTextSchema,
    }),
    map: z.object({
      imageSrc: z.string().min(1),
      alt: bilingualTextSchema,
      minScale: z.number().positive(),
      maxScale: z.number().positive(),
      initialScale: z.number().positive(),
      markers: z.array(
        z.object({
          placeSlug: placeSlugSchema,
          x: z.number(),
          y: z.number(),
          label: bilingualTextSchema,
        })
      ),
    }),
    journeys: z.array(exploreJourneySchema).min(1),
    passport: z.object({
      title: bilingualTextSchema,
      subtitle: bilingualTextSchema,
      placeCollectionLabel: bilingualTextSchema,
      routeSealsLabel: bilingualTextSchema,
      visitedSummaryLabel: bilingualTextSchema,
      completedSummaryLabel: bilingualTextSchema,
      completedLabel: bilingualTextSchema,
      resetLabel: bilingualTextSchema,
      closeLabel: bilingualTextSchema,
      routeSeals: z.array(passportSealSchema).min(1),
    }),
    places: z.array(explorePlaceSchema).min(1),
  })
  .superRefine((data, context) => {
    const placeSlugs = new Set(data.places.map((place) => place.slug));
    const journeyIds = new Set(data.journeys.map((journey) => journey.id));

    for (const place of data.places) {
      if (!place.gallery.some((photo) => photo.id === place.defaultPhotoId)) {
        context.addIssue({
          code: "custom",
          path: ["places", place.slug, "defaultPhotoId"],
          message: `Default photo "${place.defaultPhotoId}" does not exist in gallery.`,
        });
      }
    }

    for (const marker of data.map.markers) {
      if (!placeSlugs.has(marker.placeSlug)) {
        context.addIssue({
          code: "custom",
          path: ["map", "markers", marker.placeSlug],
          message: `Map marker references missing place "${marker.placeSlug}".`,
        });
      }
    }

    for (const journey of data.journeys) {
      for (const placeSlug of journey.placeOrder) {
        if (!placeSlugs.has(placeSlug)) {
          context.addIssue({
            code: "custom",
            path: ["journeys", journey.id, "placeOrder"],
            message: `Journey references missing place "${placeSlug}".`,
          });
        }
      }
    }

    for (const seal of data.passport.routeSeals) {
      if (!journeyIds.has(seal.routeId)) {
        context.addIssue({
          code: "custom",
          path: ["passport", "routeSeals", seal.id],
          message: `Passport seal references missing route "${seal.routeId}".`,
        });
      }
    }
  });
