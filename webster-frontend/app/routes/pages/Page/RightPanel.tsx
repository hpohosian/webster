import { useState } from "react";
import {
  Layers,
  History,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MoreVertical,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  GitMerge,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Slider from "@radix-ui/react-slider";

const API = import.meta.env.VITE_API;

type PanelTab = "layers" | "history" | null;

interface RightPanelProps {
  elements: any[];
  setElements: React.Dispatch<React.SetStateAction<any[]>>;
  projectId: string;
}

export function RightPanel({ elements, setElements, projectId }: RightPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>("layers");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Local-only visibility toggle (CSS opacity on canvas side, no DB column for it yet)
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [locked, setLocked] = useState<Set<string>>(new Set());

  const historyItems = ["Upload Image", "Adjust Brightness", "Add Text", "Apply Filter"];

  // ── Helpers ──────────────────────────────────────────────────────────────

  const patchElement = (id: string, body: Record<string, any>) =>
    fetch(`${API}/elements/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  // ── Actions ───────────────────────────────────────────────────────────────

  const toggleVisibility = (id: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleLock = (id: string) =>
    setLocked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const deleteElement = async (id: string) => {
    await fetch(`${API}/elements/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateElement = async (id: string) => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const res = await fetch(`${API}/elements`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        type: el.type,
        x: el.x + 20,
        y: el.y + 20,
        width: el.width,
        height: el.height,
        rotation: el.rotation,
        scale: el.scale,
        zIndex: el.zIndex + 1,
        data: el.data,
      }),
    });
    const newEl = await res.json();
    setElements((prev) => [...prev, newEl]);
  };

  const moveUp = async (id: string) => {
    const idx = elements.findIndex((el) => el.id === id);
    if (idx >= elements.length - 1) return;
    const a = elements[idx];
    const b = elements[idx + 1];
    await Promise.all([
      patchElement(a.id, { zIndex: b.zIndex }),
      patchElement(b.id, { zIndex: a.zIndex }),
    ]);
    const next = [...elements];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setElements(next);
  };

  const moveDown = async (id: string) => {
    const idx = elements.findIndex((el) => el.id === id);
    if (idx <= 0) return;
    const a = elements[idx];
    const b = elements[idx - 1];
    await Promise.all([
      patchElement(a.id, { zIndex: b.zIndex }),
      patchElement(b.id, { zIndex: a.zIndex }),
    ]);
    const next = [...elements];
    [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
    setElements(next);
  };

  const updateOpacity = async (id: string, opacity: number) => {
    await patchElement(id, { data: { ...elements.find((el) => el.id === id)?.data, opacity } });
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, data: { ...el.data, opacity } } : el))
    );
  };

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const finishRename = () => {
    // name lives only in local display (elements have type, not a custom name)
    setEditingId(null);
    setEditName("");
  };

  // ── Collapsed sidebar ─────────────────────────────────────────────────────

  if (isCollapsed) {
    return (
      <div className="w-12 bg-[#0f0f14] border-l border-border flex flex-col items-center py-4 gap-2">
        <button
          onClick={() => { setIsCollapsed(false); setActiveTab("layers"); }}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Layers"
        >
          <Layers className="w-5 h-5" />
        </button>
        <button
          onClick={() => { setIsCollapsed(false); setActiveTab("history"); }}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="History"
        >
          <History className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Full panel ─────────────────────────────────────────────────────────────

  const displayedElements = [...elements].reverse(); // top layer first

  return (
    <div className="w-64 bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-3">
        <div className="flex gap-1 items-center">
          <button
            onClick={() => setActiveTab("layers")}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              activeTab === "layers"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              activeTab === "history"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-4 h-4" />
          </button>

          {activeTab === "layers" && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="min-w-[200px] bg-popover border border-border rounded-lg shadow-lg p-1 z-50">
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center justify-between">
                    New Group
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-border my-1" />
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                    Merge Visible
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                    Flatten Image
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "layers" && (
          <div className="space-y-1">
            {elements.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No elements yet. Upload an image or add a shape.
              </p>
            )}

            {displayedElements.map((el) => {
              const isSelected = selectedId === el.id;
              const isVisible = !hidden.has(el.id);
              const isLocked = locked.has(el.id);
              const displayName = `${el.type} · ${el.id.slice(0, 6)}`;

              return (
                <div
                  key={el.id}
                  onClick={() => setSelectedId(el.id)}
                  className={`flex items-center gap-2 p-2 rounded group cursor-pointer ${
                    isSelected
                      ? "bg-primary/20 ring-1 ring-primary"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {/* Visibility */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleVisibility(el.id); }}
                    className="p-1 hover:bg-background rounded flex-shrink-0"
                  >
                    {isVisible
                      ? <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>

                  {/* Thumbnail */}
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-primary/30 to-primary/10 border border-border flex-shrink-0 flex items-center justify-center">
                    <span className="text-[9px] text-muted-foreground uppercase">{el.type[0]}</span>
                  </div>

                  {/* Name / rename */}
                  {editingId === el.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={finishRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") finishRename();
                        if (e.key === "Escape") { setEditingId(null); setEditName(""); }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 text-sm bg-background px-2 py-0.5 rounded text-foreground"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="flex-1 text-xs text-foreground truncate"
                      onDoubleClick={(e) => { e.stopPropagation(); startRename(el.id, displayName); }}
                    >
                      {displayName}
                    </span>
                  )}

                  {/* Lock */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLock(el.id); }}
                    className="p-1 hover:bg-background rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isLocked
                      ? <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                      : <Unlock className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>

                  {/* Context menu */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 hover:bg-background rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content className="min-w-[180px] bg-popover border border-border rounded-lg shadow-lg p-1 z-50">
                        <DropdownMenu.Item
                          className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center gap-2"
                          onClick={() => duplicateElement(el.id)}
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className="h-px bg-border my-1" />
                        <DropdownMenu.Item
                          className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center gap-2"
                          onClick={() => moveUp(el.id)}
                        >
                          <MoveUp className="w-4 h-4" />
                          Move Up
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center gap-2"
                          onClick={() => moveDown(el.id)}
                        >
                          <MoveDown className="w-4 h-4" />
                          Move Down
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className="h-px bg-border my-1" />
                        <DropdownMenu.Item
                          className="px-3 py-2 text-sm rounded outline-none hover:bg-destructive hover:text-destructive-foreground cursor-pointer flex items-center gap-2"
                          onClick={() => deleteElement(el.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              );
            })}

            {/* Selected element controls */}
            {selectedId && (
              <div className="mt-4 p-3 bg-background rounded-lg space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Blend Mode</label>
                  <select className="w-full px-3 py-2 bg-input rounded text-sm">
                    <option>Normal</option>
                    <option>Multiply</option>
                    <option>Screen</option>
                    <option>Overlay</option>
                    <option>Darken</option>
                    <option>Lighten</option>
                    <option>Color Dodge</option>
                    <option>Color Burn</option>
                    <option>Hard Light</option>
                    <option>Soft Light</option>
                    <option>Difference</option>
                    <option>Exclusion</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-muted-foreground">Opacity</label>
                    <span className="text-xs text-foreground">
                      {elements.find((el) => el.id === selectedId)?.data?.opacity ?? 100}%
                    </span>
                  </div>
                  <Slider.Root
                    className="relative flex items-center w-full h-5"
                    value={[elements.find((el) => el.id === selectedId)?.data?.opacity ?? 100]}
                    onValueChange={([value]) => updateOpacity(selectedId, value)}
                    max={100}
                    step={1}
                  >
                    <Slider.Track className="relative bg-secondary rounded-full h-1 flex-1">
                      <Slider.Range className="absolute bg-primary rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary" />
                  </Slider.Root>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-1">
            {historyItems.map((item, index) => (
              <div
                key={index}
                className="px-3 py-2 text-sm rounded bg-secondary hover:bg-secondary/80 cursor-pointer"
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}