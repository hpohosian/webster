import { Download } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import jsPDF from "jspdf";

const API = import.meta.env?.VITE_API;

export function Header() {
  // const history     = useEditorStore((s) => s.history);
  // const pushHistory = useEditorStore((s) => s.pushHistory);
  const [userId, setId] = useState(null);
  const [exportFormat, setExportFormat] = useState("png");
  const { projectId } = useParams();
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(undefined);

  useEffect(() => {
    if (!projectId) return;

    fetch(`${API}/projects/${projectId}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        setProject(data);
      })
      .catch(console.error);
  }, [projectId]);

  const isLogo = project?.type === "logo";
  
  //  useEffect(() => {
  //       fetch(`${API}/auth/me`, { credentials: "include" })
  //         .then(r => r.json())
  //         .then(data => {
  //           if (data.user) {
  //             // setIsLogged(true);
  //             setId(data.user.id); 
  //           }
  //         })
  //       .catch(console.error);
  //     }, []);
  // const canUndo = history.length > 1;

  const canvas = useEditorStore((s) => s.fabricCanvas);

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
    if (isLogo) {
      const ref = useEditorStore.getState().logoRef;
      if (!ref) return;

      if (exportFormat !== "png" && exportFormat !== "jpeg") {
        alert("This format is not supported for logos yet");
        return;
      }

      const { toPng, toJpeg } = await import("html-to-image");

      const dataUrl =
        exportFormat === "png"
          ? await toPng(ref, { pixelRatio: 2, cacheBust: true })
          : await toJpeg(ref, { pixelRatio: 2, cacheBust: true });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `logo.${exportFormat}`;
      link.click();

      return;
    }
    
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

  const availableFormats = isLogo
    ? ["png", "jpeg"]
    : ["png", "jpeg", "svg", "pdf"];

  return (
    <header style={{
      height: 45, background: "#0d0d12", borderBottom: "1px solid #1e1e2a",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 16px", flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link to={`/projects/${userId}`} style={{ fontWeight: 700, fontSize: 17, color: "var(--accent)", letterSpacing: "-0.5px" }}>
          Prismat
        </Link>
      </div>

       <div style={{ display: "flex", gap: 8 }}>
        {/* <button
          disabled={!canUndo}
          style={{ ...btnStyle, opacity: canUndo ? 1 : 0.4 }}
          onClick={() => pushHistory("Undo")}
        >
          <Undo2 size={13} /> Undo
        </button>
        <button style={btnStyle} onClick={() => pushHistory("Redo")}>
          <Redo2 size={13} /> Redo
        </button> */}

        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
          style={{
            background: "#1b1b1b",
            color: "#fff",
            border: "1px solid #333333",
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: project?.type === "logo"? 15: 12,
          }}
        >
          {availableFormats.map((f) => (
            <option key={f} value={f}>
              {f.toUpperCase()}
            </option>
          ))}
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
          {project?.type === "logo" ? ( <Download size={16} /> ): (<Download size={13} /> )}

          Export
        </button>

        {project?.type !== "logo" && (
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
        )}
      </div>
    </header>
  );
}

const btnStyle: React.CSSProperties = {
  background: "none", border: "1px solid #2a2a2a", color: "#aaa",
  borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer",
  display: "flex", alignItems: "center", gap: 4,
};