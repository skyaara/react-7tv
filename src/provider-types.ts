import type { ReactNode } from "react";
import type { EmoteCollection, SevenTVEmote, SevenTVStatus, SevenTVSyntax } from "./types";

export interface SevenTVContextValue {
  readonly emotes: ReadonlyMap<string, SevenTVEmote>;
  readonly status: SevenTVStatus;
  readonly error: Error | null;
  readonly syntax: SevenTVSyntax;
  readonly animated: boolean;
  readonly getEmote: (name: string) => SevenTVEmote | undefined;
}

export interface SevenTVProviderProps {
  readonly children: ReactNode;
  /** Controlled emotes. When supplied, no network request is made. */
  readonly emotes?: EmoteCollection;
  /** A 7TV emote-set id, or `global` for the global set. */
  readonly emoteSetId?: string;
  /** Emotes rendered before a remote request completes; useful for SSR hydration. */
  readonly initialEmotes?: EmoteCollection;
  readonly syntax?: SevenTVSyntax;
  /** Whether animated assets should play. Defaults to true. */
  readonly animated?: boolean;
  readonly apiBaseUrl?: string;
  readonly fetch?: typeof globalThis.fetch;
  readonly onError?: (error: Error) => void;
}
