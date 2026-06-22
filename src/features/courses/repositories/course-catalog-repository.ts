import "server-only";

import { sanityCatalogSchema } from "@/features/courses/schemas/course-schema";
import type { SanityCatalogItem } from "@/features/courses/schemas/course-schema";
import { createSanityClient } from "@/lib/sanity/client";
import { LIBRARY_ITEMS_GROQ } from "@/lib/sanity/queries";

export async function fetchSanityCourseCatalog(): Promise<SanityCatalogItem[]> {
  const client = createSanityClient();
  if (!client) {
    return [];
  }

  try {
    const result = await client.fetch<unknown>(LIBRARY_ITEMS_GROQ, {}, {
      timeout: 8000,
    });
    const parsed = sanityCatalogSchema.safeParse(result);
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export { mergeCourseCatalog } from "@/features/courses/services/merge-course-catalog";
