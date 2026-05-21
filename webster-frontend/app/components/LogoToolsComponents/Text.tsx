import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Slider from "@radix-ui/react-slider";
import { useLogo } from './LogoProvider';
export type FontWeight = "normal" | "bold";

interface TextConfig {
  text: string;
  fontWeight: FontWeight;
  fontSize: number;
  letterSpacing: number;
  color: string;
  fontFamily: string;
}

interface TextPanelProps {
  config: TextConfig;
  onChange: (patch: Partial<TextConfig>) => void;
}

// ── Placeholder font list (swap with your google-fonts.json import) ───────────

const GOOGLE_FONTS: string[] = [
  "Roboto", "Open_Sans", "Lato", "Montserrat", "Oswald",
  "Raleway", "Poppins", "Merriweather", "Playfair_Display",
  "Ubuntu", "Nunito", "Rubik", "Inter", "DM_Sans",
  "Space_Grotesk", "Sora", "Outfit", "Plus_Jakarta_Sans",
];

export function TextPanel() {
  const [logo, updateLogo] = useLogo();
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col overflow-hidden">
      <div className="h-12 px-4 border-b border-border flex items-center flex-shrink-0">
        <h3 className="font-semibold text-foreground text-sm">Text</h3>
      </div>

      <Tabs.Root defaultValue="font" className="flex flex-col flex-1 overflow-hidden">
        {/* Tab list */}
        <Tabs.List className="flex gap-1 px-3 pt-3 pb-1 flex-shrink-0">
          {(["font", "family"] as const).map((tab) => (
            <Tabs.Trigger
              key={tab}
              value={tab}
              className="
                flex-1 px-2 py-1.5 text-xs font-medium rounded
                text-muted-foreground
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                hover:text-foreground transition-colors
              "
            >
              {tab === "font" ? "Text" : "Family"}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Text / style tab */}
        <Tabs.Content value="font" className="flex-1 overflow-y-auto p-4 space-y-5">

          {/* Logo name input */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Logo name</label>
            <input
              type="text"
              placeholder="Eg. Amazing Logo"
              value={logo.text}
              onChange={(e) => updateLogo({ text: e.target.value })}
              className="
                w-full px-3 py-2 text-sm
                bg-input rounded border border-border
                text-foreground placeholder:text-muted-foreground
                focus:outline-none focus:ring-1 focus:ring-ring
              "
            />
          </div>

          {/* Font weight toggle */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Font weight</label>
            <div className="flex gap-2">
              {(["normal", "bold"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => updateLogo({ fontWeight: w })}
                  className={`
                    flex-1 py-1.5 text-xs rounded border transition-all
                    ${logo.fontWeight === w
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
                    }
                  `}
                  style={{ fontWeight: w === "bold" ? 700 : 400 }}
                >
                  {w.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <SliderField
            label="Font size"
            value={logo.fontSize}
            min={10}
            max={160}
            onChange={(v) => updateLogo({ fontSize: v })}
          />

          {/* Letter spacing */}
          <SliderField
            label="Letter spacing"
            value={logo.letterSpacing}
            min={-20}
            max={80}
            onChange={(v) => updateLogo({ letterSpacing: v })}
          />

          {/* Text preview */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Preview</label>
            <div className="flex items-center justify-center p-3 bg-secondary rounded-lg border border-border min-h-12 overflow-hidden">
              <span
                style={{
                  fontFamily: logo.fontFamily.replace(/_/g, " "),
                  fontWeight: logo.fontWeight === "bold" ? 700 : 400,
                  fontSize: Math.min(logo.fontSize, 32),
                  letterSpacing: logo.letterSpacing,
                  color: logo.color,
                  whiteSpace: "nowrap",
                }}
              >
                {logo.text || "Logo Name"}
              </span>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Color</label>
            <div className="relative w-full h-10 rounded overflow-hidden border border-border">
              <input
                type="color"
                value={logo.color}
                onChange={(e) => updateLogo({ color: e.target.value })}
                className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
              />
              <div className="w-full h-full rounded" style={{ background: logo.color }} />
            </div>
            <input
              type="text"
              value={logo.color}
              onChange={(e) => {
                if (/^#([0-9A-Fa-f]{0,6})$/.test(e.target.value))
                  updateLogo({ color: e.target.value });
              }}
              className="
                mt-2 w-full px-3 py-1.5 text-sm font-mono
                bg-input rounded border border-border text-foreground
                focus:outline-none focus:ring-1 focus:ring-ring
              "
              placeholder="#000000"
            />
          </div>
        </Tabs.Content>

        {/* Font family tab */}
        <Tabs.Content value="family" className="flex-1 overflow-y-auto p-3 space-y-1">
          {GOOGLE_FONTS.map((font) => {
            const isSelected = font === logo.fontFamily;
            const displayName = font.replace(/_/g, " ");
            return (
              <button
                key={font}
                onClick={() => updateLogo({ fontFamily: font })}
                className={`
                  w-full px-3 py-2.5 text-left rounded-lg border transition-all
                  ${isSelected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-transparent bg-secondary hover:border-primary/30 hover:bg-secondary/80 text-foreground"
                  }
                `}
              >
                <span
                  className="text-sm font-semibold block"
                  style={{ fontFamily: `'${displayName}', sans-serif` }}
                >
                  {displayName}
                </span>
                {isSelected && (
                  <span className="text-[10px] text-primary mt-0.5 block">Selected</span>
                )}
              </button>
            );
          })}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-muted-foreground">{label}</label>
        <span className="text-xs text-foreground tabular-nums">{value}</span>
      </div>
      <Slider.Root
        className="relative flex items-center w-full h-5"
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={([v]) => onChange(v)}
      >
        <Slider.Track className="relative bg-secondary rounded-full h-1 flex-1">
          <Slider.Range className="absolute bg-primary rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb className="block w-4 h-4 bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary" />
      </Slider.Root>
    </div>
  );
}