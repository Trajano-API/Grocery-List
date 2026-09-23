import { UNITS } from "../data/defaults";

export default function ShoppingItem({
  item,
  isEditing,
  onToggle,
  onDelete,
  onUpdate,
  onEditToggle,
}) {
  return (
    <div>
      {/* Item row */}
      <div className="flex items-center gap-3 px-3 py-3 group hover:bg-[var(--color-secondary)] transition-colors">
        <button
          onClick={onToggle}
          className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
          style={{
            borderColor: item.checked
              ? "var(--color-primary)"
              : "var(--color-muted)",
            backgroundColor: item.checked
              ? "var(--color-primary)"
              : "transparent",
          }}
        >
          {item.checked && (
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 10 10">
              <path
                d="M1.5 5l2.5 2.5 4.5-5"
                stroke="var(--color-primary-foreground)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <span
            className="text-sm font-medium"
            style={{
              color: item.checked
                ? "var(--color-muted-foreground)"
                : "var(--color-foreground)",
              textDecorationLine: item.checked ? "line-through" : "none",
              textDecorationColor: item.checked
                ? "var(--color-muted)"
                : "transparent",
            }}
          >
            {item.text}
          </span>

          {(item.qty != null || item.price != null) && (
            <div className="flex items-center gap-2 mt-0.5">
              {item.qty != null && (
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  {item.qty} {item.unit ?? "units"}
                </span>
              )}

              {item.price != null && (
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  ${item.price.toFixed(2)}/{item.unit ?? "unit"}
                </span>
              )}

              {item.price != null && item.qty != null && (
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--color-primary)" }}
                >
                  = ${(item.price * item.qty).toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Edit */}
          <button
            onClick={onEditToggle}
            className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-muted)]"
            style={{
              color: isEditing
                ? "var(--color-primary)"
                : "var(--color-muted-foreground)",
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
              <path
                d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-rose-50"
            style={{ color: "var(--color-accent)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
              <path
                d="M2 2l10 10M12 2L2 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Edit panel */}
      {isEditing && (
        <div
          className="px-3 py-3 border-t grid grid-cols-3 gap-2"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-background)",
          }}
        >
          {/* Name */}
          <div className="col-span-3">
            <label className="text-xs text-[var(--color-muted-foreground)] mb-1 block">
              Name
            </label>

            <input
              autoFocus
              value={item.text}
              onChange={(e) =>
                onUpdate({
                  text: e.target.value,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onEditToggle();
                }
              }}
              className="w-full text-sm px-2.5 py-1.5 border"
              style={{
                borderColor: "var(--color-border)",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--color-card)",
                color: "var(--color-foreground)",
              }}
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs text-[var(--color-muted-foreground)] mb-1 block">
              Qty
            </label>

            <input
              type="number"
              min="0"
              step={
                item.unit === "units" ||
                item.unit === "pack" ||
                item.unit == null
                  ? "1"
                  : "0.1"
              }
              value={item.qty ?? ""}
              onChange={(e) => {
                if (e.target.value === "") {
                  onUpdate({ qty: undefined });
                  return;
                }

                const isInteger =
                  item.unit === "units" ||
                  item.unit === "pack" ||
                  item.unit == null;

                onUpdate({
                  qty: isInteger
                    ? parseInt(e.target.value, 10)
                    : parseFloat(e.target.value),
                });
              }}
              placeholder="—"
              className="w-full text-sm px-2.5 py-1.5 border"
              style={{
                borderColor: "var(--color-border)",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--color-card)",
                color: "var(--color-foreground)",
              }}
            />
          </div>

          {/* Unit */}
          <div>
            <label className="text-xs text-[var(--color-muted-foreground)] mb-1 block">
              Unit
            </label>

            <select
              value={item.unit ?? "units"}
              onChange={(e) => {
                const unit = e.target.value;
                const changes = { unit };

                if (
                  (unit === "units" || unit === "pack") &&
                  item.qty != null
                ) {
                  changes.qty = Math.round(item.qty);
                }

                onUpdate(changes);
              }}
              className="w-full text-sm px-2 py-1.5 border appearance-none"
              style={{
                borderColor: "var(--color-border)",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--color-card)",
                color: "var(--color-foreground)",
              }}
            >
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="text-xs text-[var(--color-muted-foreground)] mb-1 block">
              Price per {item.unit ?? "unit"} ($)
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={item.price ?? ""}
              onChange={(e) =>
                onUpdate({
                  price:
                    e.target.value === ""
                      ? undefined
                      : parseFloat(e.target.value),
                })
              }
              placeholder="—"
              className="w-full text-sm px-2.5 py-1.5 border"
              style={{
                borderColor: "var(--color-border)",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--color-card)",
                color: "var(--color-foreground)",
              }}
            />
          </div>

          {/* Done */}
          <div className="col-span-3 flex justify-end">
            <button
              onClick={onEditToggle}
              className="text-xs font-medium px-3 py-1.5 transition-colors"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
                borderRadius: "var(--radius)",
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}