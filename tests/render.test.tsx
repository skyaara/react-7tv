import { Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  delimitedSyntax,
  resolveEmoteImage,
  SevenTVEmote,
  SevenTVProvider,
  SevenTVText,
} from "../src";
import { kappa, wave } from "./fixtures";

describe("React components", () => {
  it("renders inline emotes on the server and recurses through DOM children", () => {
    const html = renderToStaticMarkup(
      <SevenTVProvider emotes={[kappa, wave]} syntax={delimitedSyntax(":")}>
        <SevenTVText as="p">
          Hello <strong>:Wave:</strong> :Missing:
        </SevenTVText>
      </SevenTVProvider>,
    );

    expect(html).toContain("<p>Hello <strong><img");
    expect(html).toContain('data-7tv-emote="Wave"');
    expect(html).toContain(":Missing:</p>");
  });

  it("can render without a wrapper", () => {
    const html = renderToStaticMarkup(
      <SevenTVText as={Fragment} emotes={[kappa]}>
        Kappa
      </SevenTVText>,
    );
    expect(html.startsWith("<img")).toBe(true);
  });

  it("uses static CDN variants when animation is disabled", () => {
    const html = renderToStaticMarkup(
      <SevenTVEmote emote={wave} animated={false} size={1} />,
    );
    expect(html).toContain("1x_static.webp");
    expect(html).toContain('data-7tv-animated="false"');
  });

  it("supports custom renderers", () => {
    const html = renderToStaticMarkup(
      <SevenTVText
        emotes={[kappa]}
        renderEmote={(emote) => <i data-name={emote.name}>custom</i>}
      >
        Kappa
      </SevenTVText>,
    );
    expect(html).toContain('<i data-name="Kappa">custom</i>');
  });

  it("selects GIF files when requested", () => {
    const gif = {
      ...wave,
      files: [
        ...wave.files,
        {
          name: "1x.gif",
          staticName: "1x_static.gif",
          width: 32,
          height: 32,
          frameCount: 12,
          format: "GIF",
        },
      ],
    };
    const resolved = resolveEmoteImage(gif, {
      size: 1,
      formatPreference: ["GIF"],
    });
    expect(resolved.src).toMatch(/1x\.gif$/u);
    expect(resolved.animated).toBe(true);
  });

  it("reports a useful error when an emote has no image files", () => {
    expect(() => resolveEmoteImage({ ...kappa, files: [] })).toThrow(
      '7TV emote "Kappa" does not contain image files',
    );
  });
});
