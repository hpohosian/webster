import { Download, Share2 } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import jsPDF from "jspdf";

const API = import.meta.env?.VITE_API;
export function Header() {
  // const history     = useEditorStore((s) => s.history);
  const [userId, setId] = useState(null);
  const [exportFormat, setExportFormat] = useState("png");
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(undefined);
  const { projectId } = useParams();
  const isLogo = project?.type === "logo";
  const canvas = useEditorStore((s) => s.fabricCanvas);
  
  async function handleShare(imageName = 'shared-image.png') {
    try {
      let file: File | null = null;
      // logo case
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
        
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        
        file = new File([blob], imageName, { type: blob.type });
      }
      // edit case
      
      else {
        if (!canvas) return;

        // PNG / JPEG
        if (exportFormat === "png" || exportFormat === "jpeg") {
          const dataUrl = canvas.toDataURL({
            format: exportFormat,
            quality: 1,
            multiplier: 2,
          });

        const response = await fetch(dataUrl);
            const blob = await response.blob();

          file = new File(
              [blob],
              `${imageName}.${exportFormat}`,
              {
                type: blob.type,
              }
            );
          }

        // SVG
        if (exportFormat === "svg") {
          const svg = canvas.toSVG();

          const blob = new Blob([svg], {
            type: "image/svg+xml",
          });

          file = new File(
              [blob],
              `${imageName}.svg`,
              {
                type: "image/svg+xml",
              }
            );
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

          const blob = pdf.output("blob");

          file = new File(
            [blob],
            `${imageName}.pdf`,
            {
              type: "application/pdf",
            }
          );
        }
      }
        if (!file) return;

        // Verif if the browser's share system accepts this specific file type
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        
        // native share menu
        await navigator.share({
          files: [file],
          title: 'Check out this image!',
          text: 'Sent from my app.',
        });
        console.log('Shared successfully!');
        
      } else {
        const url = URL.createObjectURL(file);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();

      URL.revokeObjectURL(url);
    }
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  }

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

    // render
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
          onClick={() => handleShare()}
          style={{
            ...btnStyle,
            background: "var(--accent)",
            border: "none",
            color: "#fff"
          }}
        >
          {project?.type === "logo" ? ( <Share2 size={16} /> ): (<Share2 size={13} /> )}

          Share
        </button>

        <button
          onClick={() => handleExport()}
          style={{
            ...btnStyle,
            background: "#a5c3c5",
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