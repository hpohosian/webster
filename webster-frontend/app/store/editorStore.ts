import { create } from "zustand";

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
}

interface EditorStore {
  // State
  activeTool: string;
  activePanel: string | null;
  zoom: number;
  offset: { x: number; y: number };
  layers: Layer[];
  selectedLayerId: string;
  history: string[];
  brushColor: string;
  brushSize: number;
  brushOpacity: number;

  // Actions
  setActiveTool: (tool: string) => void;
  setActivePanel: (panel: string | null) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  setOffset: (offset: { x: number; y: number }) => void;
  addLayer: () => void;
  deleteLayer: (id: string) => void;
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  setSelectedLayerId: (id: string) => void;
  pushHistory: (label: string) => void;
  setBrushColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setBrushOpacity: (opacity: number) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  // Initial state
  activeTool: "pointer",
  activePanel: null,
  zoom: 100,
  offset: { x: 0, y: 0 },
  layers: [
    { id: "bg", name: "Background", visible: true, locked: false, opacity: 100, blendMode: "Normal" },
    { id: "l1", name: "Layer 1",    visible: true, locked: false, opacity: 100, blendMode: "Normal" },
  ],
  selectedLayerId: "bg",
  history: ["Canvas Created"],
  brushColor: "#454fda",
  brushSize: 5,
  brushOpacity: 100,

  // Actions
  setActiveTool: (tool) => set({ activeTool: tool }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setZoom: (zoom) => set({ zoom }),
  zoomIn:  () => set(s => ({ zoom: Math.min(400, s.zoom + 10) })),
  zoomOut: () => set(s => ({ zoom: Math.max(10,  s.zoom - 10) })),
  resetView: () => set({ zoom: 100, offset: { x: 0, y: 0 } }),
  setOffset: (offset) => set({ offset }),

  addLayer: () => {
    const { layers } = get();
    const newId = `l${Date.now()}`;
    const num = layers.length + 1;
    set({
      layers: [...layers, { id: newId, name: `Layer ${num}`, visible: true, locked: false, opacity: 100, blendMode: "Normal" }],
      selectedLayerId: newId,
    });
    get().pushHistory(`Add Layer ${num}`);
  },

  deleteLayer: (id) => {
    const { layers, selectedLayerId } = get();
    if (layers.length <= 1) return;
    set({
      layers: layers.filter(l => l.id !== id),
      selectedLayerId: selectedLayerId === id ? layers[0].id : selectedLayerId,
    });
    get().pushHistory("Delete Layer");
  },

  updateLayer: (id, patch) =>
    set(s => ({ layers: s.layers.map(l => l.id === id ? { ...l, ...patch } : l) })),

  setSelectedLayerId: (id) => set({ selectedLayerId: id }),

  pushHistory: (label) =>
    set(s => ({ history: [...s.history, label] })),

  setBrushColor:   (brushColor)   => set({ brushColor }),
  setBrushSize:    (brushSize)    => set({ brushSize }),
  setBrushOpacity: (brushOpacity) => set({ brushOpacity }),
}));