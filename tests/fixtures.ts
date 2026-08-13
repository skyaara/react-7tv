import type { SevenTVEmoteModel } from "../src";

export const kappa: SevenTVEmoteModel = {
  id: "01KAPPA",
  name: "Kappa",
  flags: 0,
  animated: false,
  hostUrl: "https://cdn.7tv.app/emote/01KAPPA",
  files: [
    {
      name: "1x.webp",
      staticName: "1x_static.webp",
      width: 32,
      height: 32,
      frameCount: 1,
      format: "WEBP",
    },
    {
      name: "2x.webp",
      staticName: "2x_static.webp",
      width: 64,
      height: 64,
      frameCount: 1,
      format: "WEBP",
    },
  ],
};

export const wave: SevenTVEmoteModel = {
  ...kappa,
  id: "01WAVE",
  name: "Wave",
  animated: true,
  files: kappa.files.map((file) => ({ ...file, frameCount: 12 })),
};
