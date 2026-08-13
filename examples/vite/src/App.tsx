import { demoEmotes } from "@react-7tv/example-data";
import { useState } from "react";
import {
  delimitedSyntax,
  SevenTVProvider,
  SevenTVText,
  useSevenTV,
  type SevenTVSyntax,
} from "react-7tv";

const syntaxes = {
  plain: { type: "plain" },
  colon: delimitedSyntax(":"),
  brackets: delimitedSyntax("[emote:", "]", { trim: true }),
} satisfies Record<string, SevenTVSyntax>;

const messages = {
  plain: "That shipped fast PETPET — we made it RainTime!",
  colon: "That shipped fast :PETPET: — we made it :RainTime:!",
  brackets:
    "That shipped fast [emote: PETPET] — we made it [emote: RainTime]!",
};

type SyntaxName = keyof typeof syntaxes;

function Status(): React.JSX.Element {
  const { emotes, status } = useSevenTV();
  return (
    <span className="status">
      <i data-state={status} /> {status} · {emotes.size} emotes
    </span>
  );
}

export function App(): React.JSX.Element {
  const [syntaxName, setSyntaxName] = useState<SyntaxName>("plain");
  const [message, setMessage] = useState(messages.plain);
  const [animated, setAnimated] = useState(true);

  function selectSyntax(next: SyntaxName): void {
    setSyntaxName(next);
    setMessage(messages[next]);
  }

  return (
    <SevenTVProvider
      emoteSetId="global"
      initialEmotes={demoEmotes}
      syntax={syntaxes[syntaxName]}
      animated={animated}
    >
      <main>
        <header>
          <a className="brand" href="/" aria-label="7TV wrapper Vite example">
            <span>7</span> react wrapper
          </a>
          <Status />
        </header>

        <section className="hero">
          <p className="eyebrow">Vite + React 19</p>
          <h1>Turn chat text into something people can feel.</h1>
          <p className="lede">
            A client-rendered example with remote set hydration, configurable
            syntax, and motion control.
          </p>
        </section>

        <section className="playground">
          <div className="toolbar" aria-label="Syntax selection">
            {(Object.keys(syntaxes) as SyntaxName[]).map((name) => (
              <button
                className={name === syntaxName ? "active" : ""}
                type="button"
                key={name}
                onClick={() => selectSyntax(name)}
              >
                {name}
              </button>
            ))}
            <label className="motion">
              <input
                type="checkbox"
                checked={animated}
                onChange={(event) => setAnimated(event.currentTarget.checked)}
              />
              Motion
            </label>
          </div>

          <label className="field">
            <span>Message</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.currentTarget.value)}
              rows={3}
            />
          </label>

          <div className="result">
            <span className="result-label">Rendered output</span>
            <SevenTVText as="p">{message}</SevenTVText>
          </div>
        </section>

        <footer>
          Edit <code>src/App.tsx</code> to make it yours.
        </footer>
      </main>
    </SevenTVProvider>
  );
}
