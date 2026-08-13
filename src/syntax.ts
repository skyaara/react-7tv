import type {
  EmoteToken,
  SevenTVEmote,
  SevenTVSyntax,
  SevenTVToken,
} from "./types";

interface TrieNode {
  readonly children: Map<string, TrieNode>;
  emote?: SevenTVEmote;
}

const plainTrieCache = new WeakMap<
  ReadonlyMap<string, SevenTVEmote>,
  Map<boolean, TrieNode>
>();

export const DEFAULT_SYNTAX: SevenTVSyntax = {
  type: "plain",
  caseSensitive: true,
  boundary: "punctuation",
};

export function delimitedSyntax(
  prefix: string,
  suffix = prefix,
  options: Omit<
    Extract<SevenTVSyntax, { type: "delimited" }>,
    "type" | "prefix" | "suffix"
  > = {},
): SevenTVSyntax {
  if (!prefix || !suffix) {
    throw new TypeError("Emote delimiters cannot be empty");
  }
  return { type: "delimited", prefix, suffix, ...options };
}

function appendText(tokens: SevenTVToken[], value: string): void {
  if (!value) return;
  const previous = tokens[tokens.length - 1];
  if (previous?.type === "text") {
    tokens[tokens.length - 1] = { type: "text", value: previous.value + value };
  } else {
    tokens.push({ type: "text", value });
  }
}

function createFinder(
  emotes: ReadonlyMap<string, SevenTVEmote>,
  caseSensitive: boolean,
): (name: string) => SevenTVEmote | undefined {
  if (caseSensitive) return (name) => emotes.get(name);

  const folded = new Map<string, SevenTVEmote>();
  for (const [name, emote] of emotes) {
    const key = name.toLocaleLowerCase();
    if (!folded.has(key)) folded.set(key, emote);
  }
  return (name) => folded.get(name.toLocaleLowerCase());
}

function normalize(value: string, caseSensitive: boolean): string {
  return caseSensitive ? value : value.toLocaleLowerCase();
}

function createPlainTrie(
  emotes: ReadonlyMap<string, SevenTVEmote>,
  caseSensitive: boolean,
): TrieNode {
  let variants = plainTrieCache.get(emotes);
  const cached = variants?.get(caseSensitive);
  if (cached) return cached;

  const root: TrieNode = { children: new Map() };
  for (const [name, emote] of emotes) {
    if (!name) continue;
    let node = root;
    for (const character of normalize(name, caseSensitive)) {
      let child = node.children.get(character);
      if (!child) {
        child = { children: new Map() };
        node.children.set(character, child);
      }
      node = child;
    }
    // Case-insensitive aliases can collide. Map insertion order is deterministic,
    // so the first alias wins consistently.
    node.emote ??= emote;
  }

  variants ??= new Map();
  variants.set(caseSensitive, root);
  plainTrieCache.set(emotes, variants);
  return root;
}

function isWhitespace(value: string | undefined): boolean {
  return value === undefined || /\s/u.test(value);
}

function isWordCharacter(value: string | undefined): boolean {
  return value !== undefined && /[\p{L}\p{N}_]/u.test(value);
}

function tokenizePlain(
  text: string,
  emotes: ReadonlyMap<string, SevenTVEmote>,
  syntax: Exclude<SevenTVSyntax, { type: "delimited" | "custom" }>,
): readonly SevenTVToken[] {
  const caseSensitive = syntax.caseSensitive ?? true;
  const boundary = syntax.boundary ?? "punctuation";

  if (text.length === 0 || emotes.size === 0) {
    return text ? [{ type: "text", value: text }] : [];
  }

  const trie = createPlainTrie(emotes, caseSensitive);
  const tokens: SevenTVToken[] = [];
  let emittedCursor = 0;

  for (let start = 0; start < text.length; ) {
    const before = start === 0 ? undefined : text[start - 1];
    const validStart = boundary === "whitespace"
      ? isWhitespace(before)
      : !isWordCharacter(before);
    let bestMatch: { readonly end: number; readonly emote: SevenTVEmote } | null =
      null;

    if (validStart) {
      let node: TrieNode | undefined = trie;
      let cursor = start;
      while (cursor < text.length && node) {
        const codePoint = text.codePointAt(cursor);
        if (codePoint === undefined) break;
        const character = String.fromCodePoint(codePoint);

        for (const normalizedCharacter of normalize(character, caseSensitive)) {
          node = node?.children.get(normalizedCharacter);
          if (!node) break;
        }
        if (!node) break;

        cursor += character.length;
        if (node.emote) {
          const after = cursor === text.length ? undefined : text[cursor];
          const validEnd = boundary === "whitespace"
            ? isWhitespace(after)
            : !isWordCharacter(after);
          if (validEnd) bestMatch = { end: cursor, emote: node.emote };
        }
      }
    }

    if (bestMatch) {
      appendText(tokens, text.slice(emittedCursor, start));
      const matchedText = text.slice(start, bestMatch.end);
      const emote = bestMatch.emote;
      const token: EmoteToken = { type: "emote", value: matchedText, emote };
      tokens.push(token);
      start = bestMatch.end;
      emittedCursor = bestMatch.end;
    } else {
      const codePoint = text.codePointAt(start);
      start += codePoint !== undefined && codePoint > 0xffff ? 2 : 1;
    }
  }

  appendText(tokens, text.slice(emittedCursor));
  return tokens;
}

function tokenizeDelimited(
  text: string,
  emotes: ReadonlyMap<string, SevenTVEmote>,
  syntax: Extract<SevenTVSyntax, { type: "delimited" }>,
): readonly SevenTVToken[] {
  if (!syntax.prefix || !syntax.suffix) {
    throw new TypeError("Emote delimiters cannot be empty");
  }

  const find = createFinder(emotes, syntax.caseSensitive ?? true);
  const tokens: SevenTVToken[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const start = text.indexOf(syntax.prefix, cursor);
    if (start < 0) break;
    const contentStart = start + syntax.prefix.length;
    const end = text.indexOf(syntax.suffix, contentStart);
    if (end < 0) break;

    const rawName = text.slice(contentStart, end);
    const name = syntax.trim ? rawName.trim() : rawName;
    const emote = find(name);
    const tokenEnd = end + syntax.suffix.length;

    if (emote) {
      appendText(tokens, text.slice(cursor, start));
      tokens.push({
        type: "emote",
        value: text.slice(start, tokenEnd),
        emote,
      });
      cursor = tokenEnd;
    } else {
      appendText(tokens, text.slice(cursor, tokenEnd));
      cursor = tokenEnd;
    }
  }

  appendText(tokens, text.slice(cursor));
  return tokens;
}

export function tokenizeText(
  text: string,
  emotes: ReadonlyMap<string, SevenTVEmote>,
  syntax: SevenTVSyntax = DEFAULT_SYNTAX,
): readonly SevenTVToken[] {
  if (syntax.type === "custom") {
    const findEmote = createFinder(emotes, true);
    return syntax.tokenize(text, { emotes, findEmote });
  }
  if (syntax.type === "delimited") {
    return tokenizeDelimited(text, emotes, syntax);
  }
  return tokenizePlain(text, emotes, syntax);
}
