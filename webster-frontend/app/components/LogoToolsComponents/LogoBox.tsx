import * as Slider from "@radix-ui/react-slider";
import { useLogo } from './LogoProvider';
interface BoxConfig {
  padding: number;
  gap: number;
  backgroundColor: string;
}

export function BoxPanel() {
   const [logo, updateLogo] = useLogo();
  return (
    <div className="w-80 bg-card border-r border-border flex flex-col">
      <div className="h-12 px-4 border-b border-border flex items-center">
        <h3 className="font-semibold text-foreground text-sm">Box</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* Padding */}
        <SliderField
          label="Padding"
          value={logo.padding}
          min={0}
          max={300}
          onChange={(v) => updateLogo({ padding: v })}
        />

        {/* Gap */}
        <SliderField
          label="Gap"
          value={logo.gap}
          min={0}
          max={100}
          onChange={(v) => updateLogo({ gap: v })}
        />

        {/* Background color */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Background</label>

          <div className="relative w-full h-10 rounded overflow-hidden border border-border">
            <input
              type="color"
              value={logo.backgroundColor}
              onChange={(e) => updateLogo({ backgroundColor: e.target.value })}
              className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
            />
            <div
              className="w-full h-full rounded"
              style={{ background: logo.backgroundColor }}
            />
          </div>

          <input
            type="text"
            value={logo.backgroundColor}
            onChange={(e) => {
              if (/^#([0-9A-Fa-f]{0,6})$/.test(e.target.value))
                updateLogo({ backgroundColor: e.target.value });
            }}
            className="
              mt-2 w-full px-3 py-1.5 text-sm font-mono
              bg-input rounded border border-border text-foreground
              focus:outline-none focus:ring-1 focus:ring-ring
            "
            placeholder="#ffffff"
          />
        </div>

        {/* Visual preview of padding/gap */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Preview</label>
          <div
            className="w-full rounded-lg border border-border flex items-center justify-center transition-all"
            style={{
              background: logo.backgroundColor || "transparent",
              padding: `${Math.min(logo.padding / 5, 32)}px`,
            }}
          >
            <div
              className="flex items-center rounded"
              style={{ gap: `${Math.min(logo.gap / 3, 24)}px` }}
            >
              <div className="w-8 h-8 rounded bg-primary/60" />
              <div className="space-y-1">
                <div className="w-16 h-2.5 rounded bg-foreground/40" />
                <div className="w-12 h-2 rounded bg-foreground/20" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Shared slider field 
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