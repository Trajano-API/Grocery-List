export const UNITS = ["units", "pack", "kg", "g", "L", "ml"];

export const GROUP_COLORS = [
  {
    label: "Sage",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
    hex: "#10b981",
  },
  {
    label: "Sky",
    bg: "bg-sky-100",
    text: "text-sky-800",
    dot: "bg-sky-500",
    hex: "#0ea5e9",
  },
  {
    label: "Amber",
    bg: "bg-amber-100",
    text: "text-amber-800",
    dot: "bg-amber-500",
    hex: "#f59e0b",
  },
  {
    label: "Rose",
    bg: "bg-rose-100",
    text: "text-rose-800",
    dot: "bg-rose-500",
    hex: "#f43f5e",
  },
  {
    label: "Orange",
    bg: "bg-orange-100",
    text: "text-orange-800",
    dot: "bg-orange-500",
    hex: "#f97316",
  },
  {
    label: "Violet",
    bg: "bg-violet-100",
    text: "text-violet-800",
    dot: "bg-violet-500",
    hex: "#8b5cf6",
  },
  {
    label: "Teal",
    bg: "bg-teal-100",
    text: "text-teal-800",
    dot: "bg-teal-500",
    hex: "#14b8a6",
  },
  {
    label: "Stone",
    bg: "bg-stone-100",
    text: "text-stone-700",
    dot: "bg-stone-400",
    hex: "#78716c",
  },
];

export const DEFAULT_GROUPS = [
  { id: "produce", name: "Produce", color: "#10b981", order: 0 },
  { id: "dairy", name: "Dairy", color: "#0ea5e9", order: 1 },
  { id: "bakery", name: "Bakery", color: "#f59e0b", order: 2 },
  { id: "meat", name: "Meat", color: "#f43f5e", order: 3 },
  { id: "pantry", name: "Pantry", color: "#f97316", order: 4 },
  { id: "other", name: "Other", color: "#78716c", order: 5 },
];

export const DEFAULT_ITEMS = [
  {
    id: "i1",
    text: "Sourdough loaf",
    groupId: "bakery",
    checked: false,
    addedAt: Date.now() - 5000,
  },
  {
    id: "i2",
    text: "Whole milk, 2 L",
    groupId: "dairy",
    checked: false,
    addedAt: Date.now() - 4000,
  },
  {
    id: "i3",
    text: "Cherry tomatoes",
    groupId: "produce",
    checked: true,
    addedAt: Date.now() - 3000,
  },
  {
    id: "i4",
    text: "Free-range eggs ×12",
    groupId: "dairy",
    checked: false,
    addedAt: Date.now() - 2000,
  },
  {
    id: "i5",
    text: "Chicken thighs",
    groupId: "meat",
    checked: false,
    addedAt: Date.now() - 1000,
  },
  {
    id: "i6",
    text: "Olive oil, extra virgin",
    groupId: "pantry",
    checked: true,
    addedAt: Date.now(),
  },
];
