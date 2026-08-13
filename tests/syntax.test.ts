import { describe, expect, it } from "vitest";
import { createEmoteMap, delimitedSyntax, tokenizeText } from "../src";
import { kappa, wave } from "./fixtures";

const emotes = createEmoteMap([kappa, wave]);

describe("tokenizeText", () => {
  it("matches plain aliases next to punctuation without matching substrings", () => {
    const tokens = tokenizeText("Kappa! MyKappaValue Wave", emotes);

    expect(tokens).toEqual([
      { type: "emote", value: "Kappa", emote: kappa },
      { type: "text", value: "! MyKappaValue " },
      { type: "emote", value: "Wave", emote: wave },
    ]);
  });

  it("supports configurable delimiters and preserves unknown aliases", () => {
    const tokens = tokenizeText(
      "Hello :Wave: and :Missing:",
      emotes,
      delimitedSyntax(":", ":"),
    );

    expect(tokens).toEqual([
      { type: "text", value: "Hello " },
      { type: "emote", value: ":Wave:", emote: wave },
      { type: "text", value: " and :Missing:" },
    ]);
  });

  it("can match case-insensitively", () => {
    const tokens = tokenizeText("kApPa", emotes, {
      type: "plain",
      caseSensitive: false,
    });

    expect(tokens).toEqual([{ type: "emote", value: "kApPa", emote: kappa }]);
  });

  it("selects the longest alias that has valid boundaries", () => {
    const excited = { ...kappa, id: "excited", name: "Kappa!" };
    const overlapping = createEmoteMap([kappa, excited]);

    expect(tokenizeText("Kappa! Kappa!x", overlapping)).toEqual([
      { type: "emote", value: "Kappa!", emote: excited },
      { type: "text", value: " " },
      { type: "emote", value: "Kappa", emote: kappa },
      { type: "text", value: "!x" },
    ]);
  });

  it("matches Unicode aliases without splitting surrogate pairs", () => {
    const unicode = { ...wave, id: "unicode", name: "👋Wave" };
    expect(
      tokenizeText("Hi 👋wave!", createEmoteMap([unicode]), {
        type: "plain",
        caseSensitive: false,
      }),
    ).toEqual([
      { type: "text", value: "Hi " },
      { type: "emote", value: "👋wave", emote: unicode },
      { type: "text", value: "!" },
    ]);
  });

  it("supports fully custom tokenizers", () => {
    const tokens = tokenizeText("anything", emotes, {
      type: "custom",
      tokenize: (_text, { findEmote }) => [
        { type: "emote", value: "custom", emote: findEmote("Wave")! },
      ],
    });

    expect(tokens[0]).toMatchObject({ type: "emote", value: "custom" });
  });
});
