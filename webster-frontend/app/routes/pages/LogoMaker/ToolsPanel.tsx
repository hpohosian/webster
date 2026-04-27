import {
  Upload,
  Maximize,
  Sliders,
  Type,
  Pencil,
  Shapes,
  ChevronRight,
  LayoutTemplate
} from "lucide-react";

export type ToolCategory =
  | "upload"
  | "resize"
  | "adjustments"
  | "filter"
  | "text"
  | "draw"
  | "shapes"
  | "templates"
  | null;

interface ToolsPanelProps {
  selectedCategory: ToolCategory;
  onCategorySelect: (category: ToolCategory) => void;
}

export function ToolsPanel({ selectedCategory, onCategorySelect }: ToolsPanelProps) {
  const tools = [
    { id: "upload" as const, icon: Upload, label: "Upload Picture" },
    { id: "resize" as const, icon: Maximize, label: "Resize Canvas" },
    { id: "adjustments" as const, icon: Sliders, label: "Adjustments" },
    { id: "text" as const, icon: Type, label: "Text" },
    { id: "draw" as const, icon: Pencil, label: "Draw & Fill" },
    { id: "shapes" as const, icon: Shapes, label: "Shapes" },
    { id: "templates" as const, icon: LayoutTemplate, label: "Templates" },
  ];

  return (
    <div className="w-16 bg-[#0f0f14] border-r border-border flex flex-col items-center py-4 gap-2">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isSelected = selectedCategory === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => onCategorySelect(tool.id)}
            className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              transition-all relative group
              ${isSelected
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }
            `}
            title={tool.label}
          >
            <Icon className="w-5 h-5" />
            {isSelected && (
              <ChevronRight className="absolute -right-1 w-3 h-3 text-primary" />
            )}

            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              {tool.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
