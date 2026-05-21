import { useEffect, useRef, useState } from "react";
import { filters } from "fabric";
import { Sun, Contrast, Palette, Lightbulb, CloudRain, Triangle } from "lucide-react";
import { useParams } from "react-router";
import { useEditorStore } from "../store/editorStore";
import type { Adjustments, BrushMode, ShapeKind } from "../store/editorStore";
import { getPalette, listFonts, searchImages } from "../lib/demoApi";
import type { DemoColor, DemoFont, DemoImage } from "../lib/demoApi";

export function FeaturesPanel() {
  const activePanel = useEditorStore((s) => s.activePanel);
  const setActivePanel = useEditorStore((s) => s.setActivePanel);

  if (!activePanel) return null;

  const titles: Record<string, string> = {
    upload: "Upload",
    resize: "Resize Canvas",
    adjustments: "Adjustments",
    filter: "Filters",
    text: "Text",
    draw: "Draw & Fill",
    shapes: "Shapes",
    templates: "Templates",
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
          style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer", fontSize: 16 }}
        >×</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {activePanel === "adjustments" && <AdjustmentsContent />}
        {activePanel === "filter" && <FilterContent />}
        {activePanel === "draw" && <DrawContent />}
        {activePanel === "text" && <TextContent />}
        {activePanel === "shapes" && <ShapesContent />}
        {activePanel === "resize" && <ResizeContent />}
        {activePanel === "upload" && <UploadContent />}
        {activePanel === "templates" && <TemplatesContent />}
      </div>
    </div>
  );
}
// basic adjustments
function AdjustmentsContent() {
  const adjustments = useEditorStore((s) => s.adjustments);
  const setAdjustment = useEditorStore((s) => s.setAdjustment);
  const resetAdjustments = useEditorStore((s) => s.resetAdjustments);
  const pushHistory = useEditorStore((s) => s.pushHistory);

  const fields: { key: keyof Adjustments; Icon: any; label: string }[] = [
    { key: "highlights", Icon: Sun, label: "Highlights" },
    { key: "contrast", Icon: Contrast, label: "Contrast" },
    { key: "colorBalance", Icon: Palette, label: "Color Balance" },
    { key: "light", Icon: Lightbulb, label: "Light" },
    { key: "shadow", Icon: CloudRain, label: "Shadow" },
    { key: "Blur", Icon: CloudRain, label: "Blur" },
    { key: "Scharpen", Icon: Triangle, label: "Shadow" },
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
            type="range"
            min={-100}
            max={100}
            value={adjustments[key]}
            onChange={(e) => {
              setAdjustment(key, Number(e.target.value));
              pushHistory("Adjust " + label);
            }}
            style={{ width: "100%", accentColor: "var(--accent)" }}
          />
        </div>
      ))}
      <button
        onClick={() => { resetAdjustments(); pushHistory("Reset Adjustments"); }}
        style={{ background: "var(--secondary)", color: "var(--muted-foreground)", borderRadius: "var(--radius)", padding: "6px", fontSize: 12, cursor: "pointer" }}
      >Reset All</button>
    </div>
  );
}
// draw 
function DrawContent() {
  const brushColor = useEditorStore((s) => s.brushColor);
  const brushSize = useEditorStore((s) => s.brushSize);
  const brushOpacity = useEditorStore((s) => s.brushOpacity);
  const brushMode = useEditorStore((s) => s.brushMode);
  const setBrushColor = useEditorStore((s) => s.setBrushColor);
  const setBrushSize = useEditorStore((s) => s.setBrushSize);
  const setBrushOpacity = useEditorStore((s) => s.setBrushOpacity);
  const setBrushMode = useEditorStore((s) => s.setBrushMode);

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

  const modes: { id: BrushMode; label: string }[] = [
    { id: "pencil", label: "Pencil" },
    { id: "marker", label: "Marker" },
    { id: "highlighter", label: "Highlighter" },
    { id: "spray", label: "Spray" },
    { id: "dots", label: "Dots" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Mode</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setBrushMode(mode.id)}
              style={{
                ...panelBtnStyle,
                justifyContent: "center",
                padding: "7px 8px",
                background: brushMode === mode.id ? "var(--accent)" : "var(--secondary)",
                color: brushMode === mode.id ? "#fff" : "var(--secondary-foreground)",
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Color</label>
        <input
          type="color"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
          style={{ width: "100%", height: 36, borderRadius: "var(--radius)", cursor: "pointer" }}
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
                border: item.hex.toLowerCase() === brushColor.toLowerCase() ? "2px solid var(--primary)" : "1px solid var(--sidebar-border)",
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
// filters 
function FilterContent() {
  const canvas = useEditorStore((s) => s.fabricCanvas);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [blur, setBlur] = useState(0);
  const [grayscale, setGrayscale] = useState(false);
  const [sepia, setSepia] = useState(false);

  const active = canvas?.getActiveObject() as any;
  const isImageSelected = Boolean(active && active.type === "image");

  const applyImageFilters = (next = { brightness, contrast, saturation, blur, grayscale, sepia }) => {
    if (!canvas) return;
    const image = canvas.getActiveObject() as any;
    if (!image || image.type !== "image") return;

    const FabricFilters = filters as any;
    image.filters = [
      next.brightness !== 0 ? new FabricFilters.Brightness({ brightness: next.brightness / 100 }) : null,
      next.contrast !== 0 ? new FabricFilters.Contrast({ contrast: next.contrast / 100 }) : null,
      next.saturation !== 0 ? new FabricFilters.Saturation({ saturation: next.saturation / 100 }) : null,
      next.blur !== 0 ? new FabricFilters.Blur({ blur: next.blur / 100 }) : null,
      next.grayscale ? new FabricFilters.Grayscale() : null,
      next.sepia ? new FabricFilters.Sepia() : null,
    ].filter(Boolean);

    image.applyFilters();
    commitActiveObject(canvas, "Edit Image Filters", pushHistory);
  };

  const setAndApply = (patch: Partial<{ brightness: number; contrast: number; saturation: number; blur: number; grayscale: boolean; sepia: boolean }>) => {
    const next = { brightness, contrast, saturation, blur, grayscale, sepia, ...patch };
    if (patch.brightness !== undefined) setBrightness(patch.brightness);
    if (patch.contrast !== undefined) setContrast(patch.contrast);
    if (patch.saturation !== undefined) setSaturation(patch.saturation);
    if (patch.blur !== undefined) setBlur(patch.blur);
    if (patch.grayscale !== undefined) setGrayscale(patch.grayscale);
    if (patch.sepia !== undefined) setSepia(patch.sepia);
    applyImageFilters(next);
  };

  const reset = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setBlur(0);
    setGrayscale(false);
    setSepia(false);
    applyImageFilters({ brightness: 0, contrast: 0, saturation: 0, blur: 0, grayscale: false, sepia: false });
  };

  useEffect(() => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setBlur(0);
    setGrayscale(false);
    setSepia(false);
  }, [selectedLayerId]);

  if (!isImageSelected) {
    return <EmptyPanelHint>Select an image layer to adjust filters.</EmptyPanelHint>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SliderField label="Brightness" value={brightness} min={-100} max={100} onChange={(value) => setAndApply({ brightness: value })} />
      <SliderField label="Contrast" value={contrast} min={-100} max={100} onChange={(value) => setAndApply({ contrast: value })} />
      <SliderField label="Saturation" value={saturation} min={-100} max={100} onChange={(value) => setAndApply({ saturation: value })} />
      <SliderField label="Blur" value={blur} min={0} max={100} onChange={(value) => setAndApply({ blur: value })} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
        <button onClick={() => setAndApply({ grayscale: !grayscale })} style={{ ...panelBtnStyle, justifyContent: "center", background: grayscale ? "var(--accent)" : "var(--secondary)", color: grayscale ? "#fff" : "var(--secondary-foreground)" }}>Grayscale</button>
        <button onClick={() => setAndApply({ sepia: !sepia })} style={{ ...panelBtnStyle, justifyContent: "center", background: sepia ? "var(--accent)" : "var(--secondary)", color: sepia ? "#fff" : "var(--secondary-foreground)" }}>Sepia</button>
      </div>

      <button onClick={reset} style={{ ...panelBtnStyle, justifyContent: "center" }}>Reset Filters</button>
    </div>
  );
}
// text 
function TextContent() {
  const canvas = useEditorStore((s) => s.fabricCanvas);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const runCanvasCommand = useEditorStore((s) => s.runCanvasCommand);
  const pushHistory = useEditorStore((s) => s.pushHistory);
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
        setFonts([...loadedFonts, ...fontOptions]);
        if (loadedFonts[0]?.family) setSelectedFont(loadedFonts[0].family);
      })
      .catch(() => { if (isActive) setFonts([]); })
      .finally(() => { if (isActive) setIsLoadingFonts(false); });

    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    const active = canvas?.getActiveObject() as any;
    if (!active || !isTextObject(active)) return;
    setTextValue(active.text || "");
    setSelectedFont(active.fontFamily || "Arial");
    setFontSize(Math.round(active.fontSize || 48));
    setTextColor(typeof active.fill === "string" ? active.fill : brushColor);
    setIsBold(active.fontWeight === "bold" || Number(active.fontWeight) >= 600);
    setIsItalic(active.fontStyle === "italic");
    setIsUnderline(Boolean(active.underline));
  }, [brushColor, canvas, selectedLayerId]);

  const fontOptions = fonts.length > 0
    ? fonts
    : ["Arial", "Georgia", "Courier New", "Impact", "Trebuchet MS"].map((family) => ({ family }));

  const selectedObject = canvas?.getActiveObject() as any;
  const isTextSelected = Boolean(selectedObject && isTextObject(selectedObject));

  const applyToSelectedText = async (patch: Partial<{ text: string; fontFamily: string; fontSize: number; fill: string; fontWeight: "normal" | "bold"; fontStyle: "normal" | "italic"; underline: boolean }>) => {
    if (!canvas) return;
    const active = canvas.getActiveObject() as any;
    if (!active || !isTextObject(active)) return;

    const nextFont = patch.fontFamily ?? selectedFont;
    await loadFontFamily(nextFont);
    active.set({
      text: patch.text ?? textValue,
      fontFamily: nextFont,
      fontSize: patch.fontSize ?? fontSize,
      fill: patch.fill ?? textColor,
      fontWeight: patch.fontWeight ?? (isBold ? "bold" : "normal"),
      fontStyle: patch.fontStyle ?? (isItalic ? "italic" : "normal"),
      underline: patch.underline ?? isUnderline,
    });
    commitActiveObject(canvas, "Edit Text", pushHistory);
  };

  const updateTextValue = (value: string) => {
    setTextValue(value);
    void applyToSelectedText({ text: value });
  };

  const updateFont = (value: string) => {
    setSelectedFont(value);
    void applyToSelectedText({ fontFamily: value });
  };

  const updateFontSize = (value: number) => {
    const next = Number.isFinite(value) ? Math.max(1, value) : 16;
    setFontSize(next);
    void applyToSelectedText({ fontSize: next });
  };

  const updateTextColor = (value: string) => {
    setTextColor(value);
    void applyToSelectedText({ fill: value });
  };

  const toggleBold = () => {
    const next = !isBold;
    setIsBold(next);
    void applyToSelectedText({ fontWeight: next ? "bold" : "normal" });
  };

  const toggleItalic = () => {
    const next = !isItalic;
    setIsItalic(next);
    void applyToSelectedText({ fontStyle: next ? "italic" : "normal" });
  };

  const toggleUnderline = () => {
    const next = !isUnderline;
    setIsUnderline(next);
    void applyToSelectedText({ underline: next });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Text</label>
        <input value={textValue} onChange={(e) => updateTextValue(e.target.value)} style={inputStyle} />
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>
          Font {isLoadingFonts && <span style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>· loading Google Fonts</span>}
        </label>
        <select value={selectedFont} onChange={(e) => updateFont(e.target.value)} style={selectStyle}>
          {fontOptions.map((font) => (
            <option key={font.family} value={font.family}>{font.family}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Color</label>
        <input type="color" value={toHexInputColor(textColor)} onChange={(e) => updateTextColor(e.target.value)} style={{ width: "100%", height: 34, borderRadius: "var(--radius)", cursor: "pointer", border: "1px solid var(--border)" }} />
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Size (px)</label>
        <input type="number" value={fontSize} onChange={(e) => updateFontSize(Number(e.target.value) || 16)} style={inputStyle} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={toggleBold} style={{ ...panelBtnStyle, flex: 1, fontWeight: "bold", background: isBold ? "var(--accent)" : "var(--secondary)", color: isBold ? "#fff" : "var(--secondary-foreground)" }}>B</button>
        <button onClick={toggleItalic} style={{ ...panelBtnStyle, flex: 1, fontStyle: "italic", background: isItalic ? "var(--accent)" : "var(--secondary)", color: isItalic ? "#fff" : "var(--secondary-foreground)" }}>I</button>
        <button onClick={toggleUnderline} style={{ ...panelBtnStyle, flex: 1, textDecoration: "underline", background: isUnderline ? "var(--accent)" : "var(--secondary)", color: isUnderline ? "#fff" : "var(--secondary-foreground)" }}>U</button>
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
        style={{ ...panelBtnStyle, background: "var(--accent)", color: "#fff", justifyContent: "center" }}
      >
        {isTextSelected ? "Add Another Text" : "Add Text"}
      </button>
      {!isTextSelected && <EmptyPanelHint>Select a text layer to edit existing text styles.</EmptyPanelHint>}
    </div>
  );
}
// shapes
function ShapesContent() {
  const runCanvasCommand = useEditorStore((s) => s.runCanvasCommand);
  const shapeColor = useEditorStore((s) => s.shapeColor); 
  const setShapeColor = useEditorStore((s) => s.setShapeColor);
  const getShapeColor = () => useEditorStore.getState().shapeColor;

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
        <button
          key={item.shape}
          onClick={() => runCanvasCommand({ type: "add-shape", shape: item.shape, color: getShapeColor() })}
          style={panelBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sidebar-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--secondary)")}
        >{item.label}</button>
      ))}
      <div>
        <label style={{ fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 4 }}>Color</label>
        <input type="color" value={(shapeColor)} 
        onChange={(e) => setShapeColor(e.target.value)}
        style={{ width: "100%", height: 34, borderRadius: "var(--radius)", cursor: "pointer" }} />
      </div>
    </div>
  );
}
// resize canvas 
function ResizeContent() {
  const canvasSize = useEditorStore((s) => s.canvasSize);
  const setCanvasSize = useEditorStore((s) => s.setCanvasSize);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const { projectId } = useParams<{ projectId: string }>();

  const applyPreset = (w: number, h: number, name: string) => {
    setCanvasSize({ w, h });
    pushHistory("Resize: " + name);
  };

  async function saveProject(id: string, projectState: any) {
    const res = await fetch("http://localhost:3000/projects/" + id + "/save", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ projectState, isAutoSave: false }),
    });

    if (!res.ok) throw new Error("Failed to save project");
    return res.json();
  }

  const handleApply = async () => {
    setCanvasSize(canvasSize);

    if (projectId) {
      await saveProject(projectId, {
        canvas: { width: canvasSize.w, height: canvasSize.h, background: "#ededed" },
        objects: [],
      });
      pushHistory("Resize saved to DB");
      return;
    }

    pushHistory("Resize Canvas");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          type="number"
          placeholder="W"
          value={canvasSize.w}
          onChange={(e) => setCanvasSize({ w: Number(e.target.value) || 1, h: canvasSize.h })}
          style={{ ...inputStyle, flex: 1 }}
        />
        <span style={{ color: "var(--muted-foreground)" }}>×</span>
        <input
          type="number"
          value={canvasSize.h}
          onChange={(e) => setCanvasSize({ w: canvasSize.w, h: Number(e.target.value) || 1 })}
          style={{ ...inputStyle, flex: 1 }}
        />
      </div>
      {([
        ["Full HD", 1920, 1080],
        ["Instagram Post", 1080, 1080],
        ["Story", 1080, 1920],
        ["YouTube", 1280, 720],
        ["Twitter", 1200, 675],
        ["Banner", 970, 250],
      ] as [string, number, number][]).map(([name, w, h]) => (
        <button key={name} onClick={() => applyPreset(w, h, name)} style={panelBtnStyle}>
          <span>{name}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: 11, opacity: 0.7 }}>{w}×{h}</span>
        </button>
      ))}

      {/* <button onClick={handleApply} style={pillButtonStyle}>Apply</button> */}
    </div>
  );
}
// apload picture 
function UploadContent() {
  const runCanvasCommand = useEditorStore((s) => s.runCanvasCommand);
  const addImageLayer = useEditorStore((s) => s.addImageLayer);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const [query, setQuery] = useState("social media");
  const [images, setImages] = useState<DemoImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { projectId } = useParams<{ projectId: string }>();

  const createLayer = async (layer: any, id: string) => {
    const res = await fetch("http://localhost:3000/projects/" + id + "/layers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(layer),
    });

    if (!res.ok) throw new Error("Failed to create layer");
    return res.json();
  };

  const uploadFile = async (file: File, id?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (id) formData.append("projectId", id);

    const res = await fetch("http://localhost:3000/files/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadFile(file, projectId);
      const newLayer = {
        type: "image" as const,
        name: "Image Layer",
        visible: true,
        locked: false,
        opacity: 100,
        blendMode: "normal",
        src: "http://localhost:3000" + uploaded.url,
        fileId: uploaded.id,
        x: 100,
        y: 100,
        width: uploaded.width || 300,
        height: uploaded.height || 300,
      };

      const savedLayer = projectId ? await createLayer(newLayer, projectId) : { id: "local-" + Date.now() };
      addImageLayer({ id: savedLayer.id, ...newLayer });
      pushHistory("Upload image");
      e.target.value = "";
    } catch {
      setError("Upload failed");
    }
  };

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
        onClick={() => fileInputRef.current?.click()}
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
        Drop image here<br />or click to upload
      </button>

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileUpload} />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") loadImages(); }}
        placeholder="Search Unsplash"
        style={inputStyle}
      />

      <button onClick={loadImages} style={{ ...panelBtnStyle, justifyContent: "center" }}>
        {isLoadingImages ? "Searching..." : "Search Images"}
      </button>

      {error && <div style={{ color: "var(--destructive)", fontSize: 12 }}>{error}</div>}

      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {images.slice(0, 6).map((image) => (
            <button
              key={image.id}
              title={image.alt}
              onClick={() => runCanvasCommand({ type: "add-image", url: image.regular, alt: image.alt })}
              style={{
                overflow: "hidden",
                borderRadius: "var(--radius)",
                background: "var(--secondary)",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <img src={image.thumb} alt={image.alt} style={{ width: "100%", height: 68, objectFit: "cover", display: "block" }} />
              <span style={{ display: "block", padding: "5px 6px", color: "var(--muted-foreground)", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
// templates 
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
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sidebar-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--secondary)")}
        >
          <span>{template.name}</span>
          <span style={{ color: "var(--muted-foreground)", fontSize: 11, opacity: 0.7 }}>{template.size.w}×{template.size.h}</span>
        </button>
      ))}
    </div>
  );
}

function EmptyPanelHint({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      border: "1px dashed var(--border)",
      borderRadius: "var(--radius)",
      padding: 12,
      color: "var(--muted-foreground)",
      fontSize: 12,
      lineHeight: 1.4,
      background: "var(--secondary)",
    }}>
      {children}
    </div>
  );
}

function isTextObject(object: any) {
  return object?.type === "i-text" || object?.type === "text" || object?.type === "textbox";
}

function commitActiveObject(canvas: any, label: string, pushHistory?: (label: string) => void) {
  const active = canvas.getActiveObject?.();
  if (!active) return;

  active.setCoords?.();
  canvas.requestRenderAll?.();
  canvas.fire?.("object:modified", { target: active });
  pushHistory?.(label);
}

async function loadFontFamily(family: string) {
  if (typeof document === "undefined" || !family) return;
  const id = "font-" + family.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(family).replace(/%20/g, "+") + ":wght@400;700&display=swap";
    document.head.appendChild(link);
  }

  if (document.fonts?.load) {
    await document.fonts.load("16px \"" + family + "\"");
  }
}

function toHexInputColor(color: string) {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return "#" + color.slice(1).split("").map((part) => part + part).join("");
  }
  return "#000000";
}

function SliderField({ label, value, min, max, onChange, unit = "" }: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <label style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{label}</label>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)", opacity: 0.6 }}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--accent)" }}
      />
    </div>
  );
}

const panelBtnStyle: React.CSSProperties = {
  background: "var(--secondary)",
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

// const pillButtonStyle: React.CSSProperties = {
//   background: "linear-gradient(135deg, #3bd1f6, #2563eb)",
//   border: "none",
//   color: "white",
//   borderRadius: 999,
//   padding: "10px 16px",
//   textAlign: "center",
//   cursor: "pointer",
//   fontSize: 12,
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
//   width: "100%",
// };

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--secondary)",
  color: "var(--secondary-foreground)",
  borderRadius: "var(--radius)",
  padding: "6px 8px",
  fontSize: 12,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--secondary)",
  color: "var(--secondary-foreground)",
  borderRadius: "var(--radius)",
  padding: "6px 8px",
  fontSize: 12,
};
