import { createContext, useContext } from "react";
import type { SevenTVContextValue } from "./provider-types";

export const SevenTVContext = createContext<SevenTVContextValue | null>(null);

export function useSevenTV(): SevenTVContextValue {
  const context = useContext(SevenTVContext);
  if (!context) {
    throw new Error("useSevenTV must be used within a <SevenTVProvider>");
  }
  return context;
}

export function useOptionalSevenTV(): SevenTVContextValue | null {
  return useContext(SevenTVContext);
}
