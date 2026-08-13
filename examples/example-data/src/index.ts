import type { SevenTVEmote } from "react-7tv-wrapper/core";

const sizes = [1, 2, 3, 4] as const;

function files(
  animated: boolean,
  dimensions: readonly [number, number] = [32, 32],
) {
  return sizes.flatMap((scale) => [
    {
      name: `${scale}x.webp`,
      staticName: animated ? `${scale}x_static.webp` : `${scale}x.webp`,
      width: dimensions[0] * scale,
      height: dimensions[1] * scale,
      frameCount: animated ? 5 : 1,
      format: "WEBP" as const,
    },
    ...(animated
      ? [
          {
            name: `${scale}x.gif`,
            staticName: `${scale}x_static.gif`,
            width: dimensions[0] * scale,
            height: dimensions[1] * scale,
            frameCount: 5,
            format: "GIF" as const,
          },
        ]
      : []),
  ]);
}

/** A tiny deterministic subset of 7TV's global set for demos and SSR fallbacks. */
export const demoEmotes = [
  {
    id: "01FCY771D800007PQ2DF3GDTN6",
    name: "RainTime",
    flags: 1,
    animated: true,
    hostUrl: "https://cdn.7tv.app/emote/01FCY771D800007PQ2DF3GDTN6",
    files: files(true),
  },
  {
    id: "01FE3XY508000AA32JP519W2EW",
    name: "PETPET",
    flags: 1,
    animated: true,
    hostUrl: "https://cdn.7tv.app/emote/01FE3XY508000AA32JP519W2EW",
    files: files(true),
  },
  {
    id: "01GB2TN09G000AZXHZ8HNEZX6G",
    name: "Clap2",
    flags: 0,
    animated: true,
    hostUrl: "https://cdn.7tv.app/emote/01GB2TN09G000AZXHZ8HNEZX6G",
    files: files(true, [22, 32]),
  },
  {
    id: "01GAZ199Z8000FEWHS6AT5QZV0",
    name: "peepoHappy",
    flags: 0,
    animated: false,
    hostUrl: "https://cdn.7tv.app/emote/01GAZ199Z8000FEWHS6AT5QZV0",
    files: files(false),
  },
  {
    id: "01FKSDK14G0008TM5NY9QEG0QV",
    name: "PartyParrot",
    flags: 0,
    animated: true,
    hostUrl: "https://cdn.7tv.app/emote/01FKSDK14G0008TM5NY9QEG0QV",
    files: files(true),
  },
  {
    id: "01GB2ZJFBG000DTBJYANG8XYFP",
    name: "AlienDance",
    flags: 0,
    animated: true,
    hostUrl: "https://cdn.7tv.app/emote/01GB2ZJFBG000DTBJYANG8XYFP",
    files: files(true),
  },
  {
    id: "01G98V5RFG0001CD052SPS435F",
    name: "GuitarTime",
    flags: 0,
    animated: true,
    hostUrl: "https://cdn.7tv.app/emote/01G98V5RFG0001CD052SPS435F",
    files: files(true, [28, 32]),
  },
  {
    id: "01J107C3E8000DX4MZBQSYGRXS",
    name: "sevenTV",
    flags: 0,
    animated: true,
    hostUrl: "https://cdn.7tv.app/emote/01J107C3E8000DX4MZBQSYGRXS",
    files: files(true, [49, 32]),
  },
  {
    id: "01GB32XE6R00018VJGJ4A9BNCV",
    name: "AYAYA",
    flags: 0,
    animated: false,
    hostUrl: "https://cdn.7tv.app/emote/01GB32XE6R00018VJGJ4A9BNCV",
    files: files(false, [33, 32]),
  },
  {
    id: "01GB4CK01800090V9B3D8CGEEX",
    name: "EZ",
    flags: 0,
    animated: false,
    hostUrl: "https://cdn.7tv.app/emote/01GB4CK01800090V9B3D8CGEEX",
    files: files(false),
  },
] satisfies readonly SevenTVEmote[];
