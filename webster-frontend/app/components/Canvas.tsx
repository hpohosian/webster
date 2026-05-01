import { useRef, useState, useEffect } from "react";
import { Hand, MousePointer2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { Canvas as FabricCanvas, Rect } from "fabric";
import { useEditorStore, useSelectedLayer, useIsLayerLocked } from "../store/editorStore";

type Tool = "hand" | "pointer";

export function Canvas() {
  const activeTool    = useEditorStore((s) => s.activeTool);
  const zoom          = useEditorStore((s) => s.zoom);
  const offset        = useEditorStore((s) => s.offset);
  const brushColor    = useEditorStore((s) => s.brushColor);
  const brushSize     = useEditorStore((s) => s.brushSize);
  const brushOpacity  = useEditorStore((s) => s.brushOpacity);
 
  // Actions aus dem Store – diese Funktionen ändern den State
  const zoomIn        = useEditorStore((s) => s.zoomIn);
  const zoomOut       = useEditorStore((s) => s.zoomOut);
  const resetView     = useEditorStore((s) => s.resetView);
  const setOffset     = useEditorStore((s) => s.setOffset);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const pushHistory   = useEditorStore((s) => s.pushHistory);
 
  // Custom Selektoren aus dem Store-File
  const selectedLayer = useSelectedLayer();
  const isLocked      = useIsLayerLocked();

   const canvasRef     = useRef<HTMLCanvasElement>(null);
    const [isPanning,   setIsPanning]   = useState(false);
    const [panStart,    setPanStart]    = useState({ x: 0, y: 0 });
    const [isDrawing,   setIsDrawing]   = useState(false);
    const [lastPos,     setLastPos]     = useState<{ x: number; y: number } | null>(null);
    const [showCtxMenu, setShowCtxMenu] = useState(false);
    const [ctxPos,      setCtxPos]      = useState({ x: 0, y: 0 });
 
 // ── Canvas initialisieren ──────────────────────────────────────────────
 
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#2a2a35";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#454fda";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  }, []);
 
  // ── Event Handler ──────────────────────────────────────────────────────
 
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / (zoom / 100),
      y: (e.clientY - rect.top)  / (zoom / 100),
    };
  };
 
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2) return;
    setShowCtxMenu(false);
 
    if (activeTool === "hand") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    } else if (activeTool === "draw" && !isLocked) {
      setIsDrawing(true);
      setLastPos(getCanvasPos(e));
    }
  };
 
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Pan: offset direkt in den globalen Store schreiben
    // → ToolsPanel oder RightPanel könnten offset theoretisch auch lesen
    if (isPanning && activeTool === "hand") {
      setOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
 
    if (isDrawing && activeTool === "draw" && !isLocked && lastPos) {
      const ctx = canvasRef.current!.getContext("2d")!;
      const pos = getCanvasPos(e);
 
      // brushColor/brushSize/brushOpacity kommen direkt aus dem Store –
      // wenn der User in der FeaturesPanel die Farbe ändert, wirkt es sofort
      ctx.globalAlpha  = brushOpacity / 100;
      ctx.strokeStyle  = brushColor;
      ctx.lineWidth    = brushSize;
      ctx.lineCap      = "round";
      ctx.lineJoin     = "round";
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setLastPos(pos);
    }
  };
 
  const handleMouseUp = () => {
    if (isDrawing) pushHistory("Draw Stroke"); // → History-Tab zeigt das sofort
    setIsPanning(false);
    setIsDrawing(false);
    setLastPos(null);
  };
 
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setCtxPos({ x: e.clientX, y: e.clientY });
    setShowCtxMenu(true);
  };
 
  const cursor =
    activeTool === "hand"  ? (isPanning ? "grabbing" : "grab") :
    activeTool === "draw"  ? "crosshair" :
    "default";
 
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#161620", overflow: "hidden", position: "relative" }}>
 
      {/* ── Toolbar ── */}
      <div style={{
        height: 44, background: "#0d0d12", borderBottom: "1px solid #1e1e2a",
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", flexShrink: 0,
      }}>
        {/* Tool-Buttons zeigen den globalen activeTool State an */}
        <div style={{ display: "flex", gap: 4 }}>
          {([
            { id: "pointer" as const, Icon: MousePointer2 },
            { id: "hand"    as const, Icon: Hand },
          ]).map(({ id, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTool(id)} // schreibt in den Store → ToolsPanel-Buttons updaten sich auch
              style={{
                padding: 6, borderRadius: 6, border: "none", cursor: "pointer",
                background: activeTool === id ? "#454fda" : "transparent",
                color:      activeTool === id ? "#fff"    : "#666",
              }}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
 
        {/* Zoom-Controls lesen+schreiben aus dem Store */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={zoomOut} style={iconBtnStyle}><ZoomOut  size={14} /></button>
          <span style={{ fontSize: 12, color: "#888", minWidth: 44, textAlign: "center" }}>{zoom}%</span>
          <button onClick={zoomIn}  style={iconBtnStyle}><ZoomIn   size={14} /></button>
          <button onClick={resetView} style={iconBtnStyle}><RotateCcw size={14} /></button>
        </div>
 
        {/* Zeigt den aktuell selektierten Layer – kommt aus dem Store */}
        <div style={{ fontSize: 11, color: "#555" }}>
          {selectedLayer ? `${selectedLayer.name}${isLocked ? " 🔒" : ""}` : "–"}
        </div>
      </div>
 
      {/* ── Canvas Area ── */}
      <div
        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
        onClick={() => setShowCtxMenu(false)}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom / 100})`,
            transformOrigin: "center",
            cursor,
            boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={handleContextMenu}
        >
          <canvas ref={canvasRef} width={800} height={600} style={{ display: "block" }} />
        </div>
      </div>
 
      {/* ── Context Menu ── */}
      {showCtxMenu && (
        <div style={{
          position: "fixed", left: ctxPos.x, top: ctxPos.y, zIndex: 100,
          background: "#16161f", border: "1px solid #2a2a3a", borderRadius: 8,
          padding: 4, minWidth: 180, boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}>
          {([
            ["Duplicate",      "Ctrl+D"],
            null,
            ["Rotate 90° CW",  ""],
            ["Flip Horizontal",""],
            null,
            ["Bring to Front", "Ctrl+]"],
            ["Send to Back",   "Ctrl+["],
            null,
            ["Delete",         "Del"],
          ] as ([string, string] | null)[]).map((item, i) =>
            item === null ? (
              <div key={i} style={{ height: 1, background: "#2a2a3a", margin: "3px 0" }} />
            ) : (
              <button
                key={i}
                onClick={() => { pushHistory(item[0]); setShowCtxMenu(false); }}
                style={{
                  display: "flex", justifyContent: "space-between", width: "100%",
                  background: "none", border: "none",
                  color: item[0] === "Delete" ? "#f87171" : "#ccc",
                  padding: "7px 10px", borderRadius: 5, cursor: "pointer", fontSize: 12,
                }}
              >
                <span>{item[0]}</span>
                {item[1] && <span style={{ opacity: 0.4, fontSize: 11 }}>{item[1]}</span>}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
 
const iconBtnStyle: React.CSSProperties = {
  background: "transparent", border: "1px solid #2a2a3a", color: "#888",
  borderRadius: 5, padding: 5, cursor: "pointer", display: "flex", alignItems: "center",
};
 