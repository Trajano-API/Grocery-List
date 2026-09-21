import { useState, useRef, useEffect, useCallback } from "react";
const UNITS = ["units", "pack", "kg", "g", "L", "ml"];
// ─── Constants ────────────────────────────────────────────────────────────────
const GROUP_COLORS = [
    { label: "Sage", bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500", hex: "#10b981" },
    { label: "Sky", bg: "bg-sky-100", text: "text-sky-800", dot: "bg-sky-500", hex: "#0ea5e9" },
    { label: "Amber", bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500", hex: "#f59e0b" },
    { label: "Rose", bg: "bg-rose-100", text: "text-rose-800", dot: "bg-rose-500", hex: "#f43f5e" },
    { label: "Orange", bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-500", hex: "#f97316" },
    { label: "Violet", bg: "bg-violet-100", text: "text-violet-800", dot: "bg-violet-500", hex: "#8b5cf6" },
    { label: "Teal", bg: "bg-teal-100", text: "text-teal-800", dot: "bg-teal-500", hex: "#14b8a6" },
    { label: "Stone", bg: "bg-stone-100", text: "text-stone-700", dot: "bg-stone-400", hex: "#78716c" },
];
const DEFAULT_GROUPS = [
    { id: "produce", name: "Produce", color: "#10b981", order: 0 },
    { id: "dairy", name: "Dairy", color: "#0ea5e9", order: 1 },
    { id: "bakery", name: "Bakery", color: "#f59e0b", order: 2 },
    { id: "meat", name: "Meat", color: "#f43f5e", order: 3 },
    { id: "pantry", name: "Pantry", color: "#f97316", order: 4 },
    { id: "other", name: "Other", color: "#78716c", order: 5 },
];
const DEFAULT_ITEMS = [
    { id: "i1", text: "Sourdough loaf", groupId: "bakery", checked: false, addedAt: Date.now() - 5000 },
    { id: "i2", text: "Whole milk, 2 L", groupId: "dairy", checked: false, addedAt: Date.now() - 4000 },
    { id: "i3", text: "Cherry tomatoes", groupId: "produce", checked: true, addedAt: Date.now() - 3000 },
    { id: "i4", text: "Free-range eggs ×12", groupId: "dairy", checked: false, addedAt: Date.now() - 2000 },
    { id: "i5", text: "Chicken thighs", groupId: "meat", checked: false, addedAt: Date.now() - 1000 },
    { id: "i6", text: "Olive oil, extra virgin", groupId: "pantry", checked: true, addedAt: Date.now() },
];
const STORAGE_KEY = "groceries-app-v1";
// ─── Persistence ──────────────────────────────────────────────────────────────
function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw)
            return JSON.parse(raw);
    }
    catch { }
    const defaultList = {
        id: "default",
        name: "Weekly Shop",
        groups: DEFAULT_GROUPS,
        items: DEFAULT_ITEMS,
        createdAt: Date.now(),
    };
    return { lists: [defaultList], activeId: "default" };
}
function saveState(lists, activeId) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ lists, activeId }));
    }
    catch { }
}
// ─── Helpers ──────────────────────────────────────────────────────────────────
function colorForHex(hex) {
    return GROUP_COLORS.find((c) => c.hex === hex) ?? GROUP_COLORS[7];
}
function uid() {
  const webCrypto = globalThis.crypto;
  if (typeof webCrypto?.randomUUID === "function") {
    return webCrypto.randomUUID();
  }
  if (typeof webCrypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    webCrypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
// ─── Sub-components ───────────────────────────────────────────────────────────
function ColorSwatches({ value, onChange, }) {
    return (<div className="flex gap-1.5 flex-wrap">
      {GROUP_COLORS.map((c) => (<button key={c.hex} onClick={() => onChange(c.hex)} title={c.label} className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${c.dot}`} style={{
                outline: value === c.hex ? "2px solid var(--color-foreground)" : "2px solid transparent",
                outlineOffset: "2px",
            }}/>))}
    </div>);
}
// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
    const initial = loadState();
    const [lists, setLists] = useState(initial.lists);
    const [activeListId, setActiveListId] = useState(initial.activeId);
    // UI state
    const [expandedGroupId, setExpandedGroupId] = useState(null);
    const [showOptions, setShowOptions] = useState(false);
    const [optionsTab, setOptionsTab] = useState("groups");
    const [inputText, setInputText] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [showGroupPicker, setShowGroupPicker] = useState(false);
    const [filter, setFilter] = useState("all");
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingListName, setEditingListName] = useState(false);
    const [listNameDraft, setListNameDraft] = useState("");
    const inputRef = useRef(null);
    const pickerRef = useRef(null);
    const drawerRef = useRef(null);
    const activeList = lists.find((l) => l.id === activeListId) ?? lists[0];
    const sortedGroups = [...activeList.groups].sort((a, b) => a.order - b.order);
    // Keep selectedGroupId valid
    useEffect(() => {
        if (!activeList.groups.find((g) => g.id === selectedGroupId)) {
            setSelectedGroupId(sortedGroups[0]?.id ?? "");
        }
    }, [activeListId, activeList.groups]);
    // Persist on change
    useEffect(() => {
        saveState(lists, activeListId);
    }, [lists, activeListId]);
    // Close picker on outside click
    useEffect(() => {
        function handler(e) {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setShowGroupPicker(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    // Patch active list helper
    const patchList = useCallback((patch) => {
        setLists((prev) => prev.map((l) => (l.id === activeListId ? { ...l, ...patch } : l)));
    }, [activeListId]);
    // ── Item actions ──────────────────────────────────────────────────────────
    const addItem = () => {
        const text = inputText.trim();
        if (!text || !selectedGroupId)
            return;
        patchList({
            items: [
                { id: uid(), text, groupId: selectedGroupId, checked: false, addedAt: Date.now() },
                ...activeList.items,
            ],
        });
        setInputText("");
        inputRef.current?.focus();
    };
    const toggleItem = (id) => {
        patchList({
            items: activeList.items.map((i) => i.id === id ? { ...i, checked: !i.checked } : i),
        });
    };
    const deleteItem = (id) => {
        patchList({ items: activeList.items.filter((i) => i.id !== id) });
    };
    const updateItem = (id, patch) => {
        patchList({
            items: activeList.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        });
    };
    const clearChecked = () => {
        patchList({ items: activeList.items.filter((i) => !i.checked) });
    };
    // ── Group accordion ───────────────────────────────────────────────────────
    const toggleGroup = (groupId) => {
        setExpandedGroupId((prev) => (prev === groupId ? null : groupId));
    };
    // ── Group editing ─────────────────────────────────────────────────────────
    const addGroup = () => {
        const newGroup = {
            id: uid(),
            name: "New Group",
            color: GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)].hex,
            order: activeList.groups.length,
        };
        patchList({ groups: [...activeList.groups, newGroup] });
        setEditingGroupId(newGroup.id);
    };
    const updateGroup = (id, patch) => {
        patchList({
            groups: activeList.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        });
    };
    const deleteGroup = (id) => {
        const fallbackId = activeList.groups.find((g) => g.id !== id)?.id ?? "";
        patchList({
            groups: activeList.groups.filter((g) => g.id !== id),
            items: activeList.items.map((i) => i.groupId === id ? { ...i, groupId: fallbackId } : i),
        });
        if (editingGroupId === id)
            setEditingGroupId(null);
    };
    const moveGroup = (id, dir) => {
        const sorted = [...activeList.groups].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex((g) => g.id === id);
        const newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= sorted.length)
            return;
        // Swap orders
        const updated = sorted.map((g, i) => {
            if (i === idx)
                return { ...g, order: sorted[newIdx].order };
            if (i === newIdx)
                return { ...g, order: sorted[idx].order };
            return g;
        });
        patchList({ groups: updated });
    };
    // ── List actions ──────────────────────────────────────────────────────────
    const newList = () => {
        const id = uid();
        const freshGroups = DEFAULT_GROUPS.map((g) => ({ ...g, id: uid() }));
        const l = {
            id,
            name: "New List",
            groups: freshGroups,
            items: [],
            createdAt: Date.now(),
        };
        setLists((prev) => [...prev, l]);
        setActiveListId(id);
        setExpandedGroupId(null);
        setOptionsTab("lists");
        setListNameDraft("New List");
        setEditingListName(true);
    };
    const deleteList = (id) => {
        if (lists.length === 1)
            return;
        const remaining = lists.filter((l) => l.id !== id);
        setLists(remaining);
        if (activeListId === id)
            setActiveListId(remaining[0].id);
    };
    const resetList = () => {
        patchList({ items: activeList.items.map((i) => ({ ...i, checked: false })) });
    };
    const renameList = (id, name) => {
        setLists((prev) => prev.map((l) => (l.id === id ? { ...l, name } : l)));
    };
    // ── Filtered + grouped items ───────────────────────────────────────────────
    const filteredItems = activeList.items.filter((i) => {
        if (filter === "active")
            return !i.checked;
        if (filter === "checked")
            return i.checked;
        return true;
    });
    const groupedSections = sortedGroups.map((g) => ({
        group: g,
        items: filteredItems.filter((i) => i.groupId === g.id),
    })).filter((s) => s.items.length > 0 || sortedGroups.length > 0);
    const checkedCount = activeList.items.filter((i) => i.checked).length;
    const totalCount = activeList.items.length;
    const selGroup = activeList.groups.find((g) => g.id === selectedGroupId) ?? sortedGroups[0];
    // ── Render ────────────────────────────────────────────────────────────────
    return (<div className="min-h-screen relative" style={{ backgroundColor: "var(--color-background)" }}>
      <div className="max-w-lg mx-auto px-4 py-10">

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl text-[var(--color-foreground)] tracking-tight leading-none" style={{ fontFamily: "var(--font-display)" }}>
              {activeList.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--color-muted-foreground)] font-medium tabular-nums">
                {checkedCount}/{totalCount}
              </span>
              {/* Options button */}
              <button onClick={() => { setShowOptions(true); }} className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--color-secondary)]" style={{ color: "var(--color-muted-foreground)" }} title="Options">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="3" r="1.2" fill="currentColor"/>
                  <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
                  <circle cx="8" cy="13" r="1.2" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-2 h-px" style={{ backgroundColor: "var(--color-border)" }}/>
          <p className="mt-2 text-xs text-[var(--color-muted-foreground)] tracking-widest uppercase font-medium">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </header>

        {/* Input */}
        <div className="flex items-center gap-2 p-2 mb-6 border" style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
            borderRadius: "var(--radius)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)",
        }}>
          {/* Group picker */}
          <div className="relative" ref={pickerRef}>
            <button onClick={() => setShowGroupPicker((v) => !v)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors" style={{
            backgroundColor: showGroupPicker ? "var(--color-secondary)" : "transparent",
            borderRadius: "var(--radius)",
            color: "var(--color-foreground)",
        }}>
              {selGroup && (<span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selGroup.color }}/>)}
              <span className="max-w-[80px] truncate">{selGroup?.name ?? "Group"}</span>
              <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 12 12">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {showGroupPicker && (<div className="absolute top-full left-0 mt-1 z-20 w-40 border py-1" style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                borderRadius: "var(--radius)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            }}>
                {sortedGroups.map((g) => (<button key={g.id} onClick={() => { setSelectedGroupId(g.id); setShowGroupPicker(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-secondary)] transition-colors text-left" style={{ color: "var(--color-foreground)" }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }}/>
                    <span className="truncate">{g.name}</span>
                  </button>))}
              </div>)}
          </div>

          <div className="w-px h-5" style={{ backgroundColor: "var(--color-border)" }}/>

          <input ref={inputRef} type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} placeholder="Add an item…" className="flex-1 bg-transparent text-sm placeholder-[var(--color-muted-foreground)] text-[var(--color-foreground)]"/>

          <button onClick={addItem} disabled={!inputText.trim()} className="w-7 h-7 flex items-center justify-center rounded-full transition-all" style={{
            backgroundColor: inputText.trim() ? "var(--color-primary)" : "var(--color-muted)",
            color: inputText.trim() ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
        }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6">
          {["all", "active", "checked"].map((f) => (<button key={f} onClick={() => setFilter(f)} className="px-3 py-1 text-xs font-medium capitalize transition-colors" style={{
                borderRadius: "var(--radius)",
                backgroundColor: filter === f ? "var(--color-foreground)" : "transparent",
                color: filter === f ? "var(--color-background)" : "var(--color-muted-foreground)",
            }}>
              {f}
            </button>))}
          {checkedCount > 0 && (<button onClick={clearChecked} className="ml-auto px-3 py-1 text-xs font-medium transition-colors" style={{ color: "var(--color-accent)", borderRadius: "var(--radius)" }}>
              Clear {checkedCount} done
            </button>)}
        </div>

        {/* Grouped list with accordion */}
        <div className="space-y-3">
          {sortedGroups.map((group) => {
            const sectionItems = filteredItems.filter((i) => i.groupId === group.id);
            const isExpanded = expandedGroupId === group.id;
            const activeItems = sectionItems.filter((i) => !i.checked).length;
            const colorMeta = colorForHex(group.color);
            return (<section key={group.id}>
                {/* Group header — clickable accordion toggle */}
                <button onClick={() => toggleGroup(group.id)} className="w-full flex items-center gap-2 mb-2 group/header">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorMeta.bg} ${colorMeta.text} transition-opacity`}>
                    {group.name}
                  </span>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {activeItems > 0 ? `${activeItems} left` : sectionItems.length > 0 ? "all done" : "empty"}
                  </span>
                  <span className="ml-auto text-[var(--color-muted-foreground)] transition-transform duration-200" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
                      <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>

                {/* Items — shown only when expanded */}
                {isExpanded && (<div className="border divide-y overflow-hidden" style={{
                        borderColor: "var(--color-border)",
                        borderRadius: "var(--radius)",
                        backgroundColor: "var(--color-card)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}>
                    {sectionItems.length === 0 ? (<div className="px-4 py-4 text-xs text-[var(--color-muted-foreground)] italic">
                        No items in this group
                      </div>) : (sectionItems.map((item) => {
                        const isEditingItem = editingItemId === item.id;
                        return (<div key={item.id} style={{ borderTop: `1px solid var(--color-border)` }}>
                            {/* Item row */}
                            <div className="flex items-center gap-3 px-3 py-3 group hover:bg-[var(--color-secondary)] transition-colors">
                              <button onClick={() => toggleItem(item.id)} className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all" style={{
                                borderColor: item.checked ? "var(--color-primary)" : "var(--color-muted)",
                                backgroundColor: item.checked ? "var(--color-primary)" : "transparent",
                            }}>
                                {item.checked && (<svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 10 10">
                                    <path d="M1.5 5l2.5 2.5 4.5-5" stroke="var(--color-primary-foreground)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>)}
                              </button>

                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium" style={{
                                color: item.checked ? "var(--color-muted-foreground)" : "var(--color-foreground)",
                                textDecorationLine: item.checked ? "line-through" : "none",
                                textDecorationColor: item.checked ? "var(--color-muted)" : "transparent",
                            }}>
                                  {item.text}
                                </span>
                                {/* Qty / unit / price summary */}
                                {(item.qty != null || item.price != null) && (<div className="flex items-center gap-2 mt-0.5">
                                    {item.qty != null && (<span className="text-xs text-[var(--color-muted-foreground)]">
                                        {item.qty} {item.unit ?? "units"}
                                      </span>)}
                                    {item.price != null && (<span className="text-xs text-[var(--color-muted-foreground)]">
                                        ${item.price.toFixed(2)}/{item.unit ?? "unit"}
                                      </span>)}
                                    {item.price != null && item.qty != null && (<span className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>
                                        = ${(item.price * item.qty).toFixed(2)}
                                      </span>)}
                                  </div>)}
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {/* Edit button */}
                                <button onClick={() => setEditingItemId(isEditingItem ? null : item.id)} className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-muted)]" style={{ color: isEditingItem ? "var(--color-primary)" : "var(--color-muted-foreground)" }}>
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
                                    <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                                {/* Delete button */}
                                <button onClick={() => deleteItem(item.id)} className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-rose-50" style={{ color: "var(--color-accent)" }}>
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
                                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Inline edit panel */}
                            {isEditingItem && (<div className="px-3 py-3 border-t grid grid-cols-3 gap-2" style={{
                                    borderColor: "var(--color-border)",
                                    backgroundColor: "var(--color-background)",
                                }}>
                                {/* Name */}
                                <div className="col-span-3">
                                  <label className="text-xs text-[var(--color-muted-foreground)] mb-1 block">Name</label>
                                  <input autoFocus value={item.text} onChange={(e) => updateItem(item.id, { text: e.target.value })} onKeyDown={(e) => e.key === "Enter" && setEditingItemId(null)} className="w-full text-sm px-2.5 py-1.5 border" style={{
                                    borderColor: "var(--color-border)",
                                    borderRadius: "var(--radius)",
                                    backgroundColor: "var(--color-card)",
                                    color: "var(--color-foreground)",
                                }}/>
                                </div>

                                {/* Qty */}
                                <div>
                                  <label className="text-xs text-[var(--color-muted-foreground)] mb-1 block">Qty</label>
                                  <input type="number" min="0" step={item.unit === "units" || item.unit === "pack" || item.unit == null ? "1" : "0.1"} value={item.qty ?? ""} onChange={(e) => {
                                    if (e.target.value === "") {
                                        updateItem(item.id, { qty: undefined });
                                        return;
                                    }
                                    const isInt = item.unit === "units" || item.unit === "pack" || item.unit == null;
                                    updateItem(item.id, { qty: isInt ? parseInt(e.target.value, 10) : parseFloat(e.target.value) });
                                }} placeholder="—" className="w-full text-sm px-2.5 py-1.5 border" style={{
                                    borderColor: "var(--color-border)",
                                    borderRadius: "var(--radius)",
                                    backgroundColor: "var(--color-card)",
                                    color: "var(--color-foreground)",
                                }}/>
                                </div>

                                {/* Unit */}
                                <div>
                                  <label className="text-xs text-[var(--color-muted-foreground)] mb-1 block">Unit</label>
                                  <select value={item.unit ?? "units"} onChange={(e) => {
                                    const u = e.target.value;
                                    const patch = { unit: u };
                                    if ((u === "units" || u === "pack") && item.qty != null) {
                                        patch.qty = Math.round(item.qty);
                                    }
                                    updateItem(item.id, patch);
                                }} className="w-full text-sm px-2 py-1.5 border appearance-none" style={{
                                    borderColor: "var(--color-border)",
                                    borderRadius: "var(--radius)",
                                    backgroundColor: "var(--color-card)",
                                    color: "var(--color-foreground)",
                                }}>
                                    {UNITS.map((u) => (<option key={u} value={u}>{u}</option>))}
                                  </select>
                                </div>

                                {/* Price */}
                                <div>
                                  <label className="text-xs text-[var(--color-muted-foreground)] mb-1 block">Price per {item.unit ?? "unit"} ($)</label>
                                  <input type="number" min="0" step="0.01" value={item.price ?? ""} onChange={(e) => updateItem(item.id, { price: e.target.value === "" ? undefined : parseFloat(e.target.value) })} placeholder="—" className="w-full text-sm px-2.5 py-1.5 border" style={{
                                    borderColor: "var(--color-border)",
                                    borderRadius: "var(--radius)",
                                    backgroundColor: "var(--color-card)",
                                    color: "var(--color-foreground)",
                                }}/>
                                </div>

                                {/* Done */}
                                <div className="col-span-3 flex justify-end">
                                  <button onClick={() => setEditingItemId(null)} className="text-xs font-medium px-3 py-1.5 transition-colors" style={{
                                    backgroundColor: "var(--color-primary)",
                                    color: "var(--color-primary-foreground)",
                                    borderRadius: "var(--radius)",
                                }}>
                                    Done
                                  </button>
                                </div>
                              </div>)}
                          </div>);
                    }))}
                  </div>)}
              </section>);
        })}
        </div>

        {/* Footer tally */}
        {totalCount > 0 && (<div className="mt-10 pt-4 border-t space-y-1" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex justify-between text-xs text-[var(--color-muted-foreground)]">
              <span>{totalCount - checkedCount} items remaining</span>
              <span>{checkedCount} checked off</span>
            </div>
            {(() => {
                const priced = activeList.items.filter((i) => i.price != null && i.qty != null);
                if (priced.length === 0)
                    return null;
                const itemTotal = (i) => (i.price ?? 0) * (i.qty ?? 1);
                const total = priced.reduce((sum, i) => sum + itemTotal(i), 0);
                const checkedTotal = priced.filter((i) => i.checked).reduce((sum, i) => sum + itemTotal(i), 0);
                return (<div className="flex justify-between text-xs">
                  <span style={{ color: "var(--color-muted-foreground)" }}>Est. total ({priced.length} priced)</span>
                  <span className="font-semibold" style={{ color: "var(--color-primary)" }}>
                    ${checkedTotal.toFixed(2)} / ${total.toFixed(2)}
                  </span>
                </div>);
            })()}
          </div>)}
      </div>

      {/* ── Options Drawer Backdrop ── */}
      {showOptions && (<div className="fixed inset-0 z-30" style={{ backgroundColor: "rgba(26,23,19,0.35)" }} onClick={() => setShowOptions(false)}/>)}

      {/* ── Options Drawer ── */}
      <div ref={drawerRef} className="fixed top-0 right-0 h-full z-40 flex flex-col" style={{
            width: "min(380px, 100vw)",
            backgroundColor: "var(--color-card)",
            borderLeft: "1px solid var(--color-border)",
            boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
            transform: showOptions ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
            Options
          </h2>
          <button onClick={() => setShowOptions(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--color-secondary)] transition-colors" style={{ color: "var(--color-muted-foreground)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 14 14">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: "var(--color-border)" }}>
          {["groups", "lists"].map((tab) => (<button key={tab} onClick={() => setOptionsTab(tab)} className="flex-1 py-3 text-xs font-semibold uppercase tracking-widest transition-colors" style={{
                color: optionsTab === tab ? "var(--color-foreground)" : "var(--color-muted-foreground)",
                borderBottom: optionsTab === tab ? "2px solid var(--color-foreground)" : "2px solid transparent",
            }}>
              {tab}
            </button>))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Groups tab ── */}
          {optionsTab === "groups" && (<div className="p-5 space-y-4">
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Click a group header on the list to expand or collapse it. Only one group is open at a time.
              </p>

              {sortedGroups.map((group, idx) => {
                const isEditing = editingGroupId === group.id;
                const colorMeta = colorForHex(group.color);
                return (<div key={group.id} className="border rounded overflow-hidden" style={{ borderColor: "var(--color-border)", borderRadius: "var(--radius)" }}>
                    {/* Group row header */}
                    <div className="flex items-center gap-2 px-3 py-2.5" style={{ backgroundColor: "var(--color-background)" }}>
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }}/>
                      <span className="flex-1 text-sm font-medium truncate">{group.name}</span>
                      <div className="flex items-center gap-1">
                        {/* Move up */}
                        <button onClick={() => moveGroup(group.id, -1)} disabled={idx === 0} className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-secondary)] disabled:opacity-30" style={{ color: "var(--color-muted-foreground)" }}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                            <path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        {/* Move down */}
                        <button onClick={() => moveGroup(group.id, 1)} disabled={idx === sortedGroups.length - 1} className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-secondary)] disabled:opacity-30" style={{ color: "var(--color-muted-foreground)" }}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        {/* Edit toggle */}
                        <button onClick={() => setEditingGroupId(isEditing ? null : group.id)} className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-secondary)]" style={{ color: isEditing ? "var(--color-primary)" : "var(--color-muted-foreground)" }}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
                            <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        {/* Delete */}
                        <button onClick={() => deleteGroup(group.id)} disabled={activeList.groups.length <= 1} className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-rose-50 disabled:opacity-30" style={{ color: "var(--color-accent)" }}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
                            <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.7 7.5h6.6L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Inline edit panel */}
                    {isEditing && (<div className="px-3 py-3 space-y-3 border-t" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}>
                        <div>
                          <label className="text-xs text-[var(--color-muted-foreground)] mb-1 block">Name</label>
                          <input autoFocus value={group.name} onChange={(e) => updateGroup(group.id, { name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && setEditingGroupId(null)} className="w-full text-sm px-2.5 py-1.5 border rounded bg-[var(--color-background)]" style={{
                            borderColor: "var(--color-border)",
                            borderRadius: "var(--radius)",
                            color: "var(--color-foreground)",
                        }}/>
                        </div>
                        <div>
                          <label className="text-xs text-[var(--color-muted-foreground)] mb-2 block">Color</label>
                          <ColorSwatches value={group.color} onChange={(hex) => updateGroup(group.id, { color: hex })}/>
                        </div>
                      </div>)}
                  </div>);
            })}

              {/* Add group */}
              <button onClick={addGroup} className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed text-xs font-medium transition-colors hover:bg-[var(--color-secondary)]" style={{
                borderColor: "var(--color-muted)",
                borderRadius: "var(--radius)",
                color: "var(--color-muted-foreground)",
            }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Add group
              </button>
            </div>)}

          {/* ── Lists tab ── */}
          {optionsTab === "lists" && (<div className="p-5 space-y-5">
              {/* Current list actions */}
              <div>
                <p className="text-xs text-[var(--color-muted-foreground)] mb-3 uppercase tracking-widest font-medium">Current list</p>

                {/* List name editable */}
                <div className="flex items-center gap-2 p-2.5 border mb-3" style={{
                borderColor: "var(--color-border)",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--color-background)",
            }}>
                  {editingListName ? (<input autoFocus value={listNameDraft} onChange={(e) => setListNameDraft(e.target.value)} onBlur={() => { renameList(activeListId, listNameDraft || activeList.name); setEditingListName(false); }} onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        renameList(activeListId, listNameDraft || activeList.name);
                        setEditingListName(false);
                    }
                    if (e.key === "Escape")
                        setEditingListName(false);
                }} className="flex-1 bg-transparent text-sm font-medium text-[var(--color-foreground)]"/>) : (<span className="flex-1 text-sm font-medium text-[var(--color-foreground)] truncate">{activeList.name}</span>)}
                  <button onClick={() => { setListNameDraft(activeList.name); setEditingListName(true); }} className="flex-shrink-0 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                    Rename
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={resetList} className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium border transition-colors hover:bg-[var(--color-secondary)]" style={{
                borderColor: "var(--color-border)",
                borderRadius: "var(--radius)",
                color: "var(--color-foreground)",
            }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
                      <path d="M1.5 7A5.5 5.5 0 1 0 3.2 3.2M1.5 1v2.5H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Reset list
                  </button>
                  <button onClick={() => deleteList(activeListId)} disabled={lists.length <= 1} className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium border transition-colors hover:bg-rose-50 disabled:opacity-30" style={{
                borderColor: "var(--color-border)",
                borderRadius: "var(--radius)",
                color: "var(--color-accent)",
            }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
                      <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.7 7.5h6.6L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Delete list
                  </button>
                </div>
              </div>

              <div className="h-px" style={{ backgroundColor: "var(--color-border)" }}/>

              {/* All saved lists */}
              <div>
                <p className="text-xs text-[var(--color-muted-foreground)] mb-3 uppercase tracking-widest font-medium">Saved lists</p>
                <div className="space-y-1.5">
                  {lists.map((l) => (<button key={l.id} onClick={() => { setActiveListId(l.id); setExpandedGroupId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-left border transition-colors" style={{
                    borderColor: l.id === activeListId ? "var(--color-primary)" : "var(--color-border)",
                    borderRadius: "var(--radius)",
                    backgroundColor: l.id === activeListId ? "rgba(45,90,39,0.06)" : "var(--color-background)",
                    color: "var(--color-foreground)",
                }}>
                      <span className="flex-1 text-sm font-medium truncate">{l.name}</span>
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        {l.items.length} item{l.items.length !== 1 ? "s" : ""}
                      </span>
                      {l.id === activeListId && (<svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 14 14" style={{ color: "var(--color-primary)" }}>
                          <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>)}
                    </button>))}
                </div>
              </div>

              {/* New list */}
              <button onClick={newList} className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed text-xs font-medium transition-colors hover:bg-[var(--color-secondary)]" style={{
                borderColor: "var(--color-muted)",
                borderRadius: "var(--radius)",
                color: "var(--color-muted-foreground)",
            }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                New list
              </button>
            </div>)}
        </div>
      </div>
    </div>);
}
