import { useState } from "react";
import {
  Layers, History, ChevronRight, ChevronLeft,
  Eye, EyeOff, Lock, Unlock,
  Trash2, Copy, MoveUp, MoveDown,
} from "lucide-react";
import { useEditorStore, useSelectedLayer } from "../store/editorStore";

export function RightPanel() {
  // Nur was diese Komponente wirklich braucht abonnieren
  const layers            = useEditorStore((s) => s.layers);
  const selectedLayerId   = useEditorStore((s) => s.selectedLayerId);
  const history           = useEditorStore((s) => s.history);

  // Actions
  const setSelectedLayerId = useEditorStore((s) => s.setSelectedLayerId);
  const addLayer           = useEditorStore((s) => s.addLayer);
  const deleteLayer        = useEditorStore((s) => s.deleteLayer);
  const duplicateLayer     = useEditorStore((s) => s.duplicateLayer);
  const updateLayer        = useEditorStore((s) => s.updateLayer);
  const moveLayer          = useEditorStore((s) => s.moveLayer);

  // Custom Selektor – gibt den aktuell selektierten Layer zurück
  const selectedLayer = useSelectedLayer();

  // ── Lokaler State (UI-only, muss nicht global sein) ──────────────────────
  const [collapsed,  setCollapsed]  = useState(false);
  const [tab,        setTab]        = useState<"layers" | "history">("layers");
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [editName,   setEditName]   = useState("");

  if (collapsed) {
    return (
      <div style={{ width: 44, background: "#0d0d12", borderLeft: "1px solid #1e1e2a", display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", gap: 4, flexShrink: 0 }}>
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
    <div style={{ width: 240, background: "#0f0f18", borderLeft: "1px solid #1e1e2a", display: "flex", flexDirection: "column", flexShrink: 0 }}>

      {/* Tab-Header */}
      <div style={{ height: 44, borderBottom: "1px solid #1e1e2a", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {([["layers", Layers], ["history", History]] as const).map(([id, Icon]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              background: tab === id ? "var(--accent)" : "transparent",
              border: "none", color: tab === id ? "#fff" : "#666",
              borderRadius: 6, padding: "5px 8px", cursor: "pointer", display: "flex",
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

        {/* ── Layers Tab ── */}
        {tab === "layers" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Layers umgekehrt anzeigen – oberster Layer = oben in der Liste */}
              {[...layers].reverse().map((layer) => {
                const isSelected = layer.id === selectedLayerId;
                return (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 8px", borderRadius: 6, cursor: "pointer",
                      background: isSelected ? "#454fda20" : "#1a1a26",
                      border: `1px solid ${isSelected ? "#454fda60" : "transparent"}`,
                    }}
                  >
                    {/* Visibility Toggle → updateLayer schreibt in den Store */}
                    <button
                      onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#666", padding: 2, display: "flex" }}
                    >
                      {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>

                    {/* Layer Vorschau */}
                    <div style={{
                      width: 22, height: 22, borderRadius: 4,
                      background: "linear-gradient(135deg, #454fda40, #454fda10)",
                      border: "1px solid #2a2a3a", flexShrink: 0,
                      opacity: layer.opacity / 100,
                    }} />

                    {/* Name – Doppelklick zum Umbenennen */}
                    {editingId === layer.id ? (
                      <input
                        autoFocus value={editName}
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
                        style={{ flex: 1, background: "#0d0d12", border: "1px solid var(--accent)", color: "#fff", borderRadius: 4, padding: "1px 4px", fontSize: 12 }}
                      />
                    ) : (
                      <span
                        onDoubleClick={(e) => { e.stopPropagation(); setEditingId(layer.id); setEditName(layer.name); }}
                        style={{ flex: 1, fontSize: 12, color: isSelected ? "#ccc" : "#777", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {layer.name}
                      </span>
                    )}

                    {/* Lock Toggle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { locked: !layer.locked }); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: layer.locked ? "var(--accent)" : "#444", padding: 2, display: "flex" }}
                    >
                      {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>

                    {/* Quick Actions */}
                    <div style={{ display: "flex", gap: 1 }}>
                      {([
                        [<Copy size={11} />,     () => duplicateLayer(layer.id), "Duplicate", false],
                        [<MoveUp size={11} />,   () => moveLayer(layer.id, "up"), "Up",       false],
                        [<MoveDown size={11} />, () => moveLayer(layer.id, "down"), "Down",   false],
                        [<Trash2 size={11} />,   () => deleteLayer(layer.id), "Delete",       true],
                      ] as [React.ReactNode, () => void, string, boolean][]).map(([icon, fn, title, isDanger], i) => (
                        <button
                          key={i} title={title}
                          onClick={(e) => { e.stopPropagation(); fn(); }}
                          style={{ background: "none", border: "none", color: isDanger ? "#f87171" : "#555", cursor: "pointer", padding: 2, display: "flex", borderRadius: 3 }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = isDanger ? "#fca5a5" : "#bbb")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = isDanger ? "#f87171" : "#555")}
                        >{icon}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Layer → ruft addLayer() aus dem Store auf */}
            <button
              onClick={addLayer}
              style={{ marginTop: 8, width: "100%", background: "var(--accent)", border: "none", color: "#fff", borderRadius: 6, padding: "7px", cursor: "pointer", fontSize: 12 }}
            >+ Add Layer</button>

            {/* Layer Properties – zeigt Werte des selektierten Layers */}
            {selectedLayer && (
              <div style={{ marginTop: 10, background: "#0d0d12", borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 4 }}>Blend Mode</label>
                  <select
                    value={selectedLayer.blendMode}
                    onChange={(e) => updateLayer(selectedLayer.id, { blendMode: e.target.value })}
                    style={{ width: "100%", background: "#1a1a2a", border: "1px solid #2a2a3a", color: "#ccc", borderRadius: 5, padding: "5px 8px", fontSize: 12 }}
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
                  {/* updateLayer({ opacity: ... }) schreibt direkt in den Store */}
                  <input
                    type="range" min={0} max={100}
                    value={selectedLayer.opacity}
                    onChange={(e) => updateLayer(selectedLayer.id, { opacity: Number(e.target.value) })}
                    style={{ width: "100%", accentColor: "var(--accent)" }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ── History Tab ── */}
        {tab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Neueste Aktion oben */}
            {[...history].reverse().map((item, i) => (
              <div key={i} style={{
                padding: "7px 10px", borderRadius: 5, fontSize: 12, cursor: "pointer",
                background: i === 0 ? "#454fda20" : "#1a1a26",
                color:      i === 0 ? "#aaa"      : "#666",
                borderLeft: `2px solid ${i === 0 ? "var(--accent)" : "transparent"}`,
              }}>
                {item}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  background: "transparent", border: "1px solid #2a2a3a", color: "#666",
  borderRadius: 5, padding: 5, cursor: "pointer", display: "flex", alignItems: "center",
};