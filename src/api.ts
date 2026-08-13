import type { SevenTVEmote, SevenTVEmoteFile } from "./types";

export const SEVEN_TV_API_BASE_URL = "https://7tv.io/v3";

export class SevenTVApiError extends Error {
  public readonly status: number;
  public readonly url: string;

  public constructor(message: string, status: number, url: string) {
    super(message);
    this.name = "SevenTVApiError";
    this.status = status;
    this.url = url;
  }
}

export interface FetchEmoteSetOptions {
  readonly signal?: AbortSignal;
  readonly fetch?: typeof globalThis.fetch;
  readonly apiBaseUrl?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeHostUrl(url: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  if (/^https?:\/\//u.test(url)) return url;
  return `https://${url.replace(/^\/+/, "")}`;
}

function parseFile(value: unknown): SevenTVEmoteFile | undefined {
  if (!isRecord(value)) return undefined;

  const name = asString(value.name);
  const format = asString(value.format);
  if (!name || !format) return undefined;

  const staticName = asString(value.static_name);
  const size = asNumber(value.size, -1);

  return {
    name,
    ...(staticName ? { staticName } : {}),
    width: asNumber(value.width),
    height: asNumber(value.height),
    frameCount: asNumber(value.frame_count, 1),
    ...(size >= 0 ? { size } : {}),
    format,
  };
}

function parseEmote(value: unknown): SevenTVEmote | undefined {
  if (!isRecord(value)) return undefined;

  const data = value.data;
  if (!isRecord(data)) return undefined;

  const host = data.host;
  if (!isRecord(host) || !Array.isArray(host.files)) return undefined;

  const id = asString(value.id) ?? asString(data.id);
  const name = asString(value.name) ?? asString(data.name);
  const hostUrl = asString(host.url);
  const files = host.files.flatMap((file) => {
    const parsed = parseFile(file);
    return parsed ? [parsed] : [];
  });

  if (!id || !name || !hostUrl || files.length === 0) return undefined;

  return {
    id,
    name,
    flags: asNumber(value.flags),
    animated:
      data.animated === true || files.some((file) => file.frameCount > 1),
    hostUrl: normalizeHostUrl(hostUrl),
    files,
  };
}

export function parseEmoteSetResponse(value: unknown): readonly SevenTVEmote[] {
  if (!isRecord(value) || !Array.isArray(value.emotes)) {
    throw new TypeError("Invalid 7TV emote-set response: missing emotes array");
  }

  return value.emotes.flatMap((emote) => {
    const parsed = parseEmote(emote);
    return parsed ? [parsed] : [];
  });
}

export async function fetchEmoteSet(
  emoteSetId: string,
  options: FetchEmoteSetOptions = {},
): Promise<readonly SevenTVEmote[]> {
  const id = emoteSetId.trim();
  if (!id) throw new TypeError("emoteSetId cannot be empty");

  const request = options.fetch ?? globalThis.fetch;
  if (typeof request !== "function") {
    throw new TypeError(
      "No fetch implementation is available. Pass options.fetch in this environment.",
    );
  }

  const baseUrl = (options.apiBaseUrl ?? SEVEN_TV_API_BASE_URL).replace(
    /\/+$/u,
    "",
  );
  const url = `${baseUrl}/emote-sets/${encodeURIComponent(id)}`;
  const response = await request(url, {
    headers: { Accept: "application/json" },
    ...(options.signal ? { signal: options.signal } : {}),
  });

  if (!response.ok) {
    throw new SevenTVApiError(
      `7TV request failed with ${response.status} ${response.statusText}`,
      response.status,
      url,
    );
  }

  return parseEmoteSetResponse(await response.json());
}
