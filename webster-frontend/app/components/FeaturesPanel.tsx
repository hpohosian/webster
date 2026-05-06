import { useEffect, useState } from "react";
import { Sun, Contrast, Palette, Lightbulb, CloudRain } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import type { Adjustments } from "../store/editorStore";
import { getPalette, listFonts, searchImages } from "../lib/demoApi";
import type { DemoColor, DemoFont, DemoImage } from "../lib/demoApi";
import { useParams } from "react-router-dom";

export function FeaturesPanel() {
  const activePanel    = useEditorStore((s) => s.activePanel);
  const setActivePanel = useEditorStore((s) => s.setActivePanel);

  if (!activePanel) return null;

  const titles: Record<string, string> = {
    upload: "Upload", resize: "Resize Canvas", adjustments: "Adjustments",
    filter: "Filters", text: "Text", draw: "Draw & Fill",
    shapes: "Shapes", templates: "Templates",
  };

  return (
    <div style={{
      width: 220,
      background: "var(--sidebar)",
      borderRight: "1px solid var(--sidebar-border)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--sidebar-border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontSize: 13, fontWeight: "var(--font-weight-medium)" as any, color: "var(--sidebar-foreground)" }}>
          {titles[activePanel]}
        </span>
        <button
          onClick={() => setActivePanel(null)}
          style={{
            background: "none",
            border: "none",
            color: "var(--muted-foreground)",
            cursor: "pointer",
            fontSize: 16,
          }}
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

function AdjustmentsContent() {
  const adjustments      = useEditorStore((s) => s.adjustments);
  const setAdjustment    = useEditorStore((s) => s.setAdjustment);
  const resetAdjustments = useEditorStore((s) => s.resetAdjustments);
  const pushHistory      = useEditorStore((s) => s.pushHistory);

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
            <Icon size={13} color="var(--muted-foreground)" />
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{label}</span>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginLeft: "auto", opacity: 0.6 }}>
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
            style={{ width: "100%", accentColor: "var(--accent)" }}
          />
        </div>
      ))}
      <button
        onClick={() => { resetAdjustments(); pushHistory("Reset Adjustments"); }}
        style={{
          background: "var(--secondary)",
          border: "1px solid var(--border)",
          color: "var(--muted-foreground)",
          borderRadius: "var(--radius)",
          padding: "6px",
          fontSize: 12,
          cursor: "pointer",
        }}
      >Reset All</button>
    </div>
  );
}

function DrawContent() {
  const brushColor      = useEditorStore((s) => s.brushColor);
  const brushSize       = useEditorStore((s) => s.brushSize);
  const brushOpacity    = useEditorStore((s) => s.brushOpacity);
  const setBrushColor   = useEditorStore((s) => s.setBrushColor);
  const setBrushSize    = useEditorStore((s) => s.setBrushSize);
  const setBrushOpacity = useEditorStore((s) => s.setBrushOpacity);

  const [palette, setPalette] = useState<DemoColor[]>([]);
  const [isLoadingPalette, setIsLoadingPalette] = useState(false);

  useEffect(() => {
    let isActive = true;
    setIsLoadingPalette(true);

    getPalette(brushColor)
      .then((colors) => { if (isActive) setPalette(colors); })
      .catch(() => { if (isActive) setPalette([]); })
      .finally(() => { if (isActive) setIsLoadingPalette(false); });

    return () => { isActive = false; };
  }, [brushColor]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Color</label>
        <input
          type="color" value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
          style={{
            width: "100%", height: 36,
            borderRadius: "var(--radius)",
            cursor: "pointer",
            border: "1px solid var(--border)",
          }}
        />
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Palette</span>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)", opacity: 0.6 }}>
            {isLoadingPalette ? "Loading" : "The Color API"}
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
          {palette.map((item) => (
            <button
              key={item.hex + item.name}
              title={item.name || item.hex}
              onClick={() => setBrushColor(item.hex)}
              style={{
                height: 28,
                borderRadius: "var(--radius)",
                border: item.hex.toLowerCase() === brushColor.toLowerCase()
                  ? "2px solid var(--primary)"
                  : "1px solid var(--border)",
                background: item.hex,
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>

      <SliderField label="Brush Size" value={brushSize} min={1} max={100} onChange={setBrushSize} />
      <SliderField label="Opacity" value={brushOpacity} min={1} max={100} onChange={setBrushOpacity} unit="%" />
    </div>
  );
}

function FilterContent() {
  const pushHistory = useEditorStore((s) => s.pushHistory);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {["Grayscale", "Blur", "Sharpen", "Sepia", "Vintage", "HDR", "Vignette", "Matte"].map((f) => (
        <button
          key={f}
          onClick={() => pushHistory(`Apply ${f}`)}
          style={panelBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sidebar-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--secondary)")}
        >{f}</button>
      ))}
    </div>
  );
}

function TextContent() {
  const [fonts, setFonts] = useState<DemoFont[]>([]);
  const [isLoadingFonts, setIsLoadingFonts] = useState(false);

  useEffect(() => {
    let isActive = true;
    setIsLoadingFonts(true);

    listFonts()
      .then((loadedFonts) => { if (isActive) setFonts(loadedFonts); })
      .catch(() => { if (isActive) setFonts([]); })
      .finally(() => { if (isActive) setIsLoadingFonts(false); });

    return () => { isActive = false; };
  }, []);

  const fontOptions = fonts.length > 0
    ? fonts
    : ["Arial", "Georgia", "Courier New", "Impact", "Trebuchet MS"].map((family) => ({ family }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>
          Font {isLoadingFonts && <span style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>· loading Google Fonts</span>}
        </label>
        <select style={selectStyle}>
          {fontOptions.map((font) => (
            <option key={font.family} value={font.family}>{font.family}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Size (px)</label>
        <input type="number" defaultValue={16} style={inputStyle} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[["B", "bold", "normal"], ["I", "normal", "italic"], ["U", "normal", "normal"]].map(([s, fw, fs]) => (
          <button
            key={s}
            style={{
              ...panelBtnStyle, flex: 1,
              fontWeight: fw as any,
              fontStyle: fs as any,
              textDecoration: s === "U" ? "underline" : "none",
            }}
          >{s}</button>
        ))}
      </div>
    </div>
  );
}

function ShapesContent() {
  const pushHistory = useEditorStore((s) => s.pushHistory);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {["Rectangle", "Rounded Rect", "Circle", "Line", "Arrow", "Triangle", "Star"].map((s) => (
        <button
          key={s}
          onClick={() => pushHistory(`Add ${s}`)}
          style={panelBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sidebar-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--secondary)")}
        >{s}</button>
      ))}
    </div>
  );
}

function ResizeContent() {
  const canvasSize = useEditorStore((s) => s.canvasSize);
  const setCanvasSize = useEditorStore((s) => s.setCanvasSize);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const { projectId } = useParams<{ projectId: string }>();

  const applyPreset = (w: number, h: number, name: string) => {
    setCanvasSize({ w, h });
    pushHistory(`Resize: ${name}`);
  };

  async function saveProject(projectId: string, projectState: any) {
    const res = await fetch(`http://localhost:3000/projects/${projectId}/save`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        projectState,
        isAutoSave: false,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to save project");
    }

    return res.json();
  }

  const handleApply = async () => {

    await saveProject(projectId, {
      canvas: {
        width: canvasSize.w,
        height: canvasSize.h,
        background: "#ffffff",
      },
      objects: [],
    });

    pushHistory("Resize saved to DB");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {/* <input type="number" defaultValue={800} placeholder="W" style={{ ...inputStyle, flex: 1 }} />
        <span style={{ color: "var(--muted-foreground)" }}>×</span>
        <input type="number" defaultValue={600} placeholder="H" style={{ ...inputStyle, flex: 1 }} /> */}
        
        <input
          type="number"
          placeholder="W"
          value={canvasSize.w}
          onChange={(e) =>
            setCanvasSize({
              w: Number(e.target.value),
              h: canvasSize.h,
            })
          }
          style={{ ...inputStyle, flex: 1 }}
        />
        <span style={{ color: "var(--muted-foreground)" }}>×</span>
        <input
          type="number"
          value={canvasSize.h}
          onChange={(e) =>
            setCanvasSize({
              w: canvasSize.w,
              h: Number(e.target.value),
            })
          }
          style={{ ...inputStyle, flex: 1 }}
        />
      </div>
      {([
        ["Full HD", 1920, 1080],
        ["Instagram Post", 1080, 1080],
        ["Story",          1080, 1920],
        ["YouTube",        1280, 720],
        ["Twitter",        1200, 675],
        ["Banner",         970,  250],
      ] as [string, number, number][]).map(([name, w, h]) => (
        <button key={name} onClick={() => applyPreset(w, h, name)} style={panelBtnStyle}>
          <span>{name}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: 11, opacity: 0.7 }}>{w}×{h}</span>
        </button>
      ))}

      <button
        onClick={handleApply}
        style={pillButtonStyle}
      >
        Apply
      </button>
    </div>
  );
}

function UploadContent() {
  const pushHistory = useEditorStore((s) => s.pushHistory);
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
      pushHistory("Search images: " + query);
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
          border: "2px dashed var(--border)",
          borderRadius: "var(--radius)",
          padding: "24px 12px",
          textAlign: "center",
          cursor: "pointer",
          color: "var(--muted-foreground)",
          fontSize: 12,
          background: "transparent",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--accent)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
      >
        {isLoadingImages ? "Searching Unsplash..." : <>Drop image here<br />or click to browse</>}
      </button>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") loadImages(); }}
        placeholder="Search Unsplash"
        style={inputStyle}
      />

      {error && <div style={{ color: "var(--destructive)", fontSize: 12 }}>{error}</div>}

      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {images.slice(0, 6).map((image) => (
            <button
              key={image.id}
              title={image.alt}
              onClick={() => pushHistory("Add image: " + image.alt)}
              style={{
                overflow: "hidden",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                background: "var(--secondary)",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <img
                src={image.thumb}
                alt={image.alt}
                style={{ width: "100%", height: 68, objectFit: "cover", display: "block" }}
              />
              <span style={{
                display: "block", padding: "5px 6px",
                color: "var(--muted-foreground)",
                fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {image.author || "Unsplash"}
              </span>
            </button>
          ))}
        </div>
      )}

      <button onClick={() => pushHistory("Create Empty Canvas")} style={panelBtnStyle}>
        Create Empty Canvas
      </button>
    </div>
  );
}

function TemplatesContent() {
  const pushHistory = useEditorStore((s) => s.pushHistory);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {["Instagram Post", "Instagram Story", "Facebook Cover", "YouTube Thumbnail",
        "Business Card", "Flyer", "Poster", "Mood Board"].map((t) => (
        <button
          key={t}
          onClick={() => pushHistory(`Template: ${t}`)}
          style={panelBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sidebar-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--secondary)")}
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
        <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{label}</label>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)", opacity: 0.6 }}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--accent)" }}
      />
    </div>
  );
}

const panelBtnStyle: React.CSSProperties = {
  background: "var(--secondary)",
  border: "1px solid var(--border)",
  color: "var(--secondary-foreground)",
  borderRadius: "var(--radius)",
  padding: "8px 12px",
  textAlign: "left",
  cursor: "pointer",
  fontSize: 12,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
};

const pillButtonStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  border: "none",
  color: "white",
  borderRadius: 999,
  padding: "10px 16px",
  textAlign: "left",
  cursor: "pointer",
  fontSize: 12,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  boxShadow: "0 6px 18px rgba(59, 130, 246, 0.35)",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--input-background)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
  borderRadius: "var(--radius)",
  padding: "6px 8px",
  fontSize: 12,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--input-background)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
  borderRadius: "var(--radius)",
  padding: "6px 8px",
  fontSize: 12,
};