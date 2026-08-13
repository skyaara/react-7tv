import type { CSSProperties, ImgHTMLAttributes } from "react";
import type { SevenTVEmote as SevenTVEmoteModel, SevenTVEmoteFile } from "./types";

const DEFAULT_FORMAT_PREFERENCE = ["WEBP", "AVIF", "GIF", "PNG"] as const;

const DEFAULT_STYLE: CSSProperties = {
  display: "inline-block",
  width: "auto",
  height: "1.5em",
  margin: 0,
  verticalAlign: "middle",
  objectFit: "contain",
};

export interface SevenTVEmoteProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
  readonly emote: SevenTVEmoteModel;
  /** Plays an animated asset when one exists. Defaults to true. */
  readonly animated?: boolean;
  /** Preferred CDN scale. 1 through 4 are typical. Defaults to 2. */
  readonly size?: number;
  readonly formatPreference?: readonly string[];
}

export interface ResolveEmoteImageOptions {
  readonly animated?: boolean;
  readonly size?: number;
  readonly formatPreference?: readonly string[];
}

export interface ResolvedEmoteImage {
  readonly src: string;
  readonly srcSet: string;
  readonly width: number;
  readonly height: number;
  readonly animated: boolean;
  readonly file: SevenTVEmoteFile;
}

function joinUrl(baseUrl: string, filename: string): string {
  return `${baseUrl.replace(/\/+$/u, "")}/${filename.replace(/^\/+/, "")}`;
}

function getScale(file: SevenTVEmoteFile): number {
  const match = /^(\d+)x(?:_|\.)/u.exec(file.name);
  return match?.[1] ? Number(match[1]) : 1;
}

function selectFiles(
  files: readonly SevenTVEmoteFile[],
  formats: readonly string[],
): readonly SevenTVEmoteFile[] {
  for (const format of formats) {
    const matches = files.filter(
      (file) => file.format.toUpperCase() === format.toUpperCase(),
    );
    if (matches.length > 0) return matches;
  }
  return files;
}

export function resolveEmoteImage(
  emote: SevenTVEmoteModel,
  {
    animated = true,
    size = 2,
    formatPreference = DEFAULT_FORMAT_PREFERENCE,
  }: ResolveEmoteImageOptions = {},
): ResolvedEmoteImage {
  if (emote.files.length === 0) {
    throw new TypeError(`7TV emote "${emote.name}" does not contain image files`);
  }

  const candidates = [...selectFiles(emote.files, formatPreference)].sort(
    (a, b) => getScale(a) - getScale(b),
  );
  const preferred = candidates.reduce((best, file) =>
    Math.abs(getScale(file) - size) < Math.abs(getScale(best) - size)
      ? file
      : best,
  );
  const filename = !animated && preferred.staticName
    ? preferred.staticName
    : preferred.name;
  const isAnimated =
    preferred.frameCount > 1 && (animated || !preferred.staticName);

  return {
    src: joinUrl(emote.hostUrl, filename),
    srcSet: candidates
      .map((file) => {
        const name = !animated && file.staticName ? file.staticName : file.name;
        return `${joinUrl(emote.hostUrl, name)} ${getScale(file)}x`;
      })
      .join(", "),
    width: preferred.width,
    height: preferred.height,
    animated: isAnimated,
    file: preferred,
  };
}

export function SevenTVEmote({
  emote,
  animated = true,
  size = 2,
  formatPreference = DEFAULT_FORMAT_PREFERENCE,
  alt = emote.name,
  title = emote.name,
  loading = "lazy",
  decoding = "async",
  style,
  ...imageProps
}: SevenTVEmoteProps): React.JSX.Element {
  const resolved = resolveEmoteImage(emote, {
    animated,
    size,
    formatPreference,
  });

  return (
    <img
      {...imageProps}
      src={resolved.src}
      srcSet={resolved.srcSet || undefined}
      alt={alt}
      title={title}
      loading={loading}
      decoding={decoding}
      width={resolved.width || undefined}
      height={resolved.height || undefined}
      style={{ ...DEFAULT_STYLE, ...style }}
      data-7tv-emote={emote.name}
      data-7tv-emote-id={emote.id}
      data-7tv-animated={String(resolved.animated)}
    />
  );
}
