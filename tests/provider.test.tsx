// @vitest-environment jsdom

import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SevenTVProvider, useSevenTV } from "../src";
import { kappa } from "./fixtures";

afterEach(cleanup);

function State(): React.JSX.Element {
  const { emotes, error, status } = useSevenTV();
  return (
    <output data-error={error?.message ?? ""} data-status={status}>
      {[...emotes.keys()].join(",")}
    </output>
  );
}

function responseFor(name: string): Response {
  return new Response(
    JSON.stringify({
      emotes: [
        {
          id: name,
          name,
          flags: 0,
          data: {
            animated: false,
            host: {
              url: `//cdn.7tv.app/emote/${name}`,
              files: [
                {
                  name: "1x.webp",
                  width: 32,
                  height: 32,
                  frame_count: 1,
                  format: "WEBP",
                },
              ],
            },
          },
        },
      ],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

describe("SevenTVProvider", () => {
  it("loads a remote set and exposes provider state", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(responseFor("Wave"));
    const view = render(
      <SevenTVProvider emoteSetId="set-a" fetch={request}>
        <State />
      </SevenTVProvider>,
    );

    expect(view.getByRole("status").dataset.status).toBe("loading");
    await waitFor(() =>
      expect(view.getByRole("status").dataset.status).toBe("ready"),
    );
    expect(view.getByRole("status").textContent).toContain("Wave");
  });

  it("does not flash the previous set while a new set loads", async () => {
    let resolveSecond: ((response: Response) => void) | undefined;
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(responseFor("First"))
      .mockImplementationOnce(
        () => new Promise<Response>((resolve) => { resolveSecond = resolve; }),
      );
    const view = render(
      <SevenTVProvider emoteSetId="first" fetch={request}>
        <State />
      </SevenTVProvider>,
    );
    await waitFor(() =>
      expect(view.getByRole("status").textContent).toContain("First"),
    );

    view.rerender(
      <SevenTVProvider emoteSetId="second" fetch={request} initialEmotes={[kappa]}>
        <State />
      </SevenTVProvider>,
    );
    expect(view.getByRole("status").dataset.status).toBe("loading");
    expect(view.getByRole("status").textContent).toContain("Kappa");
    expect(view.getByRole("status").textContent).not.toContain("First");

    resolveSecond?.(responseFor("Second"));
    await waitFor(() =>
      expect(view.getByRole("status").textContent).toContain("Second"),
    );
  });
});
