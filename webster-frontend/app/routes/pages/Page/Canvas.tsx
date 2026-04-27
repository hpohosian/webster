import { useRef, useState, useEffect } from "react";
import { Hand, MousePointer2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import * as ContextMenu from "@radix-ui/react-context-menu";

type Tool = "hand" | "pointer";

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("hand");
  const [zoom, setZoom] = useState(100);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#2a2a35";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#454fda";
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "hand") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning && tool === "hand") {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool("hand")}
            className={`p-2 rounded ${tool === "hand" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
            title="Hand Tool (Space)"
          >
            <Hand className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool("pointer")}
            className={`p-2 rounded ${tool === "pointer" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
            title="Pointer Tool (V)"
          >
            <MousePointer2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(10, zoom - 10))}
            className="p-2 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-foreground min-w-[60px] text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(400, zoom + 10))}
            className="p-2 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(100);
              setOffset({ x: 0, y: 0 });
            }}
            className="p-2 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80">
            Undo
          </button>
          <button className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80">
            Redo
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <div
              className="relative"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px)`,
                cursor: tool === "hand" ? (isPanning ? "grabbing" : "grab") : "default",
              }}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border border-border shadow-lg"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "center",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
          </ContextMenu.Trigger>

          <ContextMenu.Portal>
            <ContextMenu.Content className="min-w-[200px] bg-popover border border-border rounded-lg shadow-lg p-1 z-50">
              <ContextMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center justify-between">
                Duplicate
                <span className="text-xs opacity-60">Ctrl+D</span>
              </ContextMenu.Item>
              <ContextMenu.Separator className="h-px bg-border my-1" />
              <ContextMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                Resize
              </ContextMenu.Item>
              <ContextMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                Rotate 90° CW
              </ContextMenu.Item>
              <ContextMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                Rotate 90° CCW
              </ContextMenu.Item>
              <ContextMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                Flip Horizontal
              </ContextMenu.Item>
              <ContextMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                Flip Vertical
              </ContextMenu.Item>
              <ContextMenu.Separator className="h-px bg-border my-1" />
              <ContextMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center justify-between">
                Bring to Front
                <span className="text-xs opacity-60">Ctrl+]</span>
              </ContextMenu.Item>
              <ContextMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                Bring Forward
              </ContextMenu.Item>
              <ContextMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                Send Backward
              </ContextMenu.Item>
              <ContextMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center justify-between">
                Send to Back
                <span className="text-xs opacity-60">Ctrl+[</span>
              </ContextMenu.Item>
              <ContextMenu.Separator className="h-px bg-border my-1" />
              <ContextMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-destructive hover:text-destructive-foreground cursor-pointer flex items-center justify-between">
                Delete
                <span className="text-xs opacity-60">Del</span>
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
      </div>
    </div>
  );
}
