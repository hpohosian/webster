import { useRef, useState } from "react";
import { Hand, MousePointer2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { Stage, Layer, Image as KonvaImage, Text, Rect } from "react-konva";
import useImage from "use-image";

const API = import.meta.env.VITE_API;

type Tool = "hand" | "pointer";

function CanvasImage({ el }: { el: any }) {
  const [img] = useImage(`${API}${el.data.src}`);
  return (
    <KonvaImage
      image={img}
      x={el.x} y={el.y}
      width={el.width} height={el.height}
      rotation={el.rotation}
    />
  );
}

function CanvasText({ el }: { el: any }) {
  return (
    <Text
      x={el.x} y={el.y}
      text={el.data.text}
      fontSize={el.data.fontSize ?? 16}
      fill={el.data.fill ?? "#fff"}
      rotation={el.rotation}
    />
  );
}

function CanvasShape({ el }: { el: any }) {
  return (
    <Rect
      x={el.x} y={el.y}
      width={el.width} height={el.height}
      fill={el.data.fill ?? "#454fda"}
      rotation={el.rotation}
    />
  );
}

export function Canvas({ projectId, elements }: { projectId: string; elements: any[] }) {
  const [tool, setTool] = useState<Tool>("hand");
  const [zoom, setZoom] = useState(100);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* ── Toolbar (unchanged from original) ── */}
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
            onClick={() => { setZoom(100); setOffset({ x: 0, y: 0 }); }}
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

      {/* ── Canvas area ── */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <Stage
              width={800}
              height={600}
              scaleX={zoom / 100}
              scaleY={zoom / 100}
              x={offset.x}
              y={offset.y}
              draggable={tool === "hand"}
              onDragEnd={(e) => setOffset({ x: e.target.x(), y: e.target.y() })}
              style={{ cursor: tool === "hand" ? "grab" : "default" }}
            >
              <Layer>
                {elements.map((el) => {
                  if (el.type === "image") return <CanvasImage key={el.id} el={el} />;
                  if (el.type === "text")  return <CanvasText  key={el.id} el={el} />;
                  if (el.type === "shape") return <CanvasShape key={el.id} el={el} />;
                  return null;
                })}
              </Layer>
            </Stage>
          </ContextMenu.Trigger>

          <ContextMenu.Portal>
            <ContextMenu.Content className="min-w-[200px] bg-popover border border-border rounded-lg shadow-lg p-1 z-50">
              <ContextMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center justify-between">
                Duplicate <span className="text-xs opacity-60">Ctrl+D</span>
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
                Bring to Front <span className="text-xs opacity-60">Ctrl+]</span>
              </ContextMenu.Item>
              <ContextMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                Bring Forward
              </ContextMenu.Item>
              <ContextMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                Send Backward
              </ContextMenu.Item>
              <ContextMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center justify-between">
                Send to Back <span className="text-xs opacity-60">Ctrl+[</span>
              </ContextMenu.Item>
              <ContextMenu.Separator className="h-px bg-border my-1" />
              <ContextMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-destructive hover:text-destructive-foreground cursor-pointer flex items-center justify-between">
                Delete <span className="text-xs opacity-60">Del</span>
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
      </div>
    </div>
  );
}