/**
 * ZUSTAND STORE – WIE FUNKTIONIERT DAS?
 * ─────────────────────────────────────
 * Ein Store ist wie ein globales "Gedächtnis" für deine App.
 * Statt useState() in jeder Komponente zu haben, gibt es EINEN
 * zentralen Ort wo alle Daten leben.
 *
 * Jede Komponente kann:
 *   1. Daten LESEN  → useEditorStore(s => s.zoom)
 *   2. Daten ÄNDERN → useEditorStore(s => s.zoomIn)
 *
 * Wenn sich ein Wert ändert, re-rendert NUR die Komponente
 * die diesen Wert abonniert hat – nicht der ganze Baum.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";

// ─── TypeScript Typen ────────────────────────────────────────────────────────
// Typen sind Schablonen – sie sagen TypeScript welche Form ein Objekt hat.
// Wenn du später einen Tippfehler machst, zeigt TypeScript einen Fehler.

// export interface Layer {
//   id: string;
//   name: string;
//   visible: boolean;
//   locked: boolean;
//   opacity: number;        // 0–100
//   blendMode: string;
// }

type BaseLayer = {
  id: string;
  type: "background" | "image" | "text" | "shape";
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
};

type ImageLayer = BaseLayer & {
  type: "image";
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface Adjustments {
  highlights: number;     // -100 bis 100
  contrast: number;
  colorBalance: number;
  light: number;
  shadow: number;
}

// Das ist der "Bauplan" des gesamten Stores.
// State = Daten, Actions = Funktionen die Daten ändern
export interface EditorStore {
  // ── STATE (die eigentlichen Daten) ──────────────────────────────────────

  activeTool: "pointer" | "hand" | "draw" | "text";
  activePanel: "upload" | "resize" | "adjustments" | "filter" | "text" | "draw" | "shapes" | "templates" | null;

  zoom: number;
  offset: { x: number; y: number };

  // layers: Layer[];
  layers: (BaseLayer | ImageLayer)[];
  selectedLayerId: string;

  history: string[];

  adjustments: Adjustments;

  brushColor: string;
  brushSize: number;
  brushOpacity: number;

  canvasSize: { w: number; h: number };

  // ── ACTIONS (Funktionen die State ändern) ───────────────────────────────
  // Naming-Convention: Verben wie set..., add..., delete..., toggle...

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
  updateLayer: (
    id: string,
    patch: Partial<BaseLayer | ImageLayer>
  ) => void;
  moveLayer: (id: string, dir: "up" | "down") => void;
  setSelectedLayerId: (id: string) => void;

  pushHistory: (label: string) => void;

  setAdjustment: (key: keyof Adjustments, value: number) => void;
  resetAdjustments: () => void;

  setBrushColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setBrushOpacity: (opacity: number) => void;

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
  }) => void;

  setLayers: (layers: (BaseLayer | ImageLayer)[]) => void;
}

// ─── Default Werte ───────────────────────────────────────────────────────────
const DEFAULT_ADJUSTMENTS: Adjustments = {
  highlights: 0,
  contrast: 0,
  colorBalance: 0,
  light: 0,
  shadow: 0,
};

// ─── Store erstellen ─────────────────────────────────────────────────────────
/**
 * create() nimmt eine Funktion die (set, get) bekommt:
 *   set() → ändert den State (nur die Felder die du angibst)
 *   get() → liest den aktuellen State innerhalb von Actions
 *
 * devtools() wrapper = du siehst alle State-Änderungen
 * in den Redux DevTools im Browser (Chrome Extension).
 */
export const useEditorStore = create<EditorStore>()(
  devtools(
    (set, get) => ({
      // ── Startwerte ──────────────────────────────────────────────────────

      activeTool: "pointer",
      activePanel: null,

      zoom: 100,
      offset: { x: 0, y: 0 },

      // layers: [
      //   { id: "bg", name: "Background", visible: true, locked: false, opacity: 100, blendMode: "Normal" },
      //   { id: "l1", name: "Layer 1",    visible: true, locked: false, opacity: 100, blendMode: "Normal" },
      // ],
      layers: [],
      // selectedLayerId: "bg",
      selectedLayerId: "",

      history: ["Canvas Created"],

      adjustments: { ...DEFAULT_ADJUSTMENTS },

      brushColor: "#454fda",
      brushSize: 5,
      brushOpacity: 100,

      canvasSize: { w: 800, h: 600 },

      // ── Tool & Panel ────────────────────────────────────────────────────

      setActiveTool: (tool) => set({ activeTool: tool }, false, "setActiveTool"),

      // Wenn du dasselbe Panel nochmal klickst → schließen (toggle)
      setActivePanel: (panel) =>
        set(
          (s) => ({ activePanel: s.activePanel === panel ? null : panel }),
          false,
          "setActivePanel"
        ),

      // ── Zoom & Pan ──────────────────────────────────────────────────────
      // set(s => ...) gibt dir den aktuellen State als 's'
      // so kannst du auf den alten Wert zugreifen und ihn verändern

      zoomIn:  () => set((s) => ({ zoom: Math.min(400, s.zoom + 10) }), false, "zoomIn"),
      zoomOut: () => set((s) => ({ zoom: Math.max(10,  s.zoom - 10) }), false, "zoomOut"),
      setZoom: (zoom) => set({ zoom }, false, "setZoom"),
      resetView: () => set({ zoom: 100, offset: { x: 0, y: 0 } }, false, "resetView"),
      setOffset: (offset) => set({ offset }, false, "setOffset"),

      // ── Layer Actions ───────────────────────────────────────────────────

      addLayer: () => {
        // get() holt den aktuellen State INNERHALB einer Action
        const { layers, pushHistory } = get();
        const newId = `l${Date.now()}`;
        const num = layers.length + 1;
        set(
          {
            layers: [
              ...layers,
              { id: newId, name: `Layer ${num}`, visible: true, locked: false, opacity: 100, blendMode: "Normal" },
            ],
            selectedLayerId: newId,
          },
          false,
          "addLayer"
        );
        pushHistory(`Add Layer ${num}`);
      },

      deleteLayer: (id) => {
        const { layers, selectedLayerId, pushHistory } = get();
        if (layers.length <= 1) return; // mind. 1 Layer immer behalten
        const fallback = layers.find((l) => l.id !== id)!.id;
        set(
          {
            layers: layers.filter((l) => l.id !== id),
            // wenn der gelöschte Layer gerade selektiert war → anderen nehmen
            selectedLayerId: selectedLayerId === id ? fallback : selectedLayerId,
          },
          false,
          "deleteLayer"
        );
        pushHistory("Delete Layer");
      },

      duplicateLayer: (id) => {
        const { layers, pushHistory } = get();
        const src = layers.find((l) => l.id === id);
        if (!src) return;
        const newId = `l${Date.now()}`;
        const idx = layers.findIndex((l) => l.id === id);
        const next = [...layers];
        // splice(position, deleteCount, newItem) → einfügen nach dem Original
        next.splice(idx + 1, 0, { ...src, id: newId, name: `${src.name} Copy` });
        set({ layers: next, selectedLayerId: newId }, false, "duplicateLayer");
        pushHistory(`Duplicate ${src.name}`);
      },

      // Partial<Layer> = nicht alle Felder nötig, nur was du ändern willst
      updateLayer: (id, patch) =>
        set(
          (s) => ({ layers: s.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)) }),
          false,
          "updateLayer"
        ),

      setLayers: (layers) =>
        set(
          {
            layers,
            selectedLayerId: layers.length ? layers[0].id : "",
          },
          false,
          "setLayers"
        ),

      moveLayer: (id, dir) => {
        const { layers } = get();
        const idx = layers.findIndex((l) => l.id === id);
        const target = dir === "up" ? idx + 1 : idx - 1;
        if (target < 0 || target >= layers.length) return;
        const next = [...layers];
        [next[idx], next[target]] = [next[target], next[idx]];
        set({ layers: next }, false, "moveLayer");
      },

      setSelectedLayerId: (id) => set({ selectedLayerId: id }, false, "setSelectedLayerId"),

      // ── History ─────────────────────────────────────────────────────────

      pushHistory: (label) =>
        set((s) => ({ history: [...s.history, label] }), false, "pushHistory"),

      // ── Adjustments ─────────────────────────────────────────────────────
      // Ein einzelnes Adjustment-Feld ändern ohne die anderen zu überschreiben

      setAdjustment: (key, value) =>
        set(
          (s) => ({ adjustments: { ...s.adjustments, [key]: value } }),
          false,
          "setAdjustment"
        ),

      resetAdjustments: () =>
        set({ adjustments: { ...DEFAULT_ADJUSTMENTS } }, false, "resetAdjustments"),

      // ── Brush ───────────────────────────────────────────────────────────

      setBrushColor:   (brushColor)   => set({ brushColor },   false, "setBrushColor"),
      setBrushSize:    (brushSize)    => set({ brushSize },    false, "setBrushSize"),
      setBrushOpacity: (brushOpacity) => set({ brushOpacity }, false, "setBrushOpacity"),

      // ── Canvas ──────────────────────────────────────────────────────────

      setCanvasSize: (canvasSize) => set({ canvasSize }, false, "setCanvasSize"),

      addImageLayer: (layer) =>
        set(
          (state) => ({
          layers: [
            ...state.layers,
            {
              name: "Image Layer",
              visible: true,
              locked: false,
              opacity: 100,
              blendMode: "Normal",
              ...layer,
            },
          ],
          }),
          false,
          "addImageLayer"
        ),

      resizeCanvas: (width, height) =>
        set(
          (state) => ({
            canvasSize: { w: width, h: height },
            history: [
              ...state.history,
              `Resize canvas to ${width}x${height}`,
            ],
          }),
          false,
          "resizeCanvas"
        ),
    }),
    { name: "EditorStore" } // Name in den DevTools
  )
);

// ─── Selektoren (optional aber empfohlen) ────────────────────────────────────
/**
 * Selektoren sind Hilfsfunktionen die du in Komponenten benutzt.
 * Statt: useEditorStore(s => s.layers.find(l => l.id === s.selectedLayerId))
 * Einfach: useSelectedLayer()
 *
 * Das hält Komponenten sauber und du änderst die Logik nur an einem Ort.
 */
export const useSelectedLayer = () =>
  useEditorStore((s) => s.layers.find((l) => l.id === s.selectedLayerId));

export const useIsLayerLocked = () => {
  const sel = useSelectedLayer();
  return sel?.locked ?? false;
};