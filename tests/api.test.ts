import { describe, expect, it, vi } from "vitest";
import { fetchEmoteSet, parseEmoteSetResponse } from "../src";
import type { SevenTVApiError } from "../src";

const payload = {
  emotes: [
    {
      id: "id-1",
      name: "Alias",
      flags: 1,
      data: {
        id: "id-1",
        name: "Original",
        animated: true,
        host: {
          url: "//cdn.7tv.app/emote/id-1",
          files: [
            {
              name: "1x.webp",
              static_name: "1x_static.webp",
              width: 32,
              height: 32,
              frame_count: 10,
              size: 100,
              format: "WEBP",
            },
          ],
        },
      },
    },
  ],
};

describe("7TV API adapter", () => {
  it("normalizes aliases, CDN URLs, files, and animation metadata", () => {
    expect(parseEmoteSetResponse(payload)).toEqual([
      {
        id: "id-1",
        name: "Alias",
        flags: 1,
        animated: true,
        hostUrl: "https://cdn.7tv.app/emote/id-1",
        files: [
          {
            name: "1x.webp",
            staticName: "1x_static.webp",
            width: 32,
            height: 32,
            frameCount: 10,
            size: 100,
            format: "WEBP",
          },
        ],
      },
    ]);
  });

  it("fetches an encoded emote-set id", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      fetchEmoteSet("global/test", { fetch: request }),
    ).resolves.toHaveLength(1);
    expect(request).toHaveBeenCalledWith(
      "https://7tv.io/v3/emote-sets/global%2Ftest",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
  });

  it("throws a typed error for unsuccessful responses", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, { status: 404, statusText: "Not Found" }),
    );

    await expect(fetchEmoteSet("missing", { fetch: request })).rejects.toEqual(
      expect.objectContaining<Partial<SevenTVApiError>>({
        name: "SevenTVApiError",
        status: 404,
      }),
    );
  });
});
