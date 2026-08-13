import type { EmoteCollection, SevenTVEmote } from "./types";

export function createEmoteMap(
  collection: EmoteCollection,
): ReadonlyMap<string, SevenTVEmote> {
  if (collection instanceof Map) {
    return new Map(collection);
  }

  const map = new Map<string, SevenTVEmote>();
  for (const item of collection) {
    if (Array.isArray(item)) {
      const [name, emote] = item;
      map.set(name, emote);
    } else {
      map.set(item.name, item);
    }
  }
  return map;
}

export const EMPTY_EMOTE_MAP: ReadonlyMap<string, SevenTVEmote> = new Map();
