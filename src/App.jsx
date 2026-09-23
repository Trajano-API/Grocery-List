import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { DEFAULT_GROUPS } from "./data/defaults";
import { loadState, saveState } from "./utils/storage";
import { uid } from "./utils/helpers";

import ShoppingList from "./components/ShoppingList";
import OptionsDrawer from "./components/OptionsDrawer";

export default function App() {
  const initial = loadState();

  // Application data

  const [lists, setLists] = useState(initial.lists);
  const [activeListId, setActiveListId] = useState(
    initial.activeId
  );

  // UI state

  const [expandedGroupId, setExpandedGroupId] =
    useState(null);

  const [showOptions, setShowOptions] = useState(false);

  const [optionsTab, setOptionsTab] =
    useState("groups");

  const [inputText, setInputText] = useState("");

  const [selectedGroupId, setSelectedGroupId] =
    useState("");

  const [filter, setFilter] = useState("all");

  const [editingGroupId, setEditingGroupId] =
    useState(null);

  const [editingItemId, setEditingItemId] =
    useState(null);

  const inputRef = useRef(null);

  // Current list

  const activeList =
    lists.find((list) => list.id === activeListId) ??
    lists[0];

  const sortedGroups = [...activeList.groups].sort(
    (a, b) => a.order - b.order
  );

  // Effects

  useEffect(() => {
    if (
      !activeList.groups.some(
        (group) => group.id === selectedGroupId
      )
    ) {
      setSelectedGroupId(sortedGroups[0]?.id ?? "");
    }
  }, [activeListId, activeList.groups]);

  useEffect(() => {
    saveState(lists, activeListId);
  }, [lists, activeListId]);

  // Helper for changing the active list

  const patchList = useCallback(
    (changes) => {
      setLists((currentLists) =>
        currentLists.map((list) =>
          list.id === activeListId
            ? {
                ...list,
                ...changes,
              }
            : list
        )
      );
    },
    [activeListId]
  );

  // Item actions

  function addItem() {
    const text = inputText.trim();

    if (!text || !selectedGroupId) {
      return;
    }

    const newItem = {
      id: uid(),
      text,
      groupId: selectedGroupId,
      checked: false,
      addedAt: Date.now(),
    };

    patchList({
      items: [newItem, ...activeList.items],
    });

    setInputText("");

    inputRef.current?.focus();
  }

  function toggleItem(id) {
    patchList({
      items: activeList.items.map((item) =>
        item.id === id
          ? {
              ...item,
              checked: !item.checked,
            }
          : item
      ),
    });
  }

  function deleteItem(id) {
    patchList({
      items: activeList.items.filter(
        (item) => item.id !== id
      ),
    });
  }

  function updateItem(id, changes) {
    patchList({
      items: activeList.items.map((item) =>
        item.id === id
          ? {
              ...item,
              ...changes,
            }
          : item
      ),
    });
  }

  function clearChecked() {
    patchList({
      items: activeList.items.filter(
        (item) => !item.checked
      ),
    });
  }

  // Group actions

  function toggleGroup(groupId) {
    setExpandedGroupId((current) =>
      current === groupId ? null : groupId
    );
  }

  function addGroup() {
    const newGroup = {
      id: uid(),
      name: "New Group",
      color:
        "#10b981",
      order: activeList.groups.length,
    };

    patchList({
      groups: [...activeList.groups, newGroup],
    });

    setEditingGroupId(newGroup.id);
  }

  function updateGroup(id, changes) {
    patchList({
      groups: activeList.groups.map((group) =>
        group.id === id
          ? {
              ...group,
              ...changes,
            }
          : group
      ),
    });
  }

  function deleteGroup(id) {
    const fallbackId =
      activeList.groups.find(
        (group) => group.id !== id
      )?.id ?? "";

    patchList({
      groups: activeList.groups.filter(
        (group) => group.id !== id
      ),

      items: activeList.items.map((item) =>
        item.groupId === id
          ? {
              ...item,
              groupId: fallbackId,
            }
          : item
      ),
    });

    if (editingGroupId === id) {
      setEditingGroupId(null);
    }
  }

  function moveGroup(id, direction) {
    const sorted = [...activeList.groups].sort(
      (a, b) => a.order - b.order
    );

    const index = sorted.findIndex(
      (group) => group.id === id
    );

    const newIndex = index + direction;

    if (
      newIndex < 0 ||
      newIndex >= sorted.length
    ) {
      return;
    }

    const updated = sorted.map((group, i) => {
      if (i === index) {
        return {
          ...group,
          order: sorted[newIndex].order,
        };
      }

      if (i === newIndex) {
        return {
          ...group,
          order: sorted[index].order,
        };
      }

      return group;
    });

    patchList({
      groups: updated,
    });
  }

  // List actions

  function newList() {
    const id = uid();

    const freshGroups = DEFAULT_GROUPS.map(
      (group) => ({
        ...group,
        id: uid(),
      })
    );

    const newList = {
      id,
      name: "New List",
      groups: freshGroups,
      items: [],
      createdAt: Date.now(),
    };

    setLists((currentLists) => [
      ...currentLists,
      newList,
    ]);

    setActiveListId(id);
    setExpandedGroupId(null);
    setOptionsTab("lists");
  }

  function deleteList(id) {
    if (lists.length === 1) {
      return;
    }

    const remaining = lists.filter(
      (list) => list.id !== id
    );

    setLists(remaining);

    if (activeListId === id) {
      setActiveListId(remaining[0].id);
    }
  }

  function resetList() {
    patchList({
      items: activeList.items.map((item) => ({
        ...item,
        checked: false,
      })),
    });
  }

  function renameList(id, name) {
    setLists((currentLists) =>
      currentLists.map((list) =>
        list.id === id
          ? {
              ...list,
              name,
            }
          : list
      )
    );
  }

  function selectList(id) {
    setActiveListId(id);
    setExpandedGroupId(null);
  }

  // Filtering

  const filteredItems = activeList.items.filter(
    (item) => {
      if (filter === "active") {
        return !item.checked;
      }

      if (filter === "checked") {
        return item.checked;
      }

      return true;
    }
  );

  const checkedCount = activeList.items.filter(
    (item) => item.checked
  ).length;

  const totalCount = activeList.items.length;

  const selectedGroup =
    activeList.groups.find(
      (group) => group.id === selectedGroupId
    ) ?? sortedGroups[0];

  // Render

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: "var(--color-background)",
      }}
    >
      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1
              className="text-4xl text-[var(--color-foreground)] tracking-tight leading-none"
              style={{
                fontFamily: "var(--font-display)",
              }}
            >
              {activeList.name}
            </h1>

            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--color-muted-foreground)] font-medium tabular-nums">
                {checkedCount}/{totalCount}
              </span>

              <button
                onClick={() => setShowOptions(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--color-secondary)]"
                style={{
                  color:
                    "var(--color-muted-foreground)",
                }}
                title="Options"
              >
                ⋮
              </button>
            </div>
          </div>

          <div
            className="mt-2 h-px"
            style={{
              backgroundColor:
                "var(--color-border)",
            }}
          />

          <p className="mt-2 text-xs text-[var(--color-muted-foreground)] tracking-widest uppercase font-medium">
            {new Date().toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                month: "long",
                day: "numeric",
              }
            )}
          </p>
        </header>

        {/* Add item */}
        <div
          className="flex items-center gap-2 p-2 mb-6 border"
          style={{
            backgroundColor:
              "var(--color-card)",
            borderColor:
              "var(--color-border)",
            borderRadius: "var(--radius)",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          {/* Group selector */}
          <select
            value={selectedGroupId}
            onChange={(e) =>
              setSelectedGroupId(e.target.value)
            }
            className="text-xs px-2 py-1.5 border-0 bg-transparent"
            style={{
              color: "var(--color-foreground)",
            }}
          >
            {sortedGroups.map((group) => (
              <option
                key={group.id}
                value={group.id}
              >
                {group.name}
              </option>
            ))}
          </select>

          <div
            className="w-px h-5"
            style={{
              backgroundColor:
                "var(--color-border)",
            }}
          />

          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) =>
              setInputText(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addItem();
              }
            }}
            placeholder="Add an item…"
            className="flex-1 bg-transparent text-sm placeholder-[var(--color-muted-foreground)] text-[var(--color-foreground)]"
          />

          <button
            onClick={addItem}
            disabled={!inputText.trim()}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-all"
            style={{
              backgroundColor: inputText.trim()
                ? "var(--color-primary)"
                : "var(--color-muted)",
              color: inputText.trim()
                ? "var(--color-primary-foreground)"
                : "var(--color-muted-foreground)",
            }}
          >
            +
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-1 mb-6">
          {["all", "active", "checked"].map(
            (filterOption) => (
              <button
                key={filterOption}
                onClick={() =>
                  setFilter(filterOption)
                }
                className="px-3 py-1 text-xs font-medium capitalize transition-colors"
                style={{
                  borderRadius:
                    "var(--radius)",
                  backgroundColor:
                    filter === filterOption
                      ? "var(--color-foreground)"
                      : "transparent",
                  color:
                    filter === filterOption
                      ? "var(--color-background)"
                      : "var(--color-muted-foreground)",
                }}
              >
                {filterOption}
              </button>
            )
          )}

          {checkedCount > 0 && (
            <button
              onClick={clearChecked}
              className="ml-auto px-3 py-1 text-xs font-medium transition-colors"
              style={{
                color: "var(--color-accent)",
                borderRadius:
                  "var(--radius)",
              }}
            >
              Clear {checkedCount} done
            </button>
          )}
        </div>

        {/* Shopping list */}
        <ShoppingList
          groups={sortedGroups}
          items={filteredItems}
          expandedGroupId={expandedGroupId}
          editingItemId={editingItemId}
          onToggleGroup={toggleGroup}
          onToggleItem={toggleItem}
          onDeleteItem={deleteItem}
          onUpdateItem={updateItem}
          onEditItem={(id) =>
            setEditingItemId((current) =>
              current === id ? null : id
            )
          }
        />

        {/* Footer */}
        {totalCount > 0 && (
          <div
            className="mt-10 pt-4 border-t space-y-1"
            style={{
              borderColor:
                "var(--color-border)",
            }}
          >
            <div className="flex justify-between text-xs text-[var(--color-muted-foreground)]">
              <span>
                {totalCount - checkedCount} items
                remaining
              </span>

              <span>
                {checkedCount} checked off
              </span>
            </div>

            {(() => {
              const priced =
                activeList.items.filter(
                  (item) =>
                    item.price != null &&
                    item.qty != null
                );

              if (priced.length === 0) {
                return null;
              }

              const itemTotal = (item) =>
                (item.price ?? 0) *
                (item.qty ?? 1);

              const total = priced.reduce(
                (sum, item) =>
                  sum + itemTotal(item),
                0
              );

              const checkedTotal =
                priced
                  .filter(
                    (item) => item.checked
                  )
                  .reduce(
                    (sum, item) =>
                      sum + itemTotal(item),
                    0
                  );

              return (
                <div className="flex justify-between text-xs">
                  <span
                    style={{
                      color:
                        "var(--color-muted-foreground)",
                    }}
                  >
                    Est. total ({priced.length} priced)
                  </span>

                  <span
                    className="font-semibold"
                    style={{
                      color:
                        "var(--color-primary)",
                    }}
                  >
                    ${checkedTotal.toFixed(2)} / $
                    {total.toFixed(2)}
                  </span>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Options drawer */}
      <OptionsDrawer
        open={showOptions}
        onClose={() => setShowOptions(false)}
        activeList={activeList}
        lists={lists}
        optionsTab={optionsTab}
        setOptionsTab={setOptionsTab}
        editingGroupId={editingGroupId}
        setEditingGroupId={setEditingGroupId}
        onUpdateGroup={updateGroup}
        onDeleteGroup={deleteGroup}
        onMoveGroup={moveGroup}
        onAddGroup={addGroup}
        onResetList={resetList}
        onDeleteList={deleteList}
        onNewList={newList}
        onSelectList={selectList}
        onRenameList={renameList}
      />
    </div>
  );
}