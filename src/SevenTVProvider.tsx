import { useEffect, useMemo, useRef, useState } from "react";
import { fetchEmoteSet } from "./api";
import { createEmoteMap, EMPTY_EMOTE_MAP } from "./collection";
import { SevenTVContext } from "./context";
import type { SevenTVProviderProps } from "./provider-types";
import { DEFAULT_SYNTAX } from "./syntax";
import type { SevenTVEmote, SevenTVStatus } from "./types";

interface RemoteState {
  readonly emoteSetId: string;
  readonly emotes: ReadonlyMap<string, SevenTVEmote>;
  readonly status: SevenTVStatus;
  readonly error: Error | null;
}

function asError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

export function SevenTVProvider({
  children,
  emotes: controlledEmotes,
  emoteSetId,
  initialEmotes,
  syntax = DEFAULT_SYNTAX,
  animated = true,
  apiBaseUrl,
  fetch: fetchImplementation,
  onError,
}: SevenTVProviderProps): React.JSX.Element {
  const initialMap = useMemo(
    () => (initialEmotes ? createEmoteMap(initialEmotes) : EMPTY_EMOTE_MAP),
    [initialEmotes],
  );
  const controlledMap = useMemo(
    () => (controlledEmotes ? createEmoteMap(controlledEmotes) : null),
    [controlledEmotes],
  );
  const [remote, setRemote] = useState<RemoteState>({
    emoteSetId: emoteSetId ?? "",
    emotes: initialMap,
    status: emoteSetId ? "loading" : initialEmotes ? "ready" : "idle",
    error: null,
  });
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (controlledMap || !emoteSetId) return;

    const controller = new AbortController();
    setRemote((current) => ({
      emoteSetId,
      emotes: current.emoteSetId === emoteSetId ? current.emotes : initialMap,
      status: "loading",
      error: null,
    }));

    void fetchEmoteSet(emoteSetId, {
      signal: controller.signal,
      ...(fetchImplementation ? { fetch: fetchImplementation } : {}),
      ...(apiBaseUrl ? { apiBaseUrl } : {}),
    })
      .then((nextEmotes) => {
        if (!controller.signal.aborted) {
          setRemote({
            emoteSetId,
            emotes: createEmoteMap(nextEmotes),
            status: "ready",
            error: null,
          });
        }
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        const error = asError(reason);
        setRemote((current) =>
          current.emoteSetId === emoteSetId
            ? { ...current, status: "error", error }
            : current,
        );
        onErrorRef.current?.(error);
      });

    return () => controller.abort();
  }, [apiBaseUrl, controlledMap, emoteSetId, fetchImplementation, initialMap]);

  const hasCurrentRemote = Boolean(emoteSetId) && remote.emoteSetId === emoteSetId;
  const emotes =
    controlledMap ??
    (hasCurrentRemote ? remote.emotes : initialMap);
  const status: SevenTVStatus = controlledMap
    ? "ready"
    : !emoteSetId
      ? initialEmotes
        ? "ready"
        : "idle"
      : hasCurrentRemote
        ? remote.status
        : "loading";
  const error = controlledMap || !hasCurrentRemote ? null : remote.error;

  const value = useMemo(
    () => ({
      emotes,
      status,
      error,
      syntax,
      animated,
      getEmote: (name: string) => emotes.get(name),
    }),
    [animated, emotes, error, status, syntax],
  );

  return (
    <SevenTVContext.Provider value={value}>{children}</SevenTVContext.Provider>
  );
}
