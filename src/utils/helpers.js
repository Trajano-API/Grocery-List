import { GROUP_COLORS } from "../data/defaults";

export function colorForHex(hex) {
  return (
    GROUP_COLORS.find((color) => color.hex === hex) ??
    GROUP_COLORS[GROUP_COLORS.length - 1]
  );
}

export function uid() {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `id-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}