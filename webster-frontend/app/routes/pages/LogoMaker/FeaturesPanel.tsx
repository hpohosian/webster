import { type ToolCategory } from "./ToolsPanel";
import { Sun, Contrast, Palette, Lightbulb, CloudRain } from "lucide-react";
import * as Slider from "@radix-ui/react-slider";

const API = import.meta.env.VITE_API;

interface FeaturesPanelProps {
  category: ToolCategory;
  onClose: () => void;
  projectId: string;
  onElementAdded: (el: any) => void;
}

export function FeaturesPanel({
  category,
  onClose,
  projectId,
  onElementAdded,
}: FeaturesPanelProps) {
  if (!category) return null;

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", projectId);

    let uploadedFile: { id: string; url: string; width: number; height: number };
    try {
      const uploadRes = await fetch(`${API}/files/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      uploadedFile = await uploadRes.json();
    } catch (e) {
      console.error("Upload failed", e);
      return;
    }

    await fetch(`${API}/projects/${projectId}/files`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId: uploadedFile.id }),
    });

    const elRes = await fetch(`${API}/elements`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        type: "image",
        x: 50,
        y: 50,
        width: uploadedFile.width ?? 200,
        height: uploadedFile.height ?? 200,
        rotation: 0,
        scale: 1,
        zIndex: 0,
        data: { src: uploadedFile.url },
      }),
    });
    const newEl = await elRes.json();
    onElementAdded(newEl);
    onClose();
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">
          {getCategoryTitle(category)}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {renderCategoryContent(category, handleUpload)}
      </div>
    </div>
  );
}

function getCategoryTitle(category: ToolCategory): string {
  const titles: Record<string, string> = {
    upload: "Upload Picture",
    resize: "Resize Canvas",
    adjustments: "Adjustments",
    text: "Text Options",
    draw: "Draw & Fill",
    shapes: "Shapes",
    templates: "Templates",
  };
  return titles[category || ""] || "";
}

function renderCategoryContent(
  category: ToolCategory,
  handleUpload: (file: File) => Promise<void>
) {
  switch (category) {
    case "upload":
      return (
        <div className="space-y-4">
          <label className="w-full p-4 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors cursor-pointer block">
            <p className="text-sm text-muted-foreground text-center">
              Drop image here or click to browse
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleUpload(e.target.files[0]);
              }}
            />
          </label>
          <button className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80">
            Create Empty Canvas
          </button>
        </div>
      );

    case "resize":
      return (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Custom Size
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                className="flex-1 px-3 py-2 bg-input rounded text-sm"
                placeholder="1080"
              />
              <span className="text-xs text-muted-foreground">×</span>
              <input
                type="number"
                className="flex-1 px-3 py-2 bg-input rounded text-sm"
                placeholder="1080"
              />
              <select className="px-2 py-2 bg-input rounded text-sm">
                <option>px</option>
                <option>%</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Presets
            </label>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {[
                { name: "Instagram Post", size: "1080 × 1080" },
                { name: "Instagram Story", size: "1080 × 1920" },
                { name: "Facebook Post", size: "1200 × 630" },
                { name: "Facebook Cover", size: "820 × 312" },
                { name: "YouTube Thumbnail", size: "1280 × 720" },
                { name: "Twitter Post", size: "1200 × 675" },
                { name: "LinkedIn Post", size: "1200 × 628" },
                { name: "Pinterest Pin", size: "1000 × 1500" },
                { name: "Banner", size: "468 × 60" },
                { name: "Large Rectangle", size: "336 × 280" },
                { name: "Mobile Banner", size: "320 × 50" },
                { name: "Billboard", size: "970 × 250" },
              ].map((preset) => (
                <button
                  key={preset.name}
                  className="w-full px-3 py-2 text-left bg-secondary rounded hover:bg-primary hover:text-primary-foreground transition-colors flex justify-between items-center text-sm"
                >
                  <span>{preset.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {preset.size}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
            Apply Resize
          </button>
        </div>
      );

    case "adjustments":
      return (
        <div className="space-y-6">
          <AdjustmentSlider icon={Sun} label="Highlights" />
          <AdjustmentSlider icon={Contrast} label="Contrast" />
          <AdjustmentSlider icon={Palette} label="Color Balance" />
          <AdjustmentSlider icon={Lightbulb} label="Light" />
          <AdjustmentSlider icon={CloudRain} label="Shadow" />
        </div>
      );

    case "text":
      return (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Font</label>
            <select className="w-full px-3 py-2 bg-input rounded mt-1 text-sm">
              <option>Arial</option>
              <option>Helvetica</option>
              <option>Times New Roman</option>
              <option>Courier</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Size</label>
            <input
              type="number"
              className="w-full px-3 py-2 bg-input rounded mt-1 text-sm"
              placeholder="16"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 px-3 py-2 bg-secondary rounded hover:bg-primary hover:text-primary-foreground text-sm font-bold">
              B
            </button>
            <button className="flex-1 px-3 py-2 bg-secondary rounded hover:bg-primary hover:text-primary-foreground text-sm italic">
              I
            </button>
            <button className="flex-1 px-3 py-2 bg-secondary rounded hover:bg-primary hover:text-primary-foreground text-sm underline">
              U
            </button>
          </div>
        </div>
      );

    case "draw":
      return (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Brush Size</label>
            <Slider.Root
              className="relative flex items-center w-full h-5 mt-2"
              defaultValue={[5]}
              max={50}
              step={1}
            >
              <Slider.Track className="relative bg-secondary rounded-full h-1 flex-1">
                <Slider.Range className="absolute bg-primary rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-4 h-4 bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary" />
            </Slider.Root>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Opacity</label>
            <Slider.Root
              className="relative flex items-center w-full h-5 mt-2"
              defaultValue={[100]}
              max={100}
              step={1}
            >
              <Slider.Track className="relative bg-secondary rounded-full h-1 flex-1">
                <Slider.Range className="absolute bg-primary rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-4 h-4 bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary" />
            </Slider.Root>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Color</label>
            <input
              type="color"
              className="w-full h-10 bg-input rounded mt-1 cursor-pointer"
              defaultValue="#454fda"
            />
          </div>
        </div>
      );

    case "shapes":
      return (
        <div className="space-y-2">
          {["Rectangle", "Circle", "Line", "Arrow", "Triangle", "Star"].map(
            (shape) => (
              <button
                key={shape}
                className="w-full px-4 py-2 text-left bg-secondary rounded hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
              >
                {shape}
              </button>
            )
          )}
        </div>
      );

    case "templates":
      return (
        <div className="space-y-4">
          {[
            {
              label: "Social Media",
              items: [
                "Instagram Post",
                "Instagram Story",
                "Facebook Cover",
                "Twitter Header",
                "YouTube Thumbnail",
              ],
            },
            {
              label: "Business",
              items: [
                "Business Card",
                "Flyer",
                "Poster",
                "Brochure",
                "Logo Template",
              ],
            },
            {
              label: "Creative",
              items: ["Collage", "Photo Grid", "Mood Board", "Presentation Slide"],
            },
          ].map(({ label, items }) => (
            <div key={label}>
              <label className="text-sm text-muted-foreground mb-2 block">
                {label}
              </label>
              <div className="space-y-1">
                {items.map((template) => (
                  <button
                    key={template}
                    className="w-full px-4 py-3 text-left bg-secondary rounded hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

function AdjustmentSlider({
  icon: Icon,
  label,
}: {
  icon: any;
  label: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <label className="text-sm text-foreground">{label}</label>
      </div>
      <Slider.Root
        className="relative flex items-center w-full h-5"
        defaultValue={[0]}
        min={-100}
        max={100}
        step={1}
      >
        <Slider.Track className="relative bg-secondary rounded-full h-1 flex-1">
          <Slider.Range className="absolute bg-primary rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb className="block w-4 h-4 bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary" />
      </Slider.Root>
    </div>
  );
}