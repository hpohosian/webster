import { useEffect, useState } from "react";
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
import type { Adjustments, ShapeKind } from "../store/editorStore";
import { getPalette, listFonts, searchImages } from "../lib/demoApi";
import type { DemoColor, DemoFont, DemoImage } from "../lib/demoApi";

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
            }}
            style={{ width: "100%", accentColor: "#454fda" }}
          />
        </div>
      ))}
      <button
        onClick={resetAdjustments}
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
  const brushColor    = useEditorStore((s) => s.brushColor);
  const brushSize     = useEditorStore((s) => s.brushSize);
  const brushOpacity  = useEditorStore((s) => s.brushOpacity);
  const setBrushColor   = useEditorStore((s) => s.setBrushColor);
  const setBrushSize    = useEditorStore((s) => s.setBrushSize);
  const setBrushOpacity = useEditorStore((s) => s.setBrushOpacity);

  const [palette, setPalette] = useState<DemoColor[]>([]);
  const [isLoadingPalette, setIsLoadingPalette] = useState(false);

  useEffect(() => {
    let isActive = true;
    setIsLoadingPalette(true);

    getPalette(brushColor)
      .then((colors) => {
        if (isActive) setPalette(colors);
      })
      .catch(() => {
        if (isActive) setPalette([]);
      })
      .finally(() => {
        if (isActive) setIsLoadingPalette(false);
      });

    return () => {
      isActive = false;
    };
  }, [brushColor]);

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

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "#888" }}>Palette</span>
          <span style={{ fontSize: 11, color: "#555" }}>{isLoadingPalette ? "Loading" : "The Color API"}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
          {palette.map((item) => (
            <button
              key={item.hex + item.name}
              title={item.name || item.hex}
              onClick={() => setBrushColor(item.hex)}
              style={{
                height: 28,
                borderRadius: 6,
                border: item.hex.toLowerCase() === brushColor.toLowerCase() ? "2px solid #fff" : "1px solid #2a2a3a",
                background: item.hex,
                cursor: "pointer",
              }}
            />
          ))}
        </div>
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
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {["Grayscale", "Blur", "Sharpen", "Sepia", "Vintage", "HDR", "Vignette", "Matte"].map((f) => (
        <button key={f} onClick={() => undefined} style={panelBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#454fda20")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a2a")}
        >{f}</button>
      ))}
    </div>
  );
}

// ─── Text ─────────────────────────────────────────────────────────────────────
function TextContent() {
  const runCanvasCommand = useEditorStore((s) => s.runCanvasCommand);
  const brushColor = useEditorStore((s) => s.brushColor);
  const [fonts, setFonts] = useState<DemoFont[]>([]);
  const [isLoadingFonts, setIsLoadingFonts] = useState(false);
  const [textValue, setTextValue] = useState("Your headline");
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState(brushColor);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  useEffect(() => {
    let isActive = true;
    setIsLoadingFonts(true);

    listFonts()
      .then((loadedFonts) => {
        if (!isActive) return;
        setFonts(loadedFonts);
        if (loadedFonts[0]?.family) setSelectedFont(loadedFonts[0].family);
      })
      .catch(() => {
        if (isActive) setFonts([]);
      })
      .finally(() => {
        if (isActive) setIsLoadingFonts(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const fontOptions = fonts.length > 0
    ? fonts
    : ["Arial", "Georgia", "Courier New", "Impact", "Trebuchet MS"].map((family) => ({ family }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Text</label>
        <input value={textValue} onChange={(e) => setTextValue(e.target.value)} style={inputStyle} />
      </div>
      <div>
        <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>
          Font {isLoadingFonts && <span style={{ color: "#555" }}>· loading Google Fonts</span>}
        </label>
        <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)} style={selectStyle}>
          {fontOptions.map((font) => (
            <option key={font.family} value={font.family}>{font.family}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Color</label>
        <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ width: "100%", height: 34, borderRadius: 6, cursor: "pointer", border: "1px solid #2a2a3a" }} />
      </div>
      <div>
        <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Size (px)</label>
        <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value) || 16)} style={inputStyle} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => setIsBold((v) => !v)} style={{ ...panelBtnStyle, flex: 1, fontWeight: "bold", background: isBold ? "#454fda" : "#1a1a2a" }}>B</button>
        <button onClick={() => setIsItalic((v) => !v)} style={{ ...panelBtnStyle, flex: 1, fontStyle: "italic", background: isItalic ? "#454fda" : "#1a1a2a" }}>I</button>
        <button onClick={() => setIsUnderline((v) => !v)} style={{ ...panelBtnStyle, flex: 1, textDecoration: "underline", background: isUnderline ? "#454fda" : "#1a1a2a" }}>U</button>
      </div>
      <button
        onClick={() => runCanvasCommand({
          type: "add-text",
          text: textValue,
          fontFamily: selectedFont,
          fontSize,
          fill: textColor,
          fontWeight: isBold ? "bold" : "normal",
          fontStyle: isItalic ? "italic" : "normal",
          underline: isUnderline,
        })}
        style={{ ...panelBtnStyle, background: "#454fda", color: "#fff", justifyContent: "center" }}
      >
        Add Text
      </button>
    </div>
  );
}

// ─── Shapes ───────────────────────────────────────────────────────────────────
function ShapesContent() {
  const runCanvasCommand = useEditorStore((s) => s.runCanvasCommand);
  const shapes: { label: string; shape: ShapeKind }[] = [
    { label: "Rectangle", shape: "rectangle" },
    { label: "Rounded Rect", shape: "rounded-rect" },
    { label: "Circle", shape: "circle" },
    { label: "Line", shape: "line" },
    { label: "Arrow", shape: "arrow" },
    { label: "Triangle", shape: "triangle" },
    { label: "Star", shape: "star" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {shapes.map((item) => (
        <button key={item.shape} onClick={() => runCanvasCommand({ type: "add-shape", shape: item.shape })} style={panelBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#454fda20")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a2a")}
        >{item.label}</button>
      ))}
    </div>
  );
}

// ─── Resize ───────────────────────────────────────────────────────────────────
function ResizeContent() {
  const setCanvasSize = useEditorStore((s) => s.setCanvasSize);
  const runCanvasCommand = useEditorStore((s) => s.runCanvasCommand);
  const canvasSize = useEditorStore((s) => s.canvasSize);
  const [width, setWidth] = useState(canvasSize.w);
  const [height, setHeight] = useState(canvasSize.h);

  const applyPreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
    setCanvasSize({ w, h });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value) || 1)} placeholder="W" style={{ ...inputStyle, flex: 1 }} />
        <span style={{ color: "#555" }}>×</span>
        <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 1)} placeholder="H" style={{ ...inputStyle, flex: 1 }} />
      </div>
      <button onClick={() => setCanvasSize({ w: width, h: height })} style={{ ...panelBtnStyle, background: "#454fda", color: "#fff", justifyContent: "center" }}>
        Apply Size
      </button>
      {([
        ["Instagram Post", 1080, 1080],
        ["Story", 1080, 1920],
        ["YouTube", 1280, 720],
        ["Twitter", 1200, 675],
        ["Banner", 970, 250],
      ] as [string, number, number][]).map(([name, w, h]) => (
        <button key={name} onClick={() => applyPreset(w, h)} style={panelBtnStyle}>
          <span>{name}</span>
          <span style={{ color: "#555", fontSize: 11 }}>{w}×{h}</span>
        </button>
      ))}
      <button onClick={() => runCanvasCommand({ type: "create-empty-canvas" })} style={panelBtnStyle}>
        Clear Canvas
      </button>
    </div>
  );
}

// ─── Upload ───────────────────────────────────────────────────────────────────
function UploadContent() {
  const runCanvasCommand = useEditorStore((s) => s.runCanvasCommand);
  const [query, setQuery] = useState("social media");
  const [images, setImages] = useState<DemoImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [error, setError] = useState("");

  const loadImages = async () => {
    setIsLoadingImages(true);
    setError("");

    try {
      const results = await searchImages(query);
      setImages(results);
    } catch {
      setError("Image search is unavailable");
    } finally {
      setIsLoadingImages(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button
        onClick={loadImages}
        style={{
          border: "2px dashed #2a2a3a", borderRadius: 8, padding: "24px 12px",
          textAlign: "center", cursor: "pointer", color: "#555", fontSize: 12,
          background: "transparent",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#454fda")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#2a2a3a")}
      >
        {isLoadingImages ? "Searching Unsplash..." : <>Drop image here<br />or click to browse</>}
      </button>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") loadImages();
        }}
        placeholder="Search Unsplash"
        style={inputStyle}
      />

      {error && <div style={{ color: "#f87171", fontSize: 12 }}>{error}</div>}

      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {images.slice(0, 6).map((image) => (
            <button
              key={image.id}
              title={image.alt}
              onClick={() => runCanvasCommand({ type: "add-image", url: image.regular, alt: image.alt })}
              style={{
                overflow: "hidden",
                borderRadius: 8,
                border: "1px solid #2a2a3a",
                background: "#1a1a2a",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <img src={image.thumb} alt={image.alt} style={{ width: "100%", height: 68, objectFit: "cover", display: "block" }} />
              <span style={{ display: "block", padding: "5px 6px", color: "#777", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {image.author || "Unsplash"}
              </span>
            </button>
          ))}
        </div>
      )}

      <button onClick={() => runCanvasCommand({ type: "create-empty-canvas" })} style={panelBtnStyle}>
        Create Empty Canvas
      </button>
    </div>
  );
}

// ─── Templates ────────────────────────────────────────────────────────────────
function TemplatesContent() {
  const setCanvasSize = useEditorStore((s) => s.setCanvasSize);
  const runCanvasCommand = useEditorStore((s) => s.runCanvasCommand);
  const templates: { name: string; size: { w: number; h: number } }[] = [
    { name: "Instagram Post", size: { w: 1080, h: 1080 } },
    { name: "Instagram Story", size: { w: 1080, h: 1920 } },
    { name: "Facebook Cover", size: { w: 820, h: 312 } },
    { name: "YouTube Thumbnail", size: { w: 1280, h: 720 } },
    { name: "Business Card", size: { w: 1050, h: 600 } },
    { name: "Flyer", size: { w: 816, h: 1056 } },
    { name: "Poster", size: { w: 1080, h: 1350 } },
    { name: "Mood Board", size: { w: 1400, h: 1000 } },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {templates.map((template) => (
        <button
          key={template.name}
          onClick={() => {
            setCanvasSize(template.size);
            runCanvasCommand({ type: "create-empty-canvas" });
          }}
          style={panelBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#454fda20")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a2a")}
        >
          <span>{template.name}</span>
          <span style={{ color: "#555", fontSize: 11 }}>{template.size.w}×{template.size.h}</span>
        </button>
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