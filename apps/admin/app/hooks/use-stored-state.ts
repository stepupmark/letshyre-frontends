import { useCallback, useState } from "react";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function useStoredState<T>(key: string, fallback: T) {
  const [state, setState] = useState(() => read(key, fallback));
  const [storedKey, setStoredKey] = useState(key);
  if (storedKey !== key) {
    setStoredKey(key);
    setState(read(key, fallback));
  }

  const update = useCallback(
    (next: T) => {
      setState(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // storage can be full or blocked; the setting just won't persist
      }
    },
    [key],
  );

  return [state, update] as const;
}
