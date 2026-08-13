import { demoEmotes } from "@react-7tv-wrapper/example-data";
import { useMemo, useRef, useState } from "react";
import {
  createEmoteMap,
  delimitedSyntax,
  SevenTVEmote,
  SevenTVProvider,
  SevenTVText,
  tokenizeText,
  type SevenTVSyntax,
} from "react-7tv-wrapper";

type Mode = "plain" | "colon" | "bracket";

const syntaxByMode: Record<Mode, SevenTVSyntax> = {
  plain: { type: "plain", caseSensitive: true },
  colon: delimitedSyntax(":"),
  bracket: delimitedSyntax("[emote:", "]", { trim: true }),
};

const initialByMode: Record<Mode, string> = {
  plain: "RainTime Shipping on Friday? PETPET Absolutely.",
  colon: ":RainTime: Shipping on Friday? :PETPET: Absolutely.",
  bracket:
    "[emote: RainTime] Shipping on Friday? [emote: PETPET] Absolutely.",
};

const labels: Record<Mode, string> = {
  plain: "Plain",
  colon: ":colon:",
  bracket: "[bracket]",
};

export function Playground(): React.JSX.Element {
  const [mode, setMode] = useState<Mode>("plain");
  const [message, setMessage] = useState(initialByMode.plain);
  const [animated, setAnimated] = useState(true);
  const [query, setQuery] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const syntax = useMemo(() => syntaxByMode[mode], [mode]);
  const emoteMap = useMemo(() => createEmoteMap(demoEmotes), []);
  const matches = useMemo(
    () =>
      tokenizeText(message, emoteMap, syntax).filter(
        (token) => token.type === "emote",
      ),
    [emoteMap, message, syntax],
  );
  const uniqueMatches = useMemo(
    () => [...new Set(matches.map((token) => token.emote.name))],
    [matches],
  );
  const visibleEmotes = useMemo(() => {
    const folded = query.trim().toLocaleLowerCase();
    if (!folded) return demoEmotes;
    return demoEmotes.filter((emote) =>
      emote.name.toLocaleLowerCase().includes(folded),
    );
  }, [query]);

  function switchMode(next: Mode): void {
    setMode(next);
    setMessage(initialByMode[next]);
  }

  function insertEmote(name: string): void {
    const value =
      mode === "plain"
        ? name
        : mode === "colon"
          ? `:${name}:`
          : `[emote: ${name}]`;
    const editor = editorRef.current;

    setMessage((current) => {
      const start = editor?.selectionStart ?? current.length;
      const end = editor?.selectionEnd ?? current.length;
      const before = current.slice(0, start);
      const after = current.slice(end);
      const leadingSpace = before.length > 0 && !/\s$/u.test(before) ? " " : "";
      const trailingSpace = after.length === 0 || !/^\s/u.test(after) ? " " : "";
      const inserted = `${leadingSpace}${value}${trailingSpace}`;
      const nextCaret = start + inserted.length;

      window.requestAnimationFrame(() => {
        editor?.focus();
        editor?.setSelectionRange(nextCaret, nextCaret);
      });

      return `${before}${inserted}${after}`;
    });
  }

  return (
    <SevenTVProvider emotes={demoEmotes} syntax={syntax} animated={animated}>
      <div className="lab-shell">
        <div className="lab-chrome">
          <div className="lab-title">
            <span className="pulse" />
            Live text lab
          </div>
          <div className="syntax-tabs" role="tablist" aria-label="Emote syntax">
            {(Object.keys(labels) as Mode[]).map((name) => (
              <button
                type="button"
                role="tab"
                aria-selected={mode === name}
                key={name}
                onClick={() => switchMode(name)}
              >
                {labels[name]}
              </button>
            ))}
          </div>
          <label className="animation-toggle">
            <span>Motion</span>
            <input
              type="checkbox"
              checked={animated}
              onChange={(event) => setAnimated(event.currentTarget.checked)}
            />
            <i />
          </label>
        </div>

        <div className="lab-grid">
          <label className="editor-pane">
            <span className="pane-label">Input text</span>
            <textarea
              ref={editorRef}
              value={message}
              rows={5}
              spellCheck={false}
              onChange={(event) => setMessage(event.currentTarget.value)}
            />
            <div className="composer-stats" aria-live="polite">
              <span>{matches.length} matched</span>
              <span>{uniqueMatches.length} unique</span>
              <span>{message.length} chars</span>
            </div>
          </label>
          <div className="output-pane">
            <span className="pane-label">React output</span>
            <SevenTVText as="p">{message}</SevenTVText>
            <span className="format-note">
              {animated ? "animated WebP" : "static fallback"} · responsive srcSet
            </span>
          </div>
        </div>

        <div className="emote-browser">
          <div className="browser-head">
            <div>
              <span className="pane-label">Find + insert an emote</span>
              <div className="match-list" aria-label="Matched emotes">
                {uniqueMatches.length > 0 ? (
                  uniqueMatches.map((name) => <span key={name}>✓ {name}</span>)
                ) : (
                  <span className="empty-match">No emotes matched yet</span>
                )}
              </div>
            </div>
            <label>
              <span className="pane-label">Search aliases</span>
              <input
                type="search"
                value={query}
                aria-label="Search emote aliases"
                placeholder="Search RainTime…"
                onChange={(event) => setQuery(event.currentTarget.value)}
              />
            </label>
          </div>
          <div className="emote-picker">
            {visibleEmotes.length > 0 ? (
              visibleEmotes.map((emote) => (
                <button
                  type="button"
                  key={emote.id}
                  title={`Insert ${emote.name}`}
                  onClick={() => insertEmote(emote.name)}
                >
                  <SevenTVEmote
                    emote={emote}
                    animated={animated}
                    size={1}
                  />
                  <span>{emote.name}</span>
                </button>
              ))
            ) : (
              <p className="empty-picker">No alias found. Try “dance” or “pet”.</p>
            )}
          </div>
          <span className="search-state" aria-live="polite">
            {visibleEmotes.length} of {demoEmotes.length} aliases · click to insert
          </span>
        </div>
      </div>
    </SevenTVProvider>
  );
}
