import { useState } from "react";
import { Layers, History, ChevronRight, Eye, EyeOff, Lock, Unlock, MoreVertical, Trash2, Copy, MoveUp, MoveDown, GitMerge } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Slider from "@radix-ui/react-slider";

type PanelTab = "layers" | "history" | null;

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
}

export function RightPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>("layers");
  const [selectedLayer, setSelectedLayer] = useState<string>("1");
  const [editingLayer, setEditingLayer] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const [layers, setLayers] = useState<Layer[]>([
    { id: "1", name: "Background", visible: true, locked: false, opacity: 100 },
    { id: "2", name: "Layer 1", visible: true, locked: false, opacity: 100 },
  ]);

  const historyItems = [
    "Upload Image",
    "Adjust Brightness",
    "Add Text",
    "Apply Filter",
  ];

  const toggleLayerVisibility = (id: string) => {
    setLayers(layers.map(layer =>
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const toggleLayerLock = (id: string) => {
    setLayers(layers.map(layer =>
      layer.id === id ? { ...layer, locked: !layer.locked } : layer
    ));
  };

  const addNewLayer = () => {
    const newId = (Math.max(...layers.map(l => parseInt(l.id))) + 1).toString();
    setLayers([...layers, { id: newId, name: `Layer ${newId}`, visible: true, locked: false, opacity: 100 }]);
  };

  const duplicateLayer = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
      const newId = (Math.max(...layers.map(l => parseInt(l.id))) + 1).toString();
      const index = layers.findIndex(l => l.id === id);
      const newLayers = [...layers];
      newLayers.splice(index + 1, 0, { ...layer, id: newId, name: `${layer.name} Copy` });
      setLayers(newLayers);
    }
  };

  const deleteLayer = (id: string) => {
    if (layers.length > 1) {
      setLayers(layers.filter(l => l.id !== id));
    }
  };

  const moveLayerUp = (id: string) => {
    const index = layers.findIndex(l => l.id === id);
    if (index < layers.length - 1) {
      const newLayers = [...layers];
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      setLayers(newLayers);
    }
  };

  const moveLayerDown = (id: string) => {
    const index = layers.findIndex(l => l.id === id);
    if (index > 0) {
      const newLayers = [...layers];
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
      setLayers(newLayers);
    }
  };

  const startRename = (id: string, currentName: string) => {
    setEditingLayer(id);
    setEditName(currentName);
  };

  const finishRename = () => {
    if (editingLayer && editName.trim()) {
      setLayers(layers.map(layer =>
        layer.id === editingLayer ? { ...layer, name: editName.trim() } : layer
      ));
    }
    setEditingLayer(null);
    setEditName("");
  };

  const updateLayerOpacity = (id: string, opacity: number) => {
    setLayers(layers.map(layer =>
      layer.id === id ? { ...layer, opacity } : layer
    ));
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-[#0f0f14] border-l border-border flex flex-col items-center py-4 gap-2">
        <button
          onClick={() => {
            setIsCollapsed(false);
            setActiveTab("layers");
          }}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Layers"
        >
          <Layers className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            setIsCollapsed(false);
            setActiveTab("history");
          }}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="History"
        >
          <History className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-card border-l border-border flex flex-col">
      <div className="h-12 border-b border-border flex items-center justify-between px-3">
        <div className="flex gap-1 items-center">
          <button
            onClick={() => setActiveTab("layers")}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              activeTab === "layers"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              activeTab === "history"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-4 h-4" />
          </button>

          {activeTab === "layers" && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content className="min-w-[200px] bg-popover border border-border rounded-lg shadow-lg p-1 z-50">
                  <DropdownMenu.Item
                    className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center justify-between"
                    onClick={addNewLayer}
                  >
                    New Layer
                    <span className="text-xs opacity-60">Ctrl+Shift+N</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                    New Group
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-border my-1" />
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center justify-between">
                    Duplicate Layer
                    <span className="text-xs opacity-60">Ctrl+J</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center justify-between">
                    Delete Layer
                    <span className="text-xs opacity-60">Del</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-border my-1" />
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                    Group Layers
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                    Ungroup Layers
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-border my-1" />
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                    Merge Down
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                    Merge Visible
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                    Flatten Image
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-border my-1" />
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                    Add Mask
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                    Apply Mask
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer">
                    Remove Mask
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "layers" && (
          <div className="space-y-1">
            {[...layers].reverse().map((layer, reversedIndex) => {
              const actualIndex = layers.length - 1 - reversedIndex;
              const isSelected = selectedLayer === layer.id;

              return (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`flex items-center gap-2 p-2 rounded group cursor-pointer ${
                    isSelected ? "bg-primary/20 ring-1 ring-primary" : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLayerVisibility(layer.id);
                    }}
                    className="p-1 hover:bg-background rounded flex-shrink-0"
                  >
                    {layer.visible ? (
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>

                  <div
                    className="w-8 h-8 rounded bg-gradient-to-br from-primary/30 to-primary/10 border border-border flex-shrink-0"
                    style={{ opacity: layer.opacity / 100 }}
                  />

                  {editingLayer === layer.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={finishRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") finishRename();
                        if (e.key === "Escape") {
                          setEditingLayer(null);
                          setEditName("");
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 text-sm bg-background px-2 py-0.5 rounded text-foreground"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="flex-1 text-sm text-foreground"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startRename(layer.id, layer.name);
                      }}
                    >
                      {layer.name}
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLayerLock(layer.id);
                    }}
                    className="p-1 hover:bg-background rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {layer.locked ? (
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>

                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 hover:bg-background rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                      <DropdownMenu.Content className="min-w-[180px] bg-popover border border-border rounded-lg shadow-lg p-1 z-50">
                        <DropdownMenu.Item
                          className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer"
                          onClick={() => startRename(layer.id, layer.name)}
                        >
                          Rename Layer
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center gap-2"
                          onClick={() => duplicateLayer(layer.id)}
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate Layer
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer"
                          onClick={() => {}}
                        >
                          Rasterize Layer
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className="h-px bg-border my-1" />
                        <DropdownMenu.Item
                          className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center gap-2"
                          onClick={() => moveLayerUp(layer.id)}
                        >
                          <MoveUp className="w-4 h-4" />
                          Move Up
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center gap-2"
                          onClick={() => moveLayerDown(layer.id)}
                        >
                          <MoveDown className="w-4 h-4" />
                          Move Down
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className="h-px bg-border my-1" />
                        <DropdownMenu.Item
                          className="px-3 py-2 text-sm rounded outline-none hover:bg-primary hover:text-primary-foreground cursor-pointer flex items-center gap-2"
                          onClick={() => {}}
                        >
                          <GitMerge className="w-4 h-4" />
                          Merge Down
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className="h-px bg-border my-1" />
                        <DropdownMenu.Item
                          className="px-3 py-2 text-sm rounded outline-none hover:bg-destructive hover:text-destructive-foreground cursor-pointer flex items-center gap-2"
                          onClick={() => deleteLayer(layer.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Layer
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              );
            })}

            <button
              onClick={addNewLayer}
              className="w-full mt-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Add Layer
            </button>

            {selectedLayer && (
              <div className="mt-4 p-3 bg-background rounded-lg space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Blend Mode</label>
                  <select className="w-full px-3 py-2 bg-input rounded text-sm">
                    <option>Normal</option>
                    <option>Multiply</option>
                    <option>Screen</option>
                    <option>Overlay</option>
                    <option>Darken</option>
                    <option>Lighten</option>
                    <option>Color Dodge</option>
                    <option>Color Burn</option>
                    <option>Hard Light</option>
                    <option>Soft Light</option>
                    <option>Difference</option>
                    <option>Exclusion</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-muted-foreground">Opacity</label>
                    <span className="text-xs text-foreground">
                      {layers.find(l => l.id === selectedLayer)?.opacity}%
                    </span>
                  </div>
                  <Slider.Root
                    className="relative flex items-center w-full h-5"
                    value={[layers.find(l => l.id === selectedLayer)?.opacity || 100]}
                    onValueChange={([value]) => updateLayerOpacity(selectedLayer, value)}
                    max={100}
                    step={1}
                  >
                    <Slider.Track className="relative bg-secondary rounded-full h-1 flex-1">
                      <Slider.Range className="absolute bg-primary rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary" />
                  </Slider.Root>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-1">
            {historyItems.map((item, index) => (
              <div
                key={index}
                className="px-3 py-2 text-sm rounded bg-secondary hover:bg-secondary/80 cursor-pointer"
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
