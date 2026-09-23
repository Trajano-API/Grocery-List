import { GROUP_COLORS } from "../data/defaults";

function ColorSwatches({ value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {GROUP_COLORS.map((color) => (
        <button
          key={color.hex}
          onClick={() => onChange(color.hex)}
          title={color.label}
          className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${color.dot}`}
          style={{
            outline:
              value === color.hex
                ? "2px solid var(--color-foreground)"
                : "2px solid transparent",
            outlineOffset: "2px",
          }}
        />
      ))}
    </div>
  );
}

export default function OptionsDrawer({
  open,
  onClose,
  activeList,
  lists,
  optionsTab,
  setOptionsTab,
  editingGroupId,
  setEditingGroupId,
  onUpdateGroup,
  onDeleteGroup,
  onMoveGroup,
  onAddGroup,
  onResetList,
  onDeleteList,
  onNewList,
  onSelectList,
  onRenameList,
}) {
  const sortedGroups = [...activeList.groups].sort(
    (a, b) => a.order - b.order
  );

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30"
          style={{ backgroundColor: "rgba(26,23,19,0.35)" }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-40 flex flex-col"
        style={{
          width: "min(380px, 100vw)",
          backgroundColor: "var(--color-card)",
          borderLeft: "1px solid var(--color-border)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          transform: open
            ? "translateX(0)"
            : "translateX(100%)",
          transition:
            "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2
            className="font-semibold text-sm"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
            }}
          >
            Options
          </h2>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--color-secondary)] transition-colors"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                d="M2 2l10 10M12 2L2 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          {["groups", "lists"].map((tab) => (
            <button
              key={tab}
              onClick={() => setOptionsTab(tab)}
              className="flex-1 py-3 text-xs font-semibold uppercase tracking-widest transition-colors"
              style={{
                color:
                  optionsTab === tab
                    ? "var(--color-foreground)"
                    : "var(--color-muted-foreground)",
                borderBottom:
                  optionsTab === tab
                    ? "2px solid var(--color-foreground)"
                    : "2px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Groups */}
          {optionsTab === "groups" && (
            <div className="p-5 space-y-4">
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Click a group header on the list to expand or
                collapse it. Only one group is open at a time.
              </p>

              {sortedGroups.map((group, index) => {
                const isEditing =
                  editingGroupId === group.id;

                return (
                  <div
                    key={group.id}
                    className="border rounded overflow-hidden"
                    style={{
                      borderColor: "var(--color-border)",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <div
                      className="flex items-center gap-2 px-3 py-2.5"
                      style={{
                        backgroundColor:
                          "var(--color-background)",
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: group.color,
                        }}
                      />

                      <span className="flex-1 text-sm font-medium truncate">
                        {group.name}
                      </span>

                      <div className="flex items-center gap-1">
                        {/* Move up */}
                        <button
                          onClick={() =>
                            onMoveGroup(group.id, -1)
                          }
                          disabled={index === 0}
                          className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-secondary)] disabled:opacity-30"
                          style={{
                            color:
                              "var(--color-muted-foreground)",
                          }}
                        >
                          ↑
                        </button>

                        {/* Move down */}
                        <button
                          onClick={() =>
                            onMoveGroup(group.id, 1)
                          }
                          disabled={
                            index === sortedGroups.length - 1
                          }
                          className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-secondary)] disabled:opacity-30"
                          style={{
                            color:
                              "var(--color-muted-foreground)",
                          }}
                        >
                          ↓
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() =>
                            setEditingGroupId(
                              isEditing ? null : group.id
                            )
                          }
                          className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-secondary)]"
                          style={{
                            color: isEditing
                              ? "var(--color-primary)"
                              : "var(--color-muted-foreground)",
                          }}
                        >
                          ✎
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() =>
                            onDeleteGroup(group.id)
                          }
                          disabled={
                            activeList.groups.length <= 1
                          }
                          className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-rose-50 disabled:opacity-30"
                          style={{
                            color: "var(--color-accent)",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <div
                        className="px-3 py-3 space-y-3 border-t"
                        style={{
                          borderColor:
                            "var(--color-border)",
                          backgroundColor:
                            "var(--color-card)",
                        }}
                      >
                        <div>
                          <label className="text-xs text-[var(--color-muted-foreground)] mb-1 block">
                            Name
                          </label>

                          <input
                            autoFocus
                            value={group.name}
                            onChange={(e) =>
                              onUpdateGroup(group.id, {
                                name: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                setEditingGroupId(null);
                              }
                            }}
                            className="w-full text-sm px-2.5 py-1.5 border rounded bg-[var(--color-background)]"
                            style={{
                              borderColor:
                                "var(--color-border)",
                              borderRadius:
                                "var(--radius)",
                              color:
                                "var(--color-foreground)",
                            }}
                          />
                        </div>

                        <div>
                          <label className="text-xs text-[var(--color-muted-foreground)] mb-2 block">
                            Color
                          </label>

                          <ColorSwatches
                            value={group.color}
                            onChange={(color) =>
                              onUpdateGroup(group.id, {
                                color,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={onAddGroup}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed text-xs font-medium transition-colors hover:bg-[var(--color-secondary)]"
                style={{
                  borderColor: "var(--color-muted)",
                  borderRadius: "var(--radius)",
                  color: "var(--color-muted-foreground)",
                }}
              >
                + Add group
              </button>
            </div>
          )}

          {/* Lists */}
          {optionsTab === "lists" && (
            <div className="p-5 space-y-5">
              <div>
                <p className="text-xs text-[var(--color-muted-foreground)] mb-3 uppercase tracking-widest font-medium">
                  Current list
                </p>

                <div
                  className="flex items-center gap-2 p-2.5 border mb-3"
                  style={{
                    borderColor: "var(--color-border)",
                    borderRadius: "var(--radius)",
                    backgroundColor:
                      "var(--color-background)",
                  }}
                >
                  <span className="flex-1 text-sm font-medium text-[var(--color-foreground)] truncate">
                    {activeList.name}
                  </span>

                  <button
                    onClick={() => {
                      const name = window.prompt(
                        "New list name:",
                        activeList.name
                      );

                      if (name?.trim()) {
                        onRenameList(
                          activeList.id,
                          name.trim()
                        );
                      }
                    }}
                    className="flex-shrink-0 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                  >
                    Rename
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onResetList}
                    className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium border transition-colors hover:bg-[var(--color-secondary)]"
                    style={{
                      borderColor:
                        "var(--color-border)",
                      borderRadius: "var(--radius)",
                      color: "var(--color-foreground)",
                    }}
                  >
                    Reset list
                  </button>

                  <button
                    onClick={() =>
                      onDeleteList(activeList.id)
                    }
                    disabled={lists.length <= 1}
                    className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium border transition-colors hover:bg-rose-50 disabled:opacity-30"
                    style={{
                      borderColor:
                        "var(--color-border)",
                      borderRadius: "var(--radius)",
                      color: "var(--color-accent)",
                    }}
                  >
                    Delete list
                  </button>
                </div>
              </div>

              <div
                className="h-px"
                style={{
                  backgroundColor:
                    "var(--color-border)",
                }}
              />

              <div>
                <p className="text-xs text-[var(--color-muted-foreground)] mb-3 uppercase tracking-widest font-medium">
                  Saved lists
                </p>

                <div className="space-y-1.5">
                  {lists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() =>
                        onSelectList(list.id)
                      }
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left border transition-colors"
                      style={{
                        borderColor:
                          list.id === activeList.id
                            ? "var(--color-primary)"
                            : "var(--color-border)",
                        borderRadius: "var(--radius)",
                        backgroundColor:
                          list.id === activeList.id
                            ? "rgba(45,90,39,0.06)"
                            : "var(--color-background)",
                        color: "var(--color-foreground)",
                      }}
                    >
                      <span className="flex-1 text-sm font-medium truncate">
                        {list.name}
                      </span>

                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        {list.items.length} item
                        {list.items.length !== 1
                          ? "s"
                          : ""}
                      </span>

                      {list.id === activeList.id && (
                        <span
                          style={{
                            color:
                              "var(--color-primary)",
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={onNewList}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed text-xs font-medium transition-colors hover:bg-[var(--color-secondary)]"
                style={{
                  borderColor: "var(--color-muted)",
                  borderRadius: "var(--radius)",
                  color: "var(--color-muted-foreground)",
                }}
              >
                + New list
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}