import type { ReactNode } from "react";

export type SevenTVImageFormat = "AVIF" | "WEBP" | "GIF" | "PNG";

export interface SevenTVEmoteFile {
  readonly name: string;
  readonly staticName?: string;
  readonly width: number;
  readonly height: number;
  readonly frameCount: number;
  readonly size?: number;
  readonly format: SevenTVImageFormat | (string & {});
}

/** A renderer-friendly, API-version-independent representation of a 7TV emote. */
export interface SevenTVEmote {
  readonly id: string;
  /** The alias typed by the user. This may differ from the emote's canonical name. */
  readonly name: string;
  readonly flags: number;
  readonly animated: boolean;
  readonly hostUrl: string;
  readonly files: readonly SevenTVEmoteFile[];
}

export type EmoteCollection =
  | ReadonlyMap<string, SevenTVEmote>
  | readonly SevenTVEmote[]
  | Iterable<SevenTVEmote>;

export interface TextToken {
  readonly type: "text";
  readonly value: string;
}

export interface EmoteToken {
  readonly type: "emote";
  readonly value: string;
  readonly emote: SevenTVEmote;
}

export type SevenTVToken = TextToken | EmoteToken;

export interface TokenizerContext {
  readonly emotes: ReadonlyMap<string, SevenTVEmote>;
  readonly findEmote: (name: string) => SevenTVEmote | undefined;
}

export type SevenTVTokenizer = (
  text: string,
  context: TokenizerContext,
) => readonly SevenTVToken[];

export interface PlainSyntax {
  readonly type?: "plain";
  /** Defaults to true. */
  readonly caseSensitive?: boolean;
  /**
   * `punctuation` matches `Kappa!` but not `MyKappaValue`.
   * `whitespace` requires whitespace (or the start/end of the string) on both sides.
   */
  readonly boundary?: "punctuation" | "whitespace";
}

export interface DelimitedSyntax {
  readonly type: "delimited";
  readonly prefix: string;
  readonly suffix: string;
  /** Defaults to true. */
  readonly caseSensitive?: boolean;
  /** Trim whitespace inside delimiters before resolving the emote. Defaults to false. */
  readonly trim?: boolean;
}

export interface CustomSyntax {
  readonly type: "custom";
  readonly tokenize: SevenTVTokenizer;
}

export type SevenTVSyntax = PlainSyntax | DelimitedSyntax | CustomSyntax;

export type SevenTVStatus = "idle" | "loading" | "ready" | "error";

export interface RenderEmoteInfo {
  readonly matchedText: string;
  readonly index: number;
}

export type RenderEmote = (
  emote: SevenTVEmote,
  info: RenderEmoteInfo,
) => ReactNode;
