import { demoEmotes } from "@react-7tv-wrapper/example-data";
import { fetchEmoteSet } from "react-7tv-wrapper/core";
import { EmoteMessage } from "./EmoteMessage";

// Keep the demo honest: the latest global set is loaded on the server per request,
// while a deterministic fallback keeps the example useful offline.
export const dynamic = "force-dynamic";

export default async function Page() {
  const emotes = await fetchEmoteSet("global").catch(() => demoEmotes);

  return (
    <main>
      <nav>
        <span className="logo">7</span>
        <span>Next.js App Router</span>
        <span className="server-pill">server fetched</span>
      </nav>

      <section className="intro">
        <p className="eyebrow">React Server Components</p>
        <h1>Fetch on the server. Play on the client.</h1>
        <p>
          The <code>/core</code> entry loads {emotes.length} global emotes without
          crossing the client boundary. A focused Client Component owns only the
          interactive message UI.
        </p>
      </section>

      <EmoteMessage emotes={emotes} />

      <aside>
        <span>Server</span>
        <b>fetchEmoteSet(&quot;global&quot;)</b>
        <i>→</i>
        <span>Client</span>
        <b>SevenTVText</b>
      </aside>
    </main>
  );
}
