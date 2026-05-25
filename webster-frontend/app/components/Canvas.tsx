import { useCallback, useEffect, useRef, useState } from "react";
import { Hand, MousePointer2, ZoomIn, ZoomOut, RotateCcw, Undo2, Redo2 } from "lucide-react";
import {
  Canvas as FabricCanvas,
  Circle, FabricImage,
  FabricObject,
  FabricText,
  IText, Line,
  CircleBrush, Path, PencilBrush,
  Polygon, SprayBrush,
  Rect, Triangle,
} from "fabric";
import { useEditorStore } from "../store/editorStore";
import type { CanvasCommand, Layer, ShapeKind } from "../store/editorStore";
import { useParams } from "react-router-dom";

type EngineObject = FabricObject & {
  id?: string;
  name?: string;
  fileId?: string;
  imageUrl?: string;
  locked?: boolean;
};
type Snapshot = { label: string; size: { w: number; h: number }; json: Record<string, unknown> };

const FABRIC_PROPS = ["id", "name", "fileId", "imageUrl", "locked", "globalCompositeOperation"];

const API = import.meta.env.VITE_API;

export function Canvas() {
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const snapshotsRef = useRef<Snapshot[]>([]);
  const historyIndexRef = useRef(0);
  const isRestoringRef = useRef(false);
  const hydratingIdsRef = useRef<Set<string>>(new Set());

  const activeTool = useEditorStore((s) => s.activeTool);
  const zoom = useEditorStore((s) => s.zoom);
  const offset = useEditorStore((s) => s.offset);
  const brushColor = useEditorStore((s) => s.brushColor);
  const shapeColor = useEditorStore((s) => s.shapeColor); 
  const brushSize = useEditorStore((s) => s.brushSize);
  const brushOpacity = useEditorStore((s) => s.brushOpacity);
  const brushMode = useEditorStore((s) => s.brushMode);
  const canvasSize = useEditorStore((s) => s.canvasSize);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const layers = useEditorStore((s) => s.layers);
  const command = useEditorStore((s) => s.canvasCommand);
  const canvasJSON = useEditorStore((s) => s.canvasJSON);
  const canvasBackgroundColor = useEditorStore((s) => s.canvasBackgroundColor);

  const zoomIn = useEditorStore((s) => s.zoomIn);
  const zoomOut = useEditorStore((s) => s.zoomOut);
  const resetView = useEditorStore((s) => s.resetView);
  const setOffset = useEditorStore((s) => s.setOffset);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const setLayers = useEditorStore((s) => s.setLayers);
  const setCanvasSize = useEditorStore((s) => s.setCanvasSize);
  const setHistory = useEditorStore((s) => s.setHistory);
  const runCanvasCommand = useEditorStore((s) => s.runCanvasCommand);
  const consumeCanvasCommand = useEditorStore((s) => s.consumeCanvasCommand);
  const setFabricCanvas = useEditorStore((s) => s.setFabricCanvas);
  

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showCtxMenu, setShowCtxMenu] = useState(false);
  const [ctxPos, setCtxPos] = useState({ x: 0, y: 0 });  

  useEffect(() => {
    const element = canvasElementRef.current;
    if (!element || fabricRef.current) return;

    const canvas = new FabricCanvas(element, {
      width: canvasSize.w,
      height: canvasSize.h,
      backgroundColor: canvasBackgroundColor,
      preserveObjectStacking: true,
      selection: true,
    });

    setFabricCanvas(canvas);

    fabricRef.current = canvas;

    // const json = canvasJSON;
    // if (json) {
    //   canvas.loadFromJSON(json, () => {
    //     canvas.backgroundColor = canvasBackgroundColor;
    //     canvas.requestRenderAll();
    //   });
    // }

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);


  const syncLayers = useCallback((selectedId?: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const nextLayers: Layer[] = canvas.getObjects().map((object, index) => {
      const item = object as EngineObject;
      const id = ensureObjectId(item);
      const name = item.name || nameForObject(item, index + 1);
      const locked = Boolean(item.locked) || object.selectable === false;
      item.name = name;
      item.locked = locked;

      const layerType = normalizeLayerType(object);
      const textObject = object instanceof FabricText ? object : undefined;

      return {
        id,
        name,
        type: layerType,
        visible: object.visible !== false,
        locked,
        opacity: Math.round((object.opacity ?? 1) * 100),
        blendMode: compositeToBlendMode(object.globalCompositeOperation),
        src: item.imageUrl,
        fileId: item.fileId,
        x: Math.round(object.left ?? 0),
        y: Math.round(object.top ?? 0),
        width: Math.round(object.getScaledWidth?.() ?? object.width ?? 0),
        height: Math.round(object.getScaledHeight?.() ?? object.height ?? 0),
        text: textObject?.text,
        fontSize: textObject?.fontSize ? Math.round(textObject.fontSize) : undefined,
        color: typeof textObject?.fill === "string" ? textObject.fill : undefined,
      };
    });

    const activeId = selectedId ?? ((canvas.getActiveObject() as EngineObject | undefined)?.id);
    setLayers(nextLayers, activeId);
  }, [setLayers]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !canvasJSON || Array.isArray(canvasJSON) || !canvasJSON.objects) return;

    let cancelled = false;

    const loadProjectCanvas = async () => {
      isRestoringRef.current = true;
      try {
        await canvas.loadFromJSON(canvasJSON);
        if (cancelled) return;

        canvas.backgroundColor = canvasBackgroundColor;
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        syncLayers();

        const initialSnapshot: Snapshot = {
          label: "Project Loaded",
          size: { w: canvas.getWidth(), h: canvas.getHeight() },
          json: canvas.toObject(FABRIC_PROPS),
        };
        snapshotsRef.current = [initialSnapshot];
        historyIndexRef.current = 0;
        setHistory([initialSnapshot.label], 0);
      } finally {
        if (!cancelled) isRestoringRef.current = false;
      }
    };

    void loadProjectCanvas().catch(console.error);

    return () => {
      cancelled = true;
      isRestoringRef.current = false;
    };
  }, [canvasJSON, canvasBackgroundColor, setHistory, syncLayers]);

  const { projectId } = useParams();

  const saveProject = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas || !projectId) return;

    const payload = {
      canvas: {
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        background: canvas.backgroundColor,
      },
      objects: canvas.toObject(FABRIC_PROPS),
    };

    const thumbnail = canvas.toDataURL({
      format: "png",
      multiplier: 0.2,
    });

    await fetch(`${API}/projects/${projectId}/save`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        projectState: payload,
        isAutoSave: true,
        thumbnail,
      }),
    });
  }, [projectId]);

  const recordSnapshot = useCallback((label: string) => {
    const canvas = fabricRef.current;
    if (!canvas || isRestoringRef.current) return;

    const snapshot: Snapshot = {
      label,
      size: { w: canvas.getWidth(), h: canvas.getHeight() },
      json: canvas.toObject(FABRIC_PROPS),
    };

    const next = snapshotsRef.current.slice(0, historyIndexRef.current + 1);
    next.push(snapshot);
    snapshotsRef.current = next;
    historyIndexRef.current = next.length - 1;
    setHistory(next.map((item) => item.label), historyIndexRef.current);
    syncLayers();
    isDirtyRef.current = true;
  }, [setHistory, syncLayers]);

  const isDirtyRef = useRef(false);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const markAndSync = (event?: unknown) => {
      normalizeTextScale((event as { target?: FabricObject } | undefined)?.target);
      if (!isRestoringRef.current) isDirtyRef.current = true;
      syncLayers();
    };

    const syncSelection = () => syncLayers();

    const handlePathCreated = (event: unknown) => {
      const path = (event as { path?: EngineObject }).path;
      if (path) {
        ensureObjectId(path);
        path.name = path.name || "Drawing";
      }
      markAndSync();
      recordSnapshot("Draw");
    };

    canvas.on("object:modified", markAndSync);
    canvas.on("object:added", markAndSync);
    canvas.on("object:removed", markAndSync);
    canvas.on("selection:created", syncSelection);
    canvas.on("selection:updated", syncSelection);
    canvas.on("selection:cleared", syncSelection);
    canvas.on("path:created", handlePathCreated);

    return () => {
      canvas.off("object:modified", markAndSync);
      canvas.off("object:added", markAndSync);
      canvas.off("object:removed", markAndSync);
      canvas.off("selection:created", syncSelection);
      canvas.off("selection:updated", syncSelection);
      canvas.off("selection:cleared", syncSelection);
      canvas.off("path:created", handlePathCreated);
    };
  }, [recordSnapshot, syncLayers]);

  useEffect(() => {
    if (!projectId) return;

    const interval = setInterval(() => {
      if (!isDirtyRef.current) return;

      isDirtyRef.current = false;
      void saveProject();
    }, 1500);

    return () => clearInterval(interval);
  }, [projectId, saveProject]);

  const restoreSnapshot = useCallback(async (index: number) => {
    const canvas = fabricRef.current;
    const snapshot = snapshotsRef.current[index];
    if (!canvas || !snapshot) return;

    isRestoringRef.current = true;
    canvas.setDimensions(toFabricSize(snapshot.size));
    setCanvasSize(snapshot.size);
    await canvas.loadFromJSON(snapshot.json);
    canvas.backgroundColor = canvasBackgroundColor;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    historyIndexRef.current = index;
    setHistory(snapshotsRef.current.map((item) => item.label), index);
    syncLayers();
    isRestoringRef.current = false;
  }, [setCanvasSize, setHistory, syncLayers]);

  const addObject = useCallback((object: EngineObject, label: string, options: { record?: boolean; objectId?: string; name?: string } = {}) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    ensureObjectId(object, options.objectId);
    object.name = options.name || object.name || label;
    object.set({
      left: object.left ?? 120,
      top: object.top ?? 100,
      cornerColor: "#5de4fc",
      borderColor: "#66e4fa",
      transparentCorners: false,
    });

    canvas.add(object);
    canvas.setActiveObject(object);
    canvas.requestRenderAll();
    syncLayers(object.id);
    if (options.record !== false) recordSnapshot(label);
  }, [recordSnapshot, syncLayers]);

  const executeCommand = useCallback(async (nextCommand: CanvasCommand) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    switch (nextCommand.type) {
      case "add-text": {
        await ensureFont(nextCommand.fontFamily);
        addObject(new IText(nextCommand.text || "Double click to edit", {
          left: 120,
          top: 120,
          fill: nextCommand.fill,
          fontFamily: nextCommand.fontFamily,
          fontSize: nextCommand.fontSize,
          fontWeight: nextCommand.fontWeight,
          fontStyle: nextCommand.fontStyle,
          underline: nextCommand.underline,
        }) as EngineObject, "Add Text");
        break;
      }
      case "add-shape":
        addObject(createShape(nextCommand.shape, shapeColor) as EngineObject, "Add " + labelForShape(nextCommand.shape));
        break;
      case "add-image": {
        try {
          const image = await FabricImage.fromURL(nextCommand.url, { crossOrigin: "anonymous" });
          const object = image as EngineObject;
          object.imageUrl = nextCommand.url;
          object.fileId = nextCommand.fileId;
          object.set({ left: nextCommand.x ?? 120, top: nextCommand.y ?? 100 });
          if (nextCommand.width && nextCommand.height && image.width && image.height) {
            object.set({ scaleX: nextCommand.width / image.width, scaleY: nextCommand.height / image.height });
          } else {
            image.scaleToWidth(360);
          }
          addObject(object, "Add image: " + nextCommand.alt, {
            objectId: nextCommand.objectId,
            name: nextCommand.name || nextCommand.alt || "Image Layer",
          });
        } catch {
          recordSnapshot("Image failed to load");
        }
        break;
      }
      case "create-empty-canvas":
        canvas.clear();
        canvas.backgroundColor = canvasBackgroundColor;
        canvas.requestRenderAll();
        recordSnapshot("Create Empty Canvas");
        break;
      case "duplicate-selected":
        await duplicateSelected(canvas, addObject);
        break;
      case "delete-selected": {
        const active = canvas.getActiveObject();
        if (active) {
          canvas.remove(active);
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          recordSnapshot("Delete");
        }
        break;
      }
      case "bring-forward": {
        const active = canvas.getActiveObject();
        if (active) {
          canvas.bringObjectForward(active);
          canvas.requestRenderAll();
          recordSnapshot("Bring Forward");
        }
        break;
      }
      case "send-backward": {
        const active = canvas.getActiveObject();
        if (active) {
          canvas.sendObjectBackwards(active);
          canvas.requestRenderAll();
          recordSnapshot("Send Backward");
        }
        break;
      }
      case "undo":
        await restoreSnapshot(Math.max(0, historyIndexRef.current - 1));
        break;
      case "redo":
        await restoreSnapshot(Math.min(snapshotsRef.current.length - 1, historyIndexRef.current + 1));
        break;
      case "restore-history":
        await restoreSnapshot(nextCommand.index);
        break;
    }
  }, [addObject, shapeColor, recordSnapshot, restoreSnapshot]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === "draw";
    canvas.selection = activeTool === "pointer";
    canvas.skipTargetFind = activeTool === "hand" || activeTool === "draw";

    canvas.getObjects().forEach((object) => {
      const locked = (object as EngineObject).locked === true || object.selectable === false;
      object.evented = activeTool === "pointer" && !locked;
    });

    if (activeTool === "draw") {
      canvas.freeDrawingBrush = createBrush(canvas, brushMode, brushColor, brushSize, brushOpacity);
    }

    canvas.requestRenderAll();
  }, [activeTool, brushColor, brushMode, brushOpacity, brushSize]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || (canvas.getWidth() === canvasSize.w && canvas.getHeight() === canvasSize.h)) return;
    canvas.setDimensions(toFabricSize(canvasSize));
    canvas.requestRenderAll();
    recordSnapshot("Resize Canvas");
  }, [canvasSize, recordSnapshot]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const existingIds = new Set(canvas.getObjects().map((object) => (object as EngineObject).id).filter(Boolean));
    const missingImageLayers = layers.filter((layer) => layer.type === "image" && layer.src && !existingIds.has(layer.id));
    if (missingImageLayers.length === 0) return;

    let cancelled = false;
    const hydrate = async () => {
      for (const layer of missingImageLayers) {
        if (cancelled || hydratingIdsRef.current.has(layer.id)) continue;
        hydratingIdsRef.current.add(layer.id);
        try {
          const image = await FabricImage.fromURL(layer.src!, { crossOrigin: "anonymous" });
          const object = image as EngineObject;
          object.imageUrl = layer.src;
          object.fileId = layer.fileId;
          object.set({ left: layer.x ?? 100, top: layer.y ?? 100 });
          if (layer.width && layer.height && image.width && image.height) {
            object.set({ scaleX: layer.width / image.width, scaleY: layer.height / image.height });
          } else {
            image.scaleToWidth(360);
          }
          addObject(object, layer.name || "Image Layer", { record: false, objectId: layer.id, name: layer.name });
        } finally {
          hydratingIdsRef.current.delete(layer.id);
        }
      }
      if (!cancelled) recordSnapshot("Load Project Layers");
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [addObject, layers, recordSnapshot]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    let changedByLayerPanel = false;

    const active = canvas.getActiveObject() as EngineObject | undefined;
    if (selectedLayerId && active?.id !== selectedLayerId) {
      const target = canvas.getObjects().find((object) => (object as EngineObject).id === selectedLayerId);
      if (target) canvas.setActiveObject(target);
    }

    canvas.getObjects().forEach((object) => {
      const item = object as EngineObject;
      const layer = layers.find((candidate) => candidate.id === item.id);
      if (!layer) return;

      const nextVisible = layer.visible !== false;
      const nextLocked = Boolean(layer.locked);
      const nextOpacity = Math.max(0, Math.min(100, layer.opacity ?? 100)) / 100;
      const nextComposite = blendModeToComposite(layer.blendMode);

      if (object.visible !== nextVisible) changedByLayerPanel = true;
      if (item.locked !== nextLocked) changedByLayerPanel = true;
      if (Math.round((object.opacity ?? 1) * 100) !== Math.round(nextOpacity * 100)) changedByLayerPanel = true;
      if ((item.name || "") !== layer.name) changedByLayerPanel = true;
      if ((object.globalCompositeOperation || "source-over") !== nextComposite) changedByLayerPanel = true;

      object.set({
        visible: nextVisible,
        selectable: !nextLocked,
        evented: !nextLocked && activeTool === "pointer",
        opacity: nextOpacity,
        globalCompositeOperation: nextComposite,
      });
      object.lockMovementX = nextLocked;
      object.lockMovementY = nextLocked;
      object.lockScalingX = nextLocked;
      object.lockScalingY = nextLocked;
      object.lockRotation = nextLocked;
      item.locked = nextLocked;
      item.name = layer.name;
    });

    if (changedByLayerPanel && !isRestoringRef.current) isDirtyRef.current = true;
    canvas.requestRenderAll();
  }, [activeTool, layers, selectedLayerId]);

  useEffect(() => {
    if (!command) return;
    void executeCommand(command).finally(() => consumeCanvasCommand(command.id));
  }, [command, consumeCanvasCommand, executeCommand]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const active = canvas.getActiveObject();
      const isEditingText = active instanceof FabricText && Boolean((active as FabricText & { isEditing?: boolean }).isEditing);
      if (isEditingText) return;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        runCanvasCommand({ type: event.shiftKey ? "redo" : "undo" });
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        runCanvasCommand({ type: "redo" });
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && active) {
        event.preventDefault();
        runCanvasCommand({ type: "delete-selected" });
        return;
      }

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key) && active) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        active.set({
          left: (active.left ?? 0) + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0),
          top: (active.top ?? 0) + (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0),
        });
        active.setCoords();
        canvas.requestRenderAll();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        recordSnapshot("Move Object");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [recordSnapshot, runCanvasCommand]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button === 2) return;
    setShowCtxMenu(false);

    if (activeTool === "hand") {
      setIsPanning(true);
      setPanStart({ x: event.clientX - offset.x, y: event.clientY - offset.y });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning && activeTool === "hand") {
      setOffset({ x: event.clientX - panStart.x, y: event.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setCtxPos({ x: event.clientX, y: event.clientY });
    setShowCtxMenu(true);
  };

  const cursor = activeTool === "hand" ? (isPanning ? "grabbing" : "grab") : activeTool === "draw" ? "crosshair" : "default";
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
// render
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--background)", overflow: "hidden", position: "relative" }}>
      <div style={{
        height: 41,
        background: "var(--accent-forground)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 4 }}>
          {([
            { id: "pointer" as const, Icon: MousePointer2, title: "Select" },
            { id: "hand" as const, Icon: Hand, title: "Pan" },
          ]).map(({ id, Icon, title }) => (
            <button key={id} title={title} onClick={() => setActiveTool(id)} style={{
              padding: 6,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              background: activeTool === id ? "var(--accent)" : "var(--secondary)",
              color: activeTool === id ? "var(--accent-foreground)" : "var(--secondary-foreground)",
            }}>
              <Icon size={15} />
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => runCanvasCommand({ type: "undo" })} style={iconBtnStyle} title="Undo"><Undo2 size={14} /></button>
          <button onClick={() => runCanvasCommand({ type: "redo" })} style={iconBtnStyle} title="Redo"><Redo2 size={14} /></button>
          <button onClick={zoomOut} style={iconBtnStyle} title="Zoom out"><ZoomOut size={14} /></button>
          <span style={{ fontSize: 12, color: "var(--muted-foreground)", minWidth: 44, textAlign: "center" }}>{zoom}%</span>
          <button onClick={zoomIn} style={iconBtnStyle} title="Zoom in"><ZoomIn size={14} /></button>
          <button onClick={resetView} style={iconBtnStyle} title="Reset view"><RotateCcw size={14} /></button>
        </div>

        <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          {selectedLayer ? selectedLayer.name + (selectedLayer.locked ? " locked" : "") : "No selection"}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }} onClick={() => setShowCtxMenu(false)}>
        <div
          style={{
            transform: "translate(" + offset.x + "px, " + offset.y + "px) scale(" + zoom / 100 + ")",
            transformOrigin: "center",
            cursor,
            boxShadow: "0 8px 40px rgba(29, 30, 30, 0.6)",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={handleContextMenu}
        >
          <canvas ref={canvasElementRef} style={{ display: "block" }} />
        </div>
      </div>

      {showCtxMenu && (
        <div style={{
          position: "fixed",
          left: ctxPos.x,
          top: ctxPos.y,
          zIndex: 100,
          background: "var(--popover)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 4,
          minWidth: 180,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
        }}>
          {([
            ["Duplicate", "Ctrl+D", () => runCanvasCommand({ type: "duplicate-selected" })],
            null,
            ["Bring Forward", "Ctrl+]", () => runCanvasCommand({ type: "bring-forward" })],
            ["Send Backward", "Ctrl+[", () => runCanvasCommand({ type: "send-backward" })],
            null,
            ["Delete", "Del", () => runCanvasCommand({ type: "delete-selected" })],
          ] as ([string, string, () => void] | null)[]).map((item, i) =>
            item === null ? (
              <div key={i} style={{ height: 1, background: "var(--border)", margin: "3px 0" }} />
            ) : (
              <button key={i} onClick={() => { item[2](); setShowCtxMenu(false); }} style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                background: "none",
                border: "none",
                color: item[0] === "Delete" ? "var(--destructive)" : "var(--foreground)",
                padding: "7px 10px",
                borderRadius: 5,
                cursor: "pointer",
                fontSize: 12,
              }}>
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

function toFabricSize(size: { w: number; h: number }) {
  return { width: size.w, height: size.h };
}

function normalizeLayerType(object: FabricObject): Layer["type"] {
  if (object.type === "image") return "image";
  if (object.type === "i-text" || object.type === "text" || object.type === "textbox") return "text";
  if (object.type === "path") return "shape";
  return "shape";
}

function normalizeTextScale(object?: FabricObject) {
  if (!(object instanceof FabricText)) return;

  const scaleX = object.scaleX ?? 1;
  const scaleY = object.scaleY ?? 1;
  if (Math.abs(scaleX - 1) < 0.001 && Math.abs(scaleY - 1) < 0.001) return;

  const textObject = object as FabricText & { fontSize?: number; width?: number };
  const currentFontSize = Number(textObject.fontSize) || 16;
  const fontScale = object.type === "textbox"
    ? Math.abs(scaleY || 1)
    : Math.max(Math.abs(scaleX || 1), Math.abs(scaleY || 1));
  const nextFontSize = Math.max(1, Math.round(currentFontSize * fontScale));
  const nextWidth = object.type === "textbox" && textObject.width
    ? Math.max(1, textObject.width * Math.abs(scaleX || 1))
    : textObject.width;

  object.set({
    fontSize: nextFontSize,
    scaleX: 1,
    scaleY: 1,
    ...(nextWidth ? { width: nextWidth } : {}),
  });
  object.setCoords();
}

function blendModeToComposite(mode?: string) {
  const normalized = (mode || "Normal").trim().toLowerCase().replace(/\s+/g, "-");
  return normalized === "normal" ? "source-over" : normalized;
}

function compositeToBlendMode(mode?: string) {
  if (!mode || mode === "source-over") return "Normal";
  return mode.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function createShape(shape: ShapeKind, color: string): FabricObject {
  const common = {
    left: 140,
    top: 120,
    fill: withOpacity(color, 80),
    stroke: color,
    strokeWidth: 2,
  };

  if (shape === "rectangle") return new Rect({ ...common, width: 180, height: 110 });
  if (shape === "rounded-rect") return new Rect({ ...common, width: 180, height: 110, rx: 16, ry: 16 });
  if (shape === "circle") return new Circle({ ...common, radius: 62 });
  if (shape === "line") return new Line([0, 0, 180, 0], { left: 140, top: 160, stroke: color, strokeWidth: 6 });
  if (shape === "arrow") return new Path("M 0 25 L 160 25 M 128 2 L 160 25 L 128 48", { left: 140, top: 140, fill: "", stroke: color, strokeWidth: 6, strokeLineCap: "round", strokeLineJoin: "round" });
  if (shape === "triangle") return new Triangle({ ...common, width: 150, height: 130 });

  return new Polygon(starPoints(75, 34, 5), { ...common, left: 150, top: 110 });
}

async function duplicateSelected(canvas: FabricCanvas, addObject: (object: EngineObject, label: string) => void) {
  const active = canvas.getActiveObject() as EngineObject | undefined;
  if (!active) return;
  const clone = await active.clone(FABRIC_PROPS) as EngineObject;
  clone.set({ left: (active.left ?? 0) + 24, top: (active.top ?? 0) + 24 });
  clone.id = undefined;
  clone.name = (active.name || "Layer") + " Copy";
  addObject(clone, "Duplicate");
}

function ensureObjectId(object: EngineObject, preferredId?: string) {
  if (!object.id) object.id = preferredId || "obj-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  return object.id;
}

function nameForObject(object: EngineObject, index: number) {
  const type = object.type || "Object";
  return type.charAt(0).toUpperCase() + type.slice(1) + " " + index;
}

function labelForShape(shape: ShapeKind) {
  return shape.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function starPoints(outer: number, inner: number, points: number) {
  const result: { x: number; y: number }[] = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = Math.PI / points * i - Math.PI / 2;
    result.push({ x: Math.cos(angle) * radius + outer, y: Math.sin(angle) * radius + outer });
  }
  return result;
}

function createBrush(canvas: FabricCanvas, mode: string, color: string, size: number, opacity: number) {
  if (mode === "spray") {
    const brush = new SprayBrush(canvas);
    brush.color = withOpacity(color, opacity);
    brush.width = Math.max(8, size);
    brush.density = Math.max(8, Math.round(size * 1.2));
    return brush;
  }

  if (mode === "dots") {
    const brush = new CircleBrush(canvas);
    brush.color = withOpacity(color, opacity);
    brush.width = Math.max(4, size);
    return brush;
  }

  const brush = new PencilBrush(canvas);
  const modeOpacity = mode === "highlighter" ? Math.min(opacity, 35) : mode === "marker" ? Math.min(100, Math.max(opacity, 75)) : opacity;
  const modeWidth = mode === "marker" ? Math.max(size, 12) : mode === "highlighter" ? Math.max(size, 18) : size;
  brush.color = withOpacity(color, modeOpacity);
  brush.width = modeWidth;
  return brush;
}

function withOpacity(hex: string, opacity: number) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean;
  const int = Number.parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return "rgba(" + r + ", " + g + ", " + b + ", " + opacity / 100 + ")";
}

async function ensureFont(family: string) {
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

const iconBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--border)",
  color: "var(--muted-foreground)",
  borderRadius: "var(--radius)",
  padding: 5,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};
