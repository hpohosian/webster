import { Download, Undo2, Redo2 } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import jsPDF from "jspdf";

const API = import.meta.env?.VITE_API;

export function Header() {
  const history     = useEditorStore((s) => s.history);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const [userId, setId] = useState(null);
  const [exportFormat, setExportFormat] = useState("png");
  const { projectId } = useParams();
  const [saving, setSaving] = useState(false);
  
   useEffect(() => {
        fetch(`${API}/auth/me`, { credentials: "include" })
          .then(r => r.json())
          .then(data => {
            if (data.user) {
              // setIsLogged(true);
              setId(data.user.id); 
            }
          })
        .catch(console.error);
      }, []);
  const canUndo = history.length > 1;

  const canvas = useEditorStore((s) => s.fabricCanvas);

  // function handleExport(format: "png" | "jpeg") {
  //   if (!canvas) return;

  //   const dataURL = canvas.toDataURL({
  //     format,
  //     quality: 1,
  //     multiplier: 2,
  //   });

  //   const link = document.createElement("a");

  //   link.href = dataURL;
  //   link.download = `prismat-export.${format}`;

  //   link.click();
  // }

  const saveAsTemplate = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      await fetch(`${API}/templates/${projectId}/save-as-template`, {
        method: "POST",
        credentials: "include",
      });
      alert("Saved as template!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  async function handleExport() {
    if (!canvas) return;

    // PNG / JPEG
    if (exportFormat === "png" || exportFormat === "jpeg") {
      const dataURL = canvas.toDataURL({
        format: exportFormat,
        quality: 1,
        multiplier: 2,
      });

      const link = document.createElement("a");

      link.href = dataURL;
      link.download = `prismat-export.${exportFormat}`;

      link.click();
    }

    // SVG
    if (exportFormat === "svg") {
      const svg = canvas.toSVG();

      const blob = new Blob([svg], {
        type: "image/svg+xml",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "prismat-export.svg";

      link.click();

      URL.revokeObjectURL(url);
    }

    // PDF
    if (exportFormat === "pdf") {
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [
          canvas.getWidth(),
          canvas.getHeight(),
        ],
      });

      pdf.addImage(
        dataURL,
        "PNG",
        0,
        0,
        canvas.getWidth(),
        canvas.getHeight()
      );

      pdf.save("prismat-export.pdf");
    }
  }

  return (
    <header style={{
      height: 48, background: "#0d0d12", borderBottom: "1px solid #1e1e2a",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 16px", flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link to={`/projects/${userId}`} style={{ fontWeight: 700, fontSize: 15, color: "var(--accent)", letterSpacing: "-0.5px" }}>
          Prismat
        </Link>
          <button style={{ background: "none", border: "none", color: "#666", fontSize: 13, cursor: "pointer" }}>
            Edit
          </button>
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

        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
          style={{
            background: "#111",
            color: "#fff",
            border: "1px solid #2a2a2a",
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 12,
          }}
        >
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
          <option value="pdf">PDF</option>
          <option value="svg">SVG</option>
        </select>

        <button
          onClick={() => handleExport()}
          style={{
            ...btnStyle,
            background: "var(--accent)",
            border: "none",
            color: "#fff"
          }}
        >
          <Download size={13} /> Export
        </button>

        <button
          onClick={saveAsTemplate}
          disabled={saving}
          style={{
            ...btnStyle,
            opacity: saving ? 0.6 : 1,
            background: "var(--accent)",
            color: "#fff",
            border: "none",
          }}
        >
          {saving ? "Saving..." : "Save as Template"}
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