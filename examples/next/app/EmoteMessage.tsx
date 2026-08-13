"use client";

import { useState } from "react";
import type { SevenTVEmote } from "react-7tv-wrapper/core";
import { SevenTVProvider, SevenTVText } from "react-7tv-wrapper";

export function EmoteMessage({
  emotes,
}: {
  emotes: readonly SevenTVEmote[];
}): React.JSX.Element {
  const [message, setMessage] = useState(
    "Server Components did the heavy lifting PETPET peepoHappy",
  );
  const [animated, setAnimated] = useState(true);

  return (
    <SevenTVProvider emotes={emotes} animated={animated}>
      <section className="composer">
        <div className="window-bar">
          <span /> <span /> <span />
          <strong>app/EmoteMessage.tsx</strong>
        </div>
        <label>
          <span>Try a message</span>
          <input
            value={message}
            onChange={(event) => setMessage(event.currentTarget.value)}
          />
        </label>
        <div className="preview">
          <SevenTVText as="p">{message}</SevenTVText>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={animated}
            onChange={(event) => setAnimated(event.currentTarget.checked)}
          />
          Animate emotes
        </label>
      </section>
    </SevenTVProvider>
  );
}
