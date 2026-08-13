# react-7tv

Composable, typed, and SSR-safe React components for replacing inline text with
[7TV](https://7tv.app/) emotes. It targets React 19.2+ and common React DOM
environments including Next.js, Remix, Vite, and Create React App.

## Features

- Fetch a 7TV emote set or provide preloaded emotes
- Plain (`Kappa`) and delimited (`:Kappa:`, `[emote:Kappa]`) syntax
- Fully custom tokenizer support
- Animated WebP, AVIF, GIF, PNG, and static fallbacks
- Server rendering without browser globals or required CSS
- React Server Components-safe `/core` entrypoint
- Recursive replacement in inline DOM content
- Trie-based plain matching suitable for large emote sets
- Low-level components and pure utilities for custom integrations
- ESM, CommonJS, and TypeScript declaration builds

## Install

```sh
npm install react-7tv
```

`react` is a peer dependency. `react-dom` is only needed by your application.

## Quick start

```tsx
import {
  SevenTVProvider,
  SevenTVText,
  delimitedSyntax,
} from "react-7tv";

export function ChatMessage({ message }: { message: string }) {
  return (
    <SevenTVProvider
      emoteSetId="YOUR_7TV_EMOTE_SET_ID"
      syntax={delimitedSyntax(":")}
    >
      <SevenTVText>{message}</SevenTVText>
    </SevenTVProvider>
  );
}
```

Place one provider above the message list in real chat applications so the set is
fetched once rather than once per message.

```tsx
<SevenTVProvider emoteSetId="YOUR_SET_ID" syntax={{ type: "plain" }}>
  {messages.map((message) => (
    <SevenTVText as="p" key={message.id}>
      {message.body}
    </SevenTVText>
  ))}
</SevenTVProvider>
```

## Configuring syntax

Plain aliases are the default. Matches must be separated by punctuation,
whitespace, or the start/end of the string, so `Kappa!` matches while
`MyKappaValue` does not.

```tsx
<SevenTVProvider
  emoteSetId="global"
  syntax={{ type: "plain", caseSensitive: false, boundary: "punctuation" }}
>
  <SevenTVText>Kappa kappa!</SevenTVText>
</SevenTVProvider>
```

Delimited aliases can use symmetric or asymmetric markers:

```tsx
const colon = delimitedSyntax(":");
const brackets = delimitedSyntax("[emote:", "]", { trim: true });

<SevenTVText syntax={colon}>Hello :Wave:</SevenTVText>
<SevenTVText syntax={brackets}>Hello [emote: Wave]</SevenTVText>
```

For application-specific grammars, supply a custom tokenizer. It receives a map
and a lookup helper and returns text/emote tokens.

```tsx
const syntax = {
  type: "custom" as const,
  tokenize(text, { findEmote }) {
    // Implement mentions, markdown nodes, a lexer, or another grammar here.
    const emote = findEmote(text);
    return emote
      ? [{ type: "emote" as const, value: text, emote }]
      : [{ type: "text" as const, value: text }];
  },
};
```

## Preloading and SSR

The provider does not access `window` or start a request during server rendering.
Pass controlled `emotes` for a fully deterministic server render, or
`initialEmotes` to keep hydration stable while refreshing on the client.

```tsx
const emotes = await fetchEmoteSet("YOUR_SET_ID");

<SevenTVProvider emotes={emotes}>
  <SevenTVText>Kappa</SevenTVText>
</SevenTVProvider>;
```

Use `parseEmoteSetResponse` if your framework fetches and caches the raw API
response itself.

### Next.js and React Server Components

The main entry is marked `"use client"` because the provider uses context and
effects. Data utilities are also available from a separate server-safe entry:

```tsx
// app/chat/page.tsx — Server Component
import { fetchEmoteSet } from "react-7tv/core";
import { EmoteMessage } from "./emote-message";

export default async function Page() {
  const emotes = await fetchEmoteSet("YOUR_SET_ID");
  return <EmoteMessage emotes={emotes} message="Hello Kappa" />;
}
```

```tsx
// app/chat/emote-message.tsx — Client Component
"use client";

import type { SevenTVEmote } from "react-7tv/core";
import { SevenTVProvider, SevenTVText } from "react-7tv";

export function EmoteMessage({
  emotes,
  message,
}: {
  emotes: readonly SevenTVEmote[];
  message: string;
}) {
  return (
    <SevenTVProvider emotes={emotes}>
      <SevenTVText>{message}</SevenTVText>
    </SevenTVProvider>
  );
}
```

## Animation and images

Animation plays by default. Disable it at provider, text, or image level:

```tsx
<SevenTVProvider emotes={emotes} animated={false}>
  <SevenTVText>Wave</SevenTVText>
</SevenTVProvider>

<SevenTVEmote
  emote={emote}
  animated
  size={3}
  formatPreference={["GIF", "WEBP", "PNG"]}
/>
```

The renderer uses `static_name` variants supplied by 7TV when animation is off.
Any normal `<img>` prop can be passed through `emoteProps` or directly to
`SevenTVEmote`. Default styles are inline and can be overridden with `style` or
`className`.

For non-component renderers, `resolveEmoteImage(emote, options)` returns the
selected `src`, `srcSet`, dimensions, file, and actual animation state.

## Custom rendering and nested content

`SevenTVText` replaces strings inside fragments and nested intrinsic DOM elements
by default. It deliberately skips `code`, `pre`, form controls, scripts, styles,
and textareas. Custom React components are left untouched because their output is
not available to a parent component.

```tsx
<SevenTVText
  as="span"
  renderEmote={(emote, { matchedText }) => (
    <MyTooltip label={matchedText}>
      <SevenTVEmote emote={emote} className="chat-emote" />
    </MyTooltip>
  )}
>
  Hello <strong>Wave</strong>
</SevenTVText>
```

Set `recursive={false}` to transform only direct string children, or customize
`excludeElements`.

## Provider state

Use `useSevenTV()` below a provider to read `emotes`, `status`, `error`, `syntax`,
`animated`, and `getEmote(name)`. Network failures keep the previous/initial
emotes available and set `status` to `"error"`. `onError` is also available for
logging.

## Public API

The main entry exports:

- `SevenTVProvider`, `SevenTVText`, and `SevenTVEmote`
- `useSevenTV()`
- `fetchEmoteSet()` and `parseEmoteSetResponse()`
- `createEmoteMap()`, `tokenizeText()`, and `delimitedSyntax()`
- `resolveEmoteImage()`
- all associated TypeScript types

`react-7tv/core` exports only framework-neutral fetching, normalization,
matching utilities, and data types. Both entrypoints support ESM and CommonJS.

## API stability

The public model intentionally differs from the raw 7TV response. This isolates
components from API nesting changes and makes controlled/test emotes easy to
construct. The package uses the public `https://7tv.io/v3/emote-sets/:id`
endpoint by default; `apiBaseUrl` and `fetch` are injectable for proxies, tests,
and runtimes with a custom fetch implementation.

## Development

```sh
npm install
npm run check
```

`npm run check` runs strict TypeScript validation, ESLint, the complete test
suite, both production builds, and package export validation. CI covers
supported Node.js release lines.

## Runnable examples

Complete applications live in [`examples`](./examples):

- Vite + React SPA
- Next.js App Router with Server and Client Components
- React Router framework mode with loader-based SSR
- Astro marketing site with a hydrated React playground

```sh
npm run examples:build
npm run marketing:dev
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution and release guidance.

## License

MIT. This project is not affiliated with or endorsed by 7TV.
