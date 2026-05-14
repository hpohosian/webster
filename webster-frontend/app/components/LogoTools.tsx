import { MousePointer2, Hand, Type, Square, Wand2, LayoutTemplate } from "lucide-react";
import { PrismatLogo } from "./../assets/Logo" 
export type PanelCategory = "text" | "icons" | "box" | "templates" | null;

interface LogoToolsPanelProps {
  activePanel: PanelCategory;
  onPanelSelect: (panel: PanelCategory) => void;
}

const PANEL_CATEGORIES = [
  { id: "text"      as const, Icon: Type,            label: "Text" },
  { id: "icons"     as const, Icon: Square,          label: "Icons" },
  { id: "box"       as const, Icon: Wand2,           label: "Box / Shape" },
  { id: "templates" as const, Icon: LayoutTemplate,  label: "Templates" },
] satisfies { id: Exclude<PanelCategory, null>; Icon: React.FC<{ className?: string }>; label: string }[];

// ── Component 
export function LogoToolsPanel({
  activePanel,
  onPanelSelect,
}: LogoToolsPanelProps) {
  return (
    <div className="w-13 bg-[#0f0f14] border-r border-border flex flex-col items-center py-3 gap-1 flex-shrink-0">
        <PrismatLogo/>

      {/* Divider */}
      <div className="w-7 h-px bg-border my-1" />

      {/* Panel categories */}
      {PANEL_CATEGORIES.map(({ id, Icon, label }) => (
        <ToolButton
          key={id}
          label={label}
          active={activePanel === id}
          activeFill
          onClick={() => onPanelSelect(activePanel === id ? null : id)}
        >
          <Icon className="w-4 h-4" />
        </ToolButton>
      ))}
    </div>
  );
}

interface ToolButtonProps {
  label: string;
  active: boolean;
  activeFill?: boolean; // canvas tools fill bg; panel tools use accent colour text
  onClick: () => void;
  children: React.ReactNode;
}

function ToolButton({ label, active, activeFill = false, onClick, children }: ToolButtonProps) {
  const activeStyle = activeFill
    ? "bg-secondary text-primary"          // panel toggle: subtle bg + accent text
    : "bg-primary text-primary-foreground"; // canvas tool: solid primary fill

  return (
    <button
      title={label}
      onClick={onClick}
      className={`
        relative w-9 h-9 rounded-lg flex items-center justify-center
        transition-all duration-150 group
        ${active
          ? activeStyle
          : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
        }
      `}
    >
      {children}

      {/* Tooltip */}
      <span className="
        pointer-events-none absolute left-full ml-2 px-2 py-1
        bg-popover text-popover-foreground border border-border
        text-xs rounded whitespace-nowrap
        opacity-0 group-hover:opacity-100 transition-opacity z-50
      ">
        {label}
      </span>
    </button>
  );
}