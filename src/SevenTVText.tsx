import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  useMemo,
  type ElementType,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { createEmoteMap, EMPTY_EMOTE_MAP } from "./collection";
import { useOptionalSevenTV } from "./context";
import { SevenTVEmote, type SevenTVEmoteProps } from "./SevenTVEmote";
import { DEFAULT_SYNTAX, tokenizeText } from "./syntax";
import type { EmoteCollection, RenderEmote, SevenTVSyntax } from "./types";

const DEFAULT_EXCLUDED_ELEMENTS = new Set([
  "code",
  "input",
  "option",
  "pre",
  "script",
  "select",
  "style",
  "textarea",
]);

export interface SevenTVTextProps extends HTMLAttributes<HTMLElement> {
  readonly children: ReactNode;
  /** Wrapper element. Use `Fragment` to avoid adding a DOM node. Defaults to `span`. */
  readonly as?: ElementType;
  /** Optional standalone emotes; overrides provider emotes. */
  readonly emotes?: EmoteCollection;
  /** Optional syntax override. */
  readonly syntax?: SevenTVSyntax;
  /** Replaces strings inside nested DOM elements. Defaults to true. */
  readonly recursive?: boolean;
  /** Lowercase intrinsic element names to leave untouched during recursive matching. */
  readonly excludeElements?: readonly string[];
  readonly renderEmote?: RenderEmote;
  readonly emoteProps?: Omit<SevenTVEmoteProps, "emote" | "animated">;
  readonly animated?: boolean;
}

interface TransformOptions {
  readonly emotes: ReturnType<typeof createEmoteMap>;
  readonly syntax: SevenTVSyntax;
  readonly recursive: boolean;
  readonly excluded: ReadonlySet<string>;
  readonly renderEmote: RenderEmote;
}

function transformString(
  text: string,
  path: string,
  options: TransformOptions,
): ReactNode {
  const tokens = tokenizeText(text, options.emotes, options.syntax);
  if (tokens.every((token) => token.type === "text")) return text;

  return tokens.map((token, index) =>
    token.type === "text" ? (
      token.value
    ) : (
      <Fragment key={`${path}:emote:${index}:${token.emote.id}`}>
        {options.renderEmote(token.emote, {
          matchedText: token.value,
          index,
        })}
      </Fragment>
    ),
  );
}

function transformNode(
  node: ReactNode,
  path: string,
  options: TransformOptions,
): ReactNode {
  if (typeof node === "string") return transformString(node, path, options);
  if (!isValidElement(node)) return node;

  const canRecurse =
    node.type === Fragment ||
    (options.recursive &&
      typeof node.type === "string" &&
      !options.excluded.has(node.type.toLowerCase()));

  if (!canRecurse) return node;

  const element = node as ReactElement<{ children?: ReactNode }>;
  if (element.props.children === undefined) return node;

  return cloneElement(element, {
    children: transformChildren(element.props.children, path, options),
  });
}

function transformChildren(
  children: ReactNode,
  path: string,
  options: TransformOptions,
): ReactNode {
  return Children.map(children, (child, index) =>
    transformNode(child, `${path}.${index}`, options),
  );
}

export function SevenTVText({
  children,
  as: Component = "span",
  emotes: emoteOverride,
  syntax: syntaxOverride,
  recursive = true,
  excludeElements,
  renderEmote,
  emoteProps,
  animated: animatedOverride,
  ...wrapperProps
}: SevenTVTextProps): React.JSX.Element {
  const context = useOptionalSevenTV();
  const contextEmotes = context?.emotes;
  const emotes = useMemo(
    () =>
      emoteOverride
        ? createEmoteMap(emoteOverride)
        : contextEmotes ?? EMPTY_EMOTE_MAP,
    [contextEmotes, emoteOverride],
  );
  const syntax = syntaxOverride ?? context?.syntax ?? DEFAULT_SYNTAX;
  const animated = animatedOverride ?? context?.animated ?? true;
  const excluded = useMemo(
    () => new Set(excludeElements ?? DEFAULT_EXCLUDED_ELEMENTS),
    [excludeElements],
  );
  const renderer: RenderEmote =
    renderEmote ??
    ((emote) => (
      <SevenTVEmote emote={emote} animated={animated} {...emoteProps} />
    ));
  const transformed = transformChildren(children, "root", {
    emotes,
    syntax,
    recursive,
    excluded,
    renderEmote: renderer,
  });

  if (Component === Fragment) return <>{transformed}</>;
  return <Component {...wrapperProps}>{transformed}</Component>;
}
