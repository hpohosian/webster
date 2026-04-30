/**
 * FeaturesPanel.tsx
 * ─────────────────
 * VORHER: Bekam adjustments, setBrushColor, brushSize... als Props
 * JETZT:  Kein einziges Prop mehr nötig – alles kommt aus dem Store
 *
 * Das ist der Hauptvorteil von Zustand:
 * EditorPage muss keine Props mehr durchreichen.
 * FeaturesPanel "greift" sich selbst was es braucht.
 */

import { Sun, Contrast, Palette, Lightbulb, CloudRain } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import type { Adjustments } from "../store/editorStore";

// Keine Props mehr! (außer onClose falls du das brauchst)
export function FeaturesPanel() {
  // activePanel bestimmt welcher Inhalt angezeigt wird
  const activePanel      = useEditorStore((s) => s.activePanel);
  const setActivePanel   = useEditorStore((s) => s.setActivePanel);

  if (!activePanel) return null;

  const titles: Record<string, string> = {
    upload: "Upload", resize: "Resize Canvas", adjustments: "Adjustments",
    filter: "Filters", text: "Text", draw: "Draw & Fill",
    shapes: "Shapes", templates: "Templates",
  };

  return (
    <div style={{
      width: 220, background: "#0f0f18", borderRight: "1px solid #1e1e2a",
      display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid #1e1e2a",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#ddd" }}>
          {titles[activePanel]}
        </span>
        <button
          onClick={() => setActivePanel(null)}
          style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16 }}
        >×</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {activePanel === "adjustments" && <AdjustmentsContent />}
        {activePanel === "filter"      && <FilterContent />}
        {activePanel === "draw"        && <DrawContent />}
        {activePanel === "text"        && <TextContent />}
        {activePanel === "shapes"      && <ShapesContent />}
        {activePanel === "resize"      && <ResizeContent />}
        {activePanel === "upload"      && <UploadContent />}
        {activePanel === "templates"   && <TemplatesContent />}
      </div>
    </div>
  );
}

// ─── Adjustments ─────────────────────────────────────────────────────────────
/**
 * Diese Sub-Komponente holt sich NUR adjustments + setAdjustment aus dem Store.
 * Wenn du den Highlights-Slider bewegst:
 *   1. setAdjustment("highlights", 42) wird aufgerufen
 *   2. Store updated adjustments.highlights auf 42
 *   3. Diese Komponente re-rendert (weil sie adjustments abonniert hat)
 *   4. Canvas kann adjustments auch abonnieren und reagieren
 */
function AdjustmentsContent() {
  const adjustments    = useEditorStore((s) => s.adjustments);
  const setAdjustment  = useEditorStore((s) => s.setAdjustment);
  const resetAdjustments = useEditorStore((s) => s.resetAdjustments);
  const pushHistory    = useEditorStore((s) => s.pushHistory);

  const fields: { key: keyof Adjustments; Icon: any; label: string }[] = [
    { key: "highlights",   Icon: Sun,       label: "Highlights" },
    { key: "contrast",     Icon: Contrast,  label: "Contrast" },
    { key: "colorBalance", Icon: Palette,   label: "Color Balance" },
    { key: "light",        Icon: Lightbulb, label: "Light" },
    { key: "shadow",       Icon: CloudRain, label: "Shadow" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {fields.map(({ key, Icon, label }) => (
        <div key={key}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Icon size={13} color="#666" />
            <span style={{ fontSize: 12, color: "#aaa" }}>{label}</span>
            <span style={{ fontSize: 11, color: "#555", marginLeft: "auto" }}>
              {adjustments[key]}
            </span>
          </div>
          <input
            type="range" min={-100} max={100}
            value={adjustments[key]}
            onChange={(e) => {
              setAdjustment(key, Number(e.target.value));
              pushHistory(`Adjust ${label}`);
            }}
            style={{ width: "100%", accentColor: "#454fda" }}
          />
        </div>
      ))}
      <button
        onClick={() => { resetAdjustments(); pushHistory("Reset Adjustments"); }}
        style={{
          background: "#1a1a2a", border: "1px solid #2a2a3a", color: "#888",
          borderRadius: 6, padding: "6px", fontSize: 12, cursor: "pointer",
        }}
      >Reset All</button>
    </div>
  );
}

// ─── Draw ─────────────────────────────────────────────────────────────────────
/**
 * Brush-Einstellungen kommen aus dem Store.
 * Wenn du hier die Farbe änderst → brushColor im Store ändert sich →
 * Canvas liest brushColor beim nächsten Strich aus dem Store → richtige Farbe!
 */
function DrawContent() {
  // Jedes Feld einzeln abonnieren = minimale Re-renders
  const brushColor    = useEditorStore((s) => s.brushColor);
  const brushSize     = useEditorStore((s) => s.brushSize);
  const brushOpacity  = useEditorStore((s) => s.brushOpacity);
  const setBrushColor   = useEditorStore((s) => s.setBrushColor);
  const setBrushSize    = useEditorStore((s) => s.setBrushSize);
  const setBrushOpacity = useEditorStore((s) => s.setBrushOpacity);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Color</label>
        <input
          type="color" value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
          style={{ width: "100%", height: 36, borderRadius: 6, cursor: "pointer", border: "1px solid #2a2a3a" }}
        />
      </div>
      <SliderField
        label="Brush Size" value={brushSize} min={1} max={100}
        onChange={setBrushSize}
      />
      <SliderField
        label="Opacity" value={brushOpacity} min={1} max={100}
        onChange={setBrushOpacity} unit="%"
      />
    </div>
  );
}

// ─── Filter ───────────────────────────────────────────────────────────────────
function FilterContent() {
  const pushHistory = useEditorStore((s) => s.pushHistory);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {["Grayscale", "Blur", "Sharpen", "Sepia", "Vintage", "HDR", "Vignette", "Matte"].map((f) => (
        <button key={f} onClick={() => pushHistory(`Apply ${f}`)} style={panelBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#454fda20")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a2a")}
        >{f}</button>
      ))}
    </div>
  );
}

// ─── Text ─────────────────────────────────────────────────────────────────────
function TextContent() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Font</label>
        <select style={selectStyle}>
          {["Arial", "Georgia", "Courier New", "Impact", "Trebuchet MS"].map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Size (px)</label>
        <input type="number" defaultValue={16} style={inputStyle} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[["B", "bold", "normal"], ["I", "normal", "italic"], ["U", "normal", "normal"]].map(([s, fw, fs]) => (
          <button key={s} style={{ ...panelBtnStyle, flex: 1, fontWeight: fw as any, fontStyle: fs as any,
            textDecoration: s === "U" ? "underline" : "none" }}>{s}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Shapes ───────────────────────────────────────────────────────────────────
function ShapesContent() {
  const pushHistory = useEditorStore((s) => s.pushHistory);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {["Rectangle", "Rounded Rect", "Circle", "Line", "Arrow", "Triangle", "Star"].map((s) => (
        <button key={s} onClick={() => pushHistory(`Add ${s}`)} style={panelBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#454fda20")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a2a")}
        >{s}</button>
      ))}
    </div>
  );
}

// ─── Resize ───────────────────────────────────────────────────────────────────
function ResizeContent() {
  const pushHistory    = useEditorStore((s) => s.pushHistory);
  const setCanvasSize  = useEditorStore((s) => s.setCanvasSize);

  const applyPreset = (w: number, h: number, name: string) => {
    setCanvasSize({ w, h });
    pushHistory(`Resize: ${name}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input type="number" defaultValue={800} placeholder="W" style={{ ...inputStyle, flex: 1 }} />
        <span style={{ color: "#555" }}>×</span>
        <input type="number" defaultValue={600} placeholder="H" style={{ ...inputStyle, flex: 1 }} />
      </div>
      {([
        ["Instagram Post", 1080, 1080],
        ["Story",          1080, 1920],
        ["YouTube",        1280, 720],
        ["Twitter",        1200, 675],
        ["Banner",         970,  250],
      ] as [string, number, number][]).map(([name, w, h]) => (
        <button key={name} onClick={() => applyPreset(w, h, name)} style={panelBtnStyle}>
          <span>{name}</span>
          <span style={{ color: "#555", fontSize: 11 }}>{w}×{h}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Upload ───────────────────────────────────────────────────────────────────
function UploadContent() {
  const pushHistory = useEditorStore((s) => s.pushHistory);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{
        border: "2px dashed #2a2a3a", borderRadius: 8, padding: "24px 12px",
        textAlign: "center", cursor: "pointer", color: "#555", fontSize: 12,
      }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#454fda")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#2a2a3a")}
      >Drop image here<br />or click to browse</div>
      <button onClick={() => pushHistory("Create Empty Canvas")} style={panelBtnStyle}>
        Create Empty Canvas
      </button>
    </div>
  );
}

// ─── Templates ────────────────────────────────────────────────────────────────
function TemplatesContent() {
  const pushHistory = useEditorStore((s) => s.pushHistory);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {["Instagram Post", "Instagram Story", "Facebook Cover", "YouTube Thumbnail",
        "Business Card", "Flyer", "Poster", "Mood Board"].map((t) => (
        <button key={t} onClick={() => pushHistory(`Template: ${t}`)} style={panelBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#454fda20")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a2a")}
        >{t}</button>
      ))}
    </div>
  );
}

// ─── Shared UI Helpers ────────────────────────────────────────────────────────

function SliderField({ label, value, min, max, onChange, unit = "" }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <label style={{ fontSize: 12, color: "#888" }}>{label}</label>
        <span style={{ fontSize: 11, color: "#555" }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#454fda" }} />
    </div>
  );
}

const panelBtnStyle: React.CSSProperties = {
  background: "#1a1a2a", border: "1px solid #2a2a3a", color: "#ccc",
  borderRadius: 6, padding: "8px 12px", textAlign: "left", cursor: "pointer",
  fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center",
  width: "100%",
};

const selectStyle: React.CSSProperties = {
  width: "100%", background: "#1a1a2a", border: "1px solid #2a2a3a",
  color: "#ccc", borderRadius: 6, padding: "6px 8px", fontSize: 12,
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#1a1a2a", border: "1px solid #2a2a3a",
  color: "#ccc", borderRadius: 6, padding: "6px 8px", fontSize: 12,
};