import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Canvas as FabricCanvas } from "fabric";

export type ShapeKind = "rectangle" | "rounded-rect" | "circle" | "line" | "arrow" | "triangle" | "star";

export interface Layer {
  id: string;
  name: string;
  type: "background" | "image" | "text" | "shape" | string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  src?: string;
  fileId?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  color?: string;
  shapeType?: string;
  fill?: string;
}

export interface Adjustments {
  highlights: number;
  contrast: number;
  colorBalance: number;
  light: number;
  shadow: number;
}

export type CanvasCommand =
  | { id: number; type: "add-text"; text: string; fontFamily: string; fontSize: number; fill: string; fontWeight: "normal" | "bold"; fontStyle: "normal" | "italic"; underline: boolean }
  | { id: number; type: "add-shape"; shape: ShapeKind, color: string }
  | { id: number; type: "add-image"; url: string; alt: string; objectId?: string; name?: string; fileId?: string; x?: number; y?: number; width?: number; height?: number }
  | { id: number; type: "create-empty-canvas" }
  | { id: number; type: "duplicate-selected" }
  | { id: number; type: "delete-selected" }
  | { id: number; type: "bring-forward" }
  | { id: number; type: "send-backward" }
  | { id: number; type: "undo" }
  | { id: number; type: "redo" }
  | { id: number; type: "restore-history"; index: number };

export type CanvasCommandInput = CanvasCommand extends infer T
  ? T extends { id: number }
    ? Omit<T, "id">
    : never
  : never;

export interface EditorStore {
  activeTool: "pointer" | "hand" | "draw" | "text";
  activePanel: "upload" | "resize" | "adjustments" | "filter" | "text" | "draw" | "shapes" | "templates" | null;

  zoom: number;
  offset: { x: number; y: number };

  layers: Layer[];
  selectedLayerId: string;

  history: string[];
  historyIndex: number;

  adjustments: Adjustments;

  brushColor: string;
  brushSize: number;
  brushOpacity: number;

  shapeColor: string;

  canvasSize: { w: number; h: number };
  canvasCommand: CanvasCommand | null;

  canvasJSON: null;

  canvasBackgroundColor: string;

  fabricCanvas: FabricCanvas | null;

  setFabricCanvas: (canvas: FabricCanvas | null) => void;

  resizeCanvas: (width: number, height: number) => void;

  setActiveTool: (tool: EditorStore["activeTool"]) => void;
  setActivePanel: (panel: EditorStore["activePanel"]) => void;

  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (zoom: number) => void;
  resetView: () => void;
  setOffset: (offset: { x: number; y: number }) => void;

  addLayer: () => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  moveLayer: (id: string, dir: "up" | "down") => void;
  setSelectedLayerId: (id: string) => void;
  setLayers: (layers: Layer[], selectedLayerId?: string) => void;

  pushHistory: (label: string) => void;
  setHistory: (history: string[], historyIndex: number) => void;

  setAdjustment: (key: keyof Adjustments, value: number) => void;
  resetAdjustments: () => void;

  setBrushColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setBrushOpacity: (opacity: number) => void;

  setShapeColor: (color: string) => void;

  setCanvasSize: (size: { w: number; h: number }) => void;
  addImageLayer: (layer: {
    id: string;
    type: "image";
    src: string;
    fileId?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    name?: string;
  }) => void;
  runCanvasCommand: (command: CanvasCommandInput) => void;
  consumeCanvasCommand: (id: number) => void;

  setCanvasJSON: (json: any) => void;
  setCanvasBackgroundColor: (color: string) => void;
}

const DEFAULT_ADJUSTMENTS: Adjustments = {
  highlights: 0,
  contrast: 0,
  colorBalance: 0,
  light: 0,
  shadow: 0,
};

let commandId = 0;

export const useEditorStore = create<EditorStore>()(
  devtools(
    (set, get) => ({
      activeTool: "pointer",
      activePanel: null,

      zoom: 100,
      offset: { x: 0, y: 0 },

      layers: [],
      selectedLayerId: "",

      history: ["Canvas Created"],
      historyIndex: 0,

      adjustments: { ...DEFAULT_ADJUSTMENTS },

      brushColor: "#2088b5",
      brushSize: 5,
      brushOpacity: 100,

      shapeColor: "#2088b5",
      
      canvasSize: { w: 800, h: 600 },
      canvasCommand: null,
      
      canvasJSON: null,
      canvasBackgroundColor: "#ffffff",
      
      fabricCanvas: null,

      
      setActiveTool: (tool) => set({ activeTool: tool }, false, "setActiveTool"),
      
      setActivePanel: (panel) =>
        set(
          (s) => ({ activePanel: s.activePanel === panel ? null : panel }),
          false,
          "setActivePanel"
        ),
        
  zoomIn: () => set((s) => ({ zoom: Math.min(400, s.zoom + 10) }), false, "zoomIn"),
  zoomOut: () => set((s) => ({ zoom: Math.max(10, s.zoom - 10) }), false, "zoomOut"),
  setZoom: (zoom) => set({ zoom }, false, "setZoom"),
  resetView: () => set({ zoom: 100, offset: { x: 0, y: 0 } }, false, "resetView"),
  setOffset: (offset) => set({ offset }, false, "setOffset"),
  
  addLayer: () => get().runCanvasCommand({ type: "add-shape", shape: "rectangle", color: {shapeColor} }),
  deleteLayer: (id) => {
    set({ selectedLayerId: id }, false, "selectLayerBeforeDelete");
    get().runCanvasCommand({ type: "delete-selected" });
  },
  duplicateLayer: (id) => {
    set({ selectedLayerId: id }, false, "selectLayerBeforeDuplicate");
    get().runCanvasCommand({ type: "duplicate-selected" });
  },
  updateLayer: (id, patch) =>
    set(
      (s) => ({ layers: s.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)) }),
      false,
      "updateLayer"
    ),
    moveLayer: (id, dir) => {
      set({ selectedLayerId: id }, false, "selectLayerBeforeMove");
      get().runCanvasCommand({ type: dir === "up" ? "bring-forward" : "send-backward" });
    },
    setSelectedLayerId: (id) => set({ selectedLayerId: id }, false, "setSelectedLayerId"),
    setLayers: (layers, selectedLayerId) =>
      set(
        (s) => ({
          layers,
          selectedLayerId:
          selectedLayerId ??
          (layers.some((l) => l.id === s.selectedLayerId)
          ? s.selectedLayerId
          : layers[layers.length - 1]?.id ?? ""),
        }),
        false,
        "setLayers"
      ),
      
      pushHistory: (label) =>
        set((s) => ({ history: [...s.history, label], historyIndex: s.history.length }), false, "pushHistory"),
      setHistory: (history, historyIndex) => set({ history, historyIndex }, false, "setHistory"),
      
      setAdjustment: (key, value) =>
        set((s) => ({ adjustments: { ...s.adjustments, [key]: value } }), false, "setAdjustment"),
      resetAdjustments: () => set({ adjustments: { ...DEFAULT_ADJUSTMENTS } }, false, "resetAdjustments"),
      
      setBrushColor: (brushColor) => set({ brushColor }, false, "setBrushColor"),
      setBrushSize: (brushSize) => set({ brushSize }, false, "setBrushSize"),
      setBrushOpacity: (brushOpacity) => set({ brushOpacity }, false, "setBrushOpacity"),
      
      setShapeColor: (shapeColor) => set({shapeColor}, false,"setShapeColor"),

      setCanvasSize: (canvasSize) => set({ canvasSize }, false, "setCanvasSize"),
      resizeCanvas: (width, height) => set({ canvasSize: { w: width, h: height } }, false, "resizeCanvas"),
      addImageLayer: (layer) =>
        get().runCanvasCommand({
          type: "add-image",
          url: layer.src,
          alt: layer.name || "Image Layer",
          objectId: layer.id,
          name: layer.name || "Image Layer",
          fileId: layer.fileId,
          x: layer.x,
          y: layer.y,
          width: layer.width,
          height: layer.height,
        }),
      runCanvasCommand: (command) =>
        set({ canvasCommand: { ...command, id: ++commandId } as CanvasCommand }, false, "runCanvasCommand"),
      consumeCanvasCommand: (id) =>
        set((s) => ({ canvasCommand: s.canvasCommand?.id === id ? null : s.canvasCommand }), false, "consumeCanvasCommand"),
      setCanvasJSON: (json) =>
        set({ canvasJSON: json }, false, "setCanvasJSON"),
      setFabricCanvas: (canvas) =>
        set({ fabricCanvas: canvas }, false, "setFabricCanvas"),
      setCanvasBackgroundColor: (color) =>
        set({ canvasBackgroundColor: color }, false, "setCanvasBackgroundColor"),
    }),
    { name: "EditorStore" }
  )
);

export const useSelectedLayer = () =>
  useEditorStore((s) => s.layers.find((l) => l.id === s.selectedLayerId));

export const useIsLayerLocked = () => {
  const sel = useSelectedLayer();
  return sel?.locked ?? false;
};
