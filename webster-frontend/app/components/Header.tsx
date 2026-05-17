import { Download, Undo2, Redo2 } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import { Link } from "react-router"
export function Header() {
  const history     = useEditorStore((s) => s.history);
  const pushHistory = useEditorStore((s) => s.pushHistory);

  const canUndo = history.length > 1;

  const canvas = useEditorStore((s) => s.fabricCanvas);

  function handleExport(format: "png" | "jpeg") {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format,
      quality: 1,
      multiplier: 2,
    });

    const link = document.createElement("a");

    link.href = dataURL;
    link.download = `prismat-export.${format}`;

    link.click();
  }

  return (
    <header style={{
      height: 48, background: "#0d0d12", borderBottom: "1px solid #1e1e2a",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 16px", flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link to="/projects" style={{ fontWeight: 700, fontSize: 15, color: "var(--accent)", letterSpacing: "-0.5px" }}>
          Prismat
        </Link>
        {["Save to projects", "Edit", "Image", "View"].map((m) => (
          <button key={m} style={{ background: "none", border: "none", color: "#666", fontSize: 13, cursor: "pointer" }}>
            {m}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          disabled={!canUndo}
          style={{ ...btnStyle, opacity: canUndo ? 1 : 0.4 }}
          onClick={() => pushHistory("Undo")}
        >
          <Undo2 size={13} /> Undo
        </button>
        <button style={btnStyle} onClick={() => pushHistory("Redo")}>
          <Redo2 size={13} /> Redo
        </button>
        <button
          onClick={() => handleExport("png")}
          style={{
            ...btnStyle,
            background: "var(--accent)",
            border: "none",
            color: "#fff"
          }}
        >
          <Download size={13} /> Export
        </button>
      </div>
    </header>
  );
}

const btnStyle: React.CSSProperties = {
  background: "none", border: "1px solid #2a2a2a", color: "#aaa",
  borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer",
  display: "flex", alignItems: "center", gap: 4,
};