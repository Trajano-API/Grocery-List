import ShoppingItem from "./ShoppingItem";
import { colorForHex } from "../utils/helpers";

export default function ShoppingList({
  groups,
  items,
  expandedGroupId,
  editingItemId,
  onToggleGroup,
  onToggleItem,
  onDeleteItem,
  onUpdateItem,
  onEditItem,
}) {
  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const sectionItems = items.filter(
          (item) => item.groupId === group.id
        );

        const isExpanded = expandedGroupId === group.id;

        const activeItems = sectionItems.filter(
          (item) => !item.checked
        ).length;

        const colorMeta = colorForHex(group.color);

        return (
          <section key={group.id}>
            {/* Group header */}
            <button
              onClick={() => onToggleGroup(group.id)}
              className="w-full flex items-center gap-2 mb-2 group/header"
            >
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorMeta.bg} ${colorMeta.text} transition-opacity`}
              >
                {group.name}
              </span>

              <span className="text-xs text-[var(--color-muted-foreground)]">
                {activeItems > 0
                  ? `${activeItems} left`
                  : sectionItems.length > 0
                    ? "all done"
                    : "empty"}
              </span>

              <span
                className="ml-auto text-[var(--color-muted-foreground)] transition-transform duration-200"
                style={{
                  transform: isExpanded
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    d="M2 5l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            {/* Items */}
            {isExpanded && (
              <div
                className="border divide-y overflow-hidden"
                style={{
                  borderColor: "var(--color-border)",
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--color-card)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                {sectionItems.length === 0 ? (
                  <div className="px-4 py-4 text-xs text-[var(--color-muted-foreground)] italic">
                    No items in this group
                  </div>
                ) : (
                  sectionItems.map((item) => (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      isEditing={editingItemId === item.id}
                      onToggle={() => onToggleItem(item.id)}
                      onDelete={() => onDeleteItem(item.id)}
                      onUpdate={(changes) =>
                        onUpdateItem(item.id, changes)
                      }
                      onEditToggle={() => onEditItem(item.id)}
                    />
                  ))
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}