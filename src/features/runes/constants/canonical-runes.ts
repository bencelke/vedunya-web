import type { CanonicalRuneId } from "@/features/runes/types/rune";

/** Stable insertion order — matches Flutter `runeKeys` / `allRunes`. */
export const CANONICAL_RUNE_ORDER: readonly CanonicalRuneId[] = [
  "fehu",
  "uruz",
  "thurisaz",
  "ansuz",
  "raido",
  "kenaz",
  "gebo",
  "wunjo",
  "hagalaz",
  "nauthiz",
  "isa",
  "jera",
  "eihwaz",
  "perthro",
  "algiz",
  "sowilo",
  "tiwaz",
  "berkano",
  "ehwaz",
  "mannaz",
  "laguz",
  "ingwaz",
  "dagaz",
  "othala",
] as const;

export const RUNE_COUNT = CANONICAL_RUNE_ORDER.length;

export type CanonicalRuneDefinition = {
  id: CanonicalRuneId;
  index: number;
  displayNameEn: string;
  displayNameRu: string;
  assetPath: string;
  unicodeGlyph: string;
  aliases: readonly string[];
};

const UNICODE: Record<CanonicalRuneId, string> = {
  fehu: "\u16A0",
  uruz: "\u16A2",
  thurisaz: "\u16A6",
  ansuz: "\u16A8",
  raido: "\u16B1",
  kenaz: "\u16B2",
  gebo: "\u16B3",
  wunjo: "\u16B9",
  hagalaz: "\u16BA",
  nauthiz: "\u16BE",
  isa: "\u16C1",
  jera: "\u16C3",
  eihwaz: "\u16C7",
  perthro: "\u16C8",
  algiz: "\u16C9",
  sowilo: "\u16CA",
  tiwaz: "\u16CF",
  berkano: "\u16D2",
  ehwaz: "\u16D6",
  mannaz: "\u16D7",
  laguz: "\u16DA",
  ingwaz: "\u16DC",
  dagaz: "\u16DE",
  othala: "\u16DF",
};

const NAMES_EN: Record<CanonicalRuneId, string> = {
  fehu: "Fehu",
  uruz: "Uruz",
  thurisaz: "Thurisaz",
  ansuz: "Ansuz",
  raido: "Raido",
  kenaz: "Kenaz",
  gebo: "Gebo",
  wunjo: "Wunjo",
  hagalaz: "Hagalaz",
  nauthiz: "Nauthiz",
  isa: "Isa",
  jera: "Jera",
  eihwaz: "Eihwaz",
  perthro: "Perthro",
  algiz: "Algiz",
  sowilo: "Sowilo",
  tiwaz: "Tiwaz",
  berkano: "Berkano",
  ehwaz: "Ehwaz",
  mannaz: "Mannaz",
  laguz: "Laguz",
  ingwaz: "Ingwaz",
  dagaz: "Dagaz",
  othala: "Othala",
};

const NAMES_RU: Record<CanonicalRuneId, string> = {
  fehu: "Феху",
  uruz: "Уруз",
  thurisaz: "Турисаз",
  ansuz: "Ансуз",
  raido: "Райдо",
  kenaz: "Кеназ",
  gebo: "Гебо",
  wunjo: "Вуньо",
  hagalaz: "Хагалаз",
  nauthiz: "Наутиз",
  isa: "Иса",
  jera: "Йера",
  eihwaz: "Эйваз",
  perthro: "Перт",
  algiz: "Альгиз",
  sowilo: "Соулу",
  tiwaz: "Тейваз",
  berkano: "Беркана",
  ehwaz: "Эваз",
  mannaz: "Манназ",
  laguz: "Лагуз",
  ingwaz: "Ингваз",
  dagaz: "Дагаз",
  othala: "Отал",
};

export const CANONICAL_RUNES: readonly CanonicalRuneDefinition[] =
  CANONICAL_RUNE_ORDER.map((id, index) => ({
    id,
    index,
    displayNameEn: NAMES_EN[id],
    displayNameRu: NAMES_RU[id],
    assetPath: `/assets/runes/symbols/${id}.svg`,
    unicodeGlyph: UNICODE[id],
    aliases: [],
  }));

export const CANONICAL_RUNE_BY_ID = Object.fromEntries(
  CANONICAL_RUNES.map((rune) => [rune.id, rune]),
) as Record<CanonicalRuneId, CanonicalRuneDefinition>;

export const RUNES_COLLECTION = "runes";
