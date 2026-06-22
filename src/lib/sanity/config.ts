const DEFAULT_SANITY_PROJECT_ID = "nw880jmc";
const DEFAULT_SANITY_DATASET = "production";
const DEFAULT_SANITY_API_VERSION = "v1";

export function getSanityProjectId(): string {
  return process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || DEFAULT_SANITY_PROJECT_ID;
}

export function getSanityDataset(): string {
  return process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || DEFAULT_SANITY_DATASET;
}

export function getSanityApiVersion(): string {
  return process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || DEFAULT_SANITY_API_VERSION;
}

export function getSanityReadToken(): string | undefined {
  const token = process.env.SANITY_READ_TOKEN?.trim();
  return token || undefined;
}

export function isSanityConfigured(): boolean {
  return Boolean(getSanityProjectId() && getSanityDataset());
}
