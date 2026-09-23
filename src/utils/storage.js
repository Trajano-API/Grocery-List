import { DEFAULT_GROUPS, DEFAULT_ITEMS } from "../data/defaults";

const STORAGE_KEY = "groceries-app-v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // If saved data cannot be read, use the default data.
  }

  const defaultList = {
    id: "default",
    name: "Weekly Shop",
    groups: DEFAULT_GROUPS,
    items: DEFAULT_ITEMS,
    createdAt: Date.now(),
  };

  return {
    lists: [defaultList],
    activeId: "default",
  };
}

export function saveState(lists, activeId) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        lists,
        activeId,
      })
    );
  } catch {
    // Ignore localStorage errors.
  }
}