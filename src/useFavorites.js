import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sgs-favorite-events";

function readStoredFavorites() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n) => typeof n === "number" && !Number.isNaN(n));
  } catch (err) {
    console.warn("useFavorites: could not read stored favorites", err);
    return [];
  }
}

function writeStoredFavorites(favorites) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (err) {
    console.warn("useFavorites: could not persist favorites", err);
  }
}

/**
 * localStorage-backed favorites for events, keyed by event number.
 * No accounts/auth exist in this app, so favorites are local to the
 * browser — matches the confirmed scope for this feature.
 */
export default function useFavorites() {
  const [favorites, setFavorites] = useState(() => readStoredFavorites());

  useEffect(() => {
    writeStoredFavorites(favorites);
  }, [favorites]);

  const isFavorite = useCallback(
    (eventNumber) => favorites.includes(eventNumber),
    [favorites]
  );

  const toggleFavorite = useCallback((eventNumber) => {
    if (eventNumber === undefined || eventNumber === null) return;
    setFavorites((current) =>
      current.includes(eventNumber)
        ? current.filter((n) => n !== eventNumber)
        : [...current, eventNumber]
    );
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
