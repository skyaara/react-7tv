import { demoEmotes } from "@react-7tv/example-data";
import { useEffect, useState } from "react";
import { SevenTVEmote } from "react-7tv";

const cardCount = 5;

export function HeroCarousel(): React.JSX.Element {
  const [offset, setOffset] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setOffset((current) => (current + 1) % demoEmotes.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [playing]);

  function shuffle(): void {
    setOffset((current) => (current + 3) % demoEmotes.length);
  }

  return (
    <div
      className="hero-carousel"
      data-playing={playing}
      aria-label="Rotating 7TV emote cards"
    >
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="carousel-ring">
        {Array.from({ length: cardCount }, (_, index) => {
          const emote = demoEmotes[(offset + index) % demoEmotes.length];
          return (
            <div className={`carousel-slot slot-${index + 1}`} key={index}>
              <figure className="hero-emote-card">
                <span>{emote.animated ? "LIVE" : "STILL"}</span>
                <SevenTVEmote
                  key={emote.id}
                  emote={emote}
                  size={3}
                  loading="eager"
                />
                <figcaption>{emote.name}</figcaption>
              </figure>
            </div>
          );
        })}
      </div>

      <div className="carousel-control">
        <span>{demoEmotes.length} emotes</span>
        <button type="button" onClick={shuffle}>Shuffle</button>
        <button
          type="button"
          aria-label={playing ? "Pause carousel" : "Play carousel"}
          onClick={() => setPlaying((current) => !current)}
        >
          {playing ? "Ⅱ" : "▶"}
        </button>
      </div>
      <div className="syntax-chip chip-one">:PETPET:</div>
      <div className="syntax-chip chip-two">[emote: RainTime]</div>
    </div>
  );
}
