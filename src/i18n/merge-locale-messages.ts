export type MessageTree = Record<string, unknown>;

function isPlainObject(value: unknown): value is MessageTree {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Deep-merge locale messages over English so missing keys fall back safely. */
export function mergeLocaleMessages(
  base: MessageTree,
  override: MessageTree,
): MessageTree {
  const result: MessageTree = { ...base };

  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = mergeLocaleMessages(
        result[key] as MessageTree,
        value as MessageTree,
      );
    } else {
      result[key] = value;
    }
  }

  return result;
}
