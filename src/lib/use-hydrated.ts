import { useEffect, useState } from "react";

/** Returns true after the first client render. SSR returns false. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
