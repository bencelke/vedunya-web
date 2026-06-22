import {
  getSanityApiVersion,
  getSanityDataset,
  getSanityProjectId,
  isSanityConfigured,
} from "../src/lib/sanity/config";
import { sanityCatalogSchema } from "../src/features/courses/schemas/course-schema";

const LIBRARY_ITEMS_GROQ = `*[_type == "libraryItem" && published == true && type == "course"] | order(sortOrder asc) {
  "id": coalesce(slug.current, _id),
  "slug": slug.current,
  titleEn,
  titleRu,
  excerptEn,
  excerptRu,
  accessType,
  "productId": coalesce(productId, revenueCatProductId),
  lessonCount,
  published,
  isComingSoon
}`;

async function main() {
  const configured = isSanityConfigured();
  let reachable = false;
  let catalogDocumentCount = 0;
  let livingTheRunesFound = false;

  if (configured) {
    const projectId = getSanityProjectId();
    const dataset = getSanityDataset();
    const apiVersion = getSanityApiVersion();
    const token = process.env.SANITY_READ_TOKEN?.trim();
    const url = new URL(
      `https://${projectId}.api.sanity.io/${apiVersion}/data/query/${dataset}`,
    );
    url.searchParams.set("query", LIBRARY_ITEMS_GROQ);

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) {
        const json = (await response.json()) as { result?: unknown };
        const parsed = sanityCatalogSchema.safeParse(json.result);
        if (parsed.success) {
          reachable = true;
          catalogDocumentCount = parsed.data.length;
          livingTheRunesFound = parsed.data.some(
            (item) => item.slug === "living-the-runes",
          );
        }
      }
    } catch {
      reachable = false;
    }
  }

  console.log(
    JSON.stringify(
      {
        configured,
        reachable,
        catalogDocumentCount,
        livingTheRunesFound,
        projectIdPresent: Boolean(getSanityProjectId()),
        dataset: getSanityDataset(),
      },
      null,
      2,
    ),
  );
}

main();
