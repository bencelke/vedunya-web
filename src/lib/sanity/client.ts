import "server-only";

import { createClient, type SanityClient } from "@sanity/client";

import {
  getSanityApiVersion,
  getSanityDataset,
  getSanityProjectId,
  getSanityReadToken,
  isSanityConfigured,
} from "@/lib/sanity/config";

export function createSanityClient(): SanityClient | null {
  if (!isSanityConfigured()) {
    return null;
  }

  return createClient({
    projectId: getSanityProjectId(),
    dataset: getSanityDataset(),
    apiVersion: getSanityApiVersion(),
    useCdn: false,
    token: getSanityReadToken(),
  });
}
