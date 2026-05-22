import { useEditorStore } from "../store/editorStore";
import {
  MousePointer2, Hand, Upload, Maximize, SlidersHorizontal,
  Wand2, Type, Pencil, Square, LayoutTemplate,
} from "lucide-react";

const TOOL_CATEGORIES = [
  { id: "upload", Icon: Upload, label: "Upload" },
  { id: "resize", Icon: Maximize, label: "Resize" },
  // { id: "adjustments", Icon: SlidersHorizontal, label: "Filters" },
  { id: "filter", Icon: SlidersHorizontal, label: "Adjustments" },
  { id: "text", Icon: Type, label: "Text" },
  { id: "draw", Icon: Pencil, label: "Draw" },
  { id: "shapes", Icon: Square, label: "Shapes" },
] as const;

export function ToolsPanel() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const activePanel = useEditorStore((s) => s.activePanel);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const setActivePanel = useEditorStore((s) => s.setActivePanel);

  return (
    <div style={{
      width: 52,
      background: "var(--sidebar)",
      borderRight: "1px solid var(--sidebar-border)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "8px 0",
      gap: 2,
      flexShrink: 0,
    }}>
      {([
        { id: "pointer" as const, Icon: MousePointer2, label: "Select (V)" },
        { id: "hand" as const, Icon: Hand, label: "Pan (Space)" },
      ]).map(({ id, Icon, label }) => (
        <button
          key={id}
          title={label}
          onClick={() => setActiveTool(id)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: activeTool === id ? "var(--accent)" : "transparent",
            color: activeTool === id ? "#fff" : "#666",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} />
        </button>
      ))}

      <div style={{ width: 28, height: 1, background: "var(--sidebar-border)", margin: "4px 0" }} />

      {TOOL_CATEGORIES.map(({ id, Icon, label }) => (
        <button
          key={id}
          title={label}
          onClick={() => {
            setActivePanel(id);
            if (id === "draw") setActiveTool("draw");
            else if (id === "text") setActiveTool("text");
            else setActiveTool("pointer");
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: activePanel === id ? "#1e1e1e" : "transparent",
            color: activePanel === id ? "var(--accent)" : "#666",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
