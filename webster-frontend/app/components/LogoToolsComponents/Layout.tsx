import { useLogo } from './LogoProvider';
export type LayoutVariant = "Icon-Left" | "Icon-Right" | "Icon-Top" | "Icon-Bottom";

// interface LayoutPanelProps {
//   layout: LayoutVariant;
//   onChange: (layout: LayoutVariant) => void;
// }

const LAYOUTS: LayoutVariant[] = ["Icon-Left", "Icon-Right", "Icon-Top", "Icon-Bottom"];

// ── Component 

export function LayoutPanel() {
  const [logo, updateLogo] = useLogo();
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="h-12 px-4 border-b border-border flex items-center">
        <h3 className="font-semibold text-foreground text-sm">Layout</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <p className="text-xs text-muted-foreground mb-3">Layouts</p>

        {LAYOUTS.map((item) => {
          const isSelected = item === logo.layout;
          return (
            <button
              key={item}
              onClick={() => updateLogo({layout: item})}
              className={`
                w-full p-3 rounded-lg border text-left transition-all duration-150
                ${isSelected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-secondary hover:border-primary/40 hover:bg-secondary/80 text-foreground"
                }
              `}
            >
              <LayoutPreview variant={item} active={isSelected} />
              <span className="mt-2 block text-xs text-center text-muted-foreground">
                {/* {item.replace("-", " ")} */}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Layout preview SVG diagrams 

function LayoutPreview({ variant, active }: { variant: LayoutVariant; active: boolean }) {
  const iconColor = active ? "var(--primary)" : "var(--muted-foreground)";
  const textColor = active ? "var(--foreground)" : "var(--muted-foreground)";
  const iconBox = <rect width="17" height="17" rx="3" fill={iconColor} />;
  const textLines = (
    <g>
      <rect width="30" height="4" rx="2" fill={textColor} />
      <rect y="7" width="20" height="3" rx="1.5" fill={textColor} opacity="0.5" />
    </g>
  );

  let content: React.ReactNode;
  switch (variant) {
    case "Icon-Left":
      content = (
        <svg viewBox="0 0 90 28" className="w-full">
          <g transform="translate(10,5)">{iconBox}</g>
          <g transform="translate(36,9)">{textLines}</g>
        </svg>
      );
      break;
    case "Icon-Right":
      content = (
        <svg viewBox="0 0 90 28" className="w-full">
          <g transform="translate(4,9)">{textLines}</g>
          <g transform="translate(52,5)">{iconBox}</g>
        </svg>
      );
      break;
    case "Icon-Top":
      content = (
        <svg viewBox="0 0 90 42" className="w-full">
          <g transform="translate(31,2)">{iconBox}</g>
          <g transform="translate(24,26)">{textLines}</g>
        </svg>
      );
      break;
    case "Icon-Bottom":
      content = (
        <svg viewBox="0 0 90 42" className="w-full">
          <g transform="translate(24,4)">{textLines}</g>
          <g transform="translate(31,24)">{iconBox}</g>
        </svg>
      );
      break;
  }

  return <div className="w-full">{content}</div>;
}