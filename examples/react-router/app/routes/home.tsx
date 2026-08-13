import { demoEmotes } from "@react-7tv-wrapper/example-data";
import { useState } from "react";
import {
  delimitedSyntax,
  SevenTVProvider,
  SevenTVText,
} from "react-7tv-wrapper";
import { fetchEmoteSet } from "react-7tv-wrapper/core";
import type { Route } from "./+types/home";

export function meta(): Route.MetaDescriptors {
  return [
    { title: "7TV React Wrapper · React Router example" },
    {
      name: "description",
      content: "A loader-powered React Router framework-mode example.",
    },
  ];
}

export async function loader(): Promise<{ emotes: typeof demoEmotes | Awaited<ReturnType<typeof fetchEmoteSet>> }> {
  const emotes = await fetchEmoteSet("global").catch(() => demoEmotes);
  return { emotes };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [message, setMessage] = useState(
    "Route loaders are ready :Clap2: :peepoHappy:",
  );

  return (
    <SevenTVProvider
      emotes={loaderData.emotes}
      syntax={delimitedSyntax(":")}
    >
      <main>
        <nav>
          <span className="mark">7</span>
          <b>React Router</b>
          <span>framework mode</span>
        </nav>

        <section className="hero">
          <div>
            <p className="kicker">Loader → component → emote</p>
            <h1>Routing with a little more expression.</h1>
          </div>
          <p className="summary">
            Global emotes arrive in the route loader, render during SSR, and stay
            fully interactive after hydration.
          </p>
        </section>

        <section className="demo">
          <div className="number">01</div>
          <label>
            <span>Colon syntax</span>
            <input
              value={message}
              onChange={(event) => setMessage(event.currentTarget.value)}
            />
          </label>
          <div className="output">
            <SevenTVText as="p">{message}</SevenTVText>
          </div>
          <p className="hint">
            Try <code>:RainTime:</code>, <code>:PETPET:</code>, or any of the {" "}
            {loaderData.emotes.length} loaded aliases.
          </p>
        </section>
      </main>
    </SevenTVProvider>
  );
}
