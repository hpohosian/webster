import { useEffect, useState } from "react";
import {
  Layers, History,
  ChevronRight, ChevronLeft,
  Eye, EyeOff,
  Lock, Unlock,
  Trash2, Copy,
  MoveUp, MoveDown,
} from "lucide-react";
import { useParams } from "react-router";
import { useEditorStore, useSelectedLayer } from "../store/editorStore";

export function RightPanel() {
  const layers = useEditorStore((s) => s.layers);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const history = useEditorStore((s) => s.history);
  const historyIndex = useEditorStore((s) => s.historyIndex);

  const setSelectedLayerId = useEditorStore((s) => s.setSelectedLayerId);
  const addLayer = useEditorStore((s) => s.addLayer);
  const deleteLayer = useEditorStore((s) => s.deleteLayer);
  const duplicateLayer = useEditorStore((s) => s.duplicateLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const moveLayer = useEditorStore((s) => s.moveLayer);
  const setLayers = useEditorStore((s) => s.setLayers);
  const runCanvasCommand = useEditorStore((s) => s.runCanvasCommand);

  const selectedLayer = useSelectedLayer();
  const { projectId } = useParams();

  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState<"layers" | "history">("layers");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!projectId) return;

    fetch("http://localhost:3000/projects/" + projectId + "/layers")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!Array.isArray(data)) return;
        setLayers(data);
        if (data.length > 0) setSelectedLayerId(data[0].id);
      })
      .catch(console.error);
  }, [projectId, setLayers, setSelectedLayerId]);

  // colapsed view
  if (collapsed) {
    return (
      <div style={{ width: 44, background: "var(--sidebar)", borderLeft: "1px solid var(--sidebar-border)", display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", gap: 4, flexShrink: 0 }}>
        <button onClick={() => setCollapsed(false)} style={iconBtnStyle} title="Expand">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => { setCollapsed(false); setTab("layers"); }} style={iconBtnStyle} title="Layers">
          <Layers size={16} />
        </button>
        <button onClick={() => { setCollapsed(false); setTab("history"); }} style={iconBtnStyle} title="History">
          <History size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: 240, background: "var(--sidebar)", borderLeft: "1px solid var(--sidebar-border)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ height: 44, borderBottom: "1px solid var(--sidebar-border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {([["layers", Layers], ["history", History]] as const).map(([id, Icon]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              background: tab === id ? "var(--accent)" : "transparent",
              border: "none",
              color: tab === id ? "var(--sidebar-layer)" : "var(--sidebar-foreground)",
              borderRadius: 6,
              padding: "5px 8px",
              cursor: "pointer",
              display: "flex",
            }}>
              <Icon size={15} />
            </button>
          ))}
        </div>
        <button onClick={() => setCollapsed(true)} style={iconBtnStyle}>
          <ChevronRight size={15} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {tab === "layers" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[...layers].reverse().map((layer) => {
                const isSelected = layer.id === selectedLayerId;
                return (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 8px",
                      borderRadius: 6,
                      cursor: "pointer",
                      background: isSelected ? "var(--sidebar-layer)" : "var(--sidebar-accent)",
                      border: "1px solid " + (isSelected ? "var(--sidebar-ring-mid)" : "transparent"),
                    }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sidebar-foreground)", padding: 2, display: "flex" }}
                    >
                      {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    {/* square */}
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      background: "linear-gradient(135deg, var(--sidebar-ring), var(--sidebar-ring-mid))",
                      // border: "1px solid var(--sidebar-border)",
                      flexShrink: 0,
                      opacity: layer.opacity / 100,
                    }} />

                    {/* name */}
                    {editingId === layer.id ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => {
                          if (editName.trim()) updateLayer(layer.id, { name: editName.trim() });
                          setEditingId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (editName.trim()) updateLayer(layer.id, { name: editName.trim() });
                            setEditingId(null);
                          }
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ flex: 1, background: "var(--sidebar)", border: "1px solid var(--accent)", color: "#fff", borderRadius: 4, padding: "1px 4px", fontSize: 12 }}
                      />
                    ) : (
                      <span
                        onDoubleClick={(e) => { e.stopPropagation(); setEditingId(layer.id); setEditName(layer.name); }}
                        style={{ flex: 1, fontSize: 12, color: isSelected ? "var(--sidebar-foreground)" : "var(--sidebar-accent)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {layer.name}
                      </span>
                    )}

                    {/* action buttons */}
                    <button
                      onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { locked: !layer.locked }); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: layer.locked ? "var(--accent)" : "var(--sidebar-accent)", padding: 2, display: "flex" }}
                    >
                      {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>

                    <div style={{ display: "flex", gap: 1 }}>
                      {([
                        [<Copy size={12} />, () => duplicateLayer(layer.id), "Duplicate", false],
                        [<MoveUp size={12} />, () => moveLayer(layer.id, "up"), "Up", false],
                        [<MoveDown size={12} />, () => moveLayer(layer.id, "down"), "Down", false],
                        [<Trash2 size={12} />, () => deleteLayer(layer.id), "Delete", true],
                      ] as [React.ReactNode, () => void, string, boolean][]).map(([icon, fn, title, isDanger], i) => (
                        <button
                          key={i}
                          title={title}
                          onClick={(e) => { e.stopPropagation(); fn(); }}
                          style={{ background: "none", border: "none", color: isDanger ? "#f87171" : "#848484", cursor: "pointer", padding: 2, display: "flex", borderRadius: 3 }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = isDanger ? "#fca5a5" : "#c3c3c3")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = isDanger ? "#f87171" : "#848484")}
                        >{icon}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* add layer */}
            <button
              onClick={addLayer}
              style={{ marginTop: 8, width: "100%", background: "var(--accent)", border: "none", color: "#fff", borderRadius: 6, padding: "7px", cursor: "pointer", fontSize: 12 }}
            >Add Layer</button>

            {/* blend modes */}
            {selectedLayer && (
              <div style={{ marginTop: 10, background: "var(--sidebar)", borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 4 }}>Blend Mode</label>
                  <select
                    value={selectedLayer.blendMode}
                    onChange={(e) => updateLayer(selectedLayer.id, { blendMode: e.target.value })}
                    style={{ width: "100%", background: "var(--sidebar)", border: "1px solid #2a2a2a", color: "#ccc", borderRadius: 5, padding: "5px 8px", fontSize: 12 }}
                  >
                    {["Normal", "Multiply", "Screen", "Overlay", "Darken", "Lighten", "Color Dodge", "Color Burn", "Soft Light", "Difference"].map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <label style={{ fontSize: 11, color: "#555" }}>Opacity</label>
                    <span style={{ fontSize: 11, color: "#777" }}>{selectedLayer.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={selectedLayer.opacity}
                    onChange={(e) => updateLayer(selectedLayer.id, { opacity: Number(e.target.value) })}
                    style={{ width: "100%", accentColor: "var(--accent)" }}
                  />
                </div>
              </div>
            )}
          </>
        )}

      {/* history tab  */}
        {tab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[...history].reverse().map((item, i) => {
              const originalIndex = history.length - 1 - i;
              const isCurrent = originalIndex === historyIndex;
              return (
                <button key={originalIndex} onClick={() => runCanvasCommand({ type: "restore-history", index: originalIndex })} style={{
                  padding: "7px 10px",
                  borderRadius: 5,
                  fontSize: 12,
                  cursor: "pointer",
                  background: isCurrent ? "var(--sidebar-accent)" : "var(--sidebar)",
                  color: isCurrent ? "#aaa" : "#666",
                  border: "none",
                  borderLeft: "2px solid " + (isCurrent ? "var(--accent)" : "transparent"),
                  textAlign: "left",
                }}>
                  {item}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--sidebar-accent)",
  color: "#666",
  borderRadius: 5,
  padding: 5,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};
