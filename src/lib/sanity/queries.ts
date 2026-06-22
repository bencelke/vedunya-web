export const LIBRARY_ITEMS_GROQ = `*[_type == "libraryItem" && published == true && type == "course"] | order(sortOrder asc) {
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

export const COURSE_BY_SLUG_GROQ = `*[_type == "libraryItem" && slug.current == $slug][0] {
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
