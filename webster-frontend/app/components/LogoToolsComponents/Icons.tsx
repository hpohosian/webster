import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Slider from "@radix-ui/react-slider";
import { searchIcons } from "../../lib/demoApi";
import type { DemoIcon } from "../../lib/demoApi";
import { useLogo } from './LogoProvider';

type IconItem = DemoIcon;

const DEFAULT_QUERY = "logo";

export function IconsPanel() {
  const [search, setSearch] = useState(DEFAULT_QUERY);
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logo, updateLogo] = useLogo();

  useEffect(() => {
    let cancelled = false;
    const query = search.trim() || DEFAULT_QUERY;

    setLoading(true);
    setError("");

    const timeout = window.setTimeout(() => {
      searchIcons(query)
        .then((items) => {
          if (!cancelled) setIcons(items);
        })
        .catch(() => {
          if (!cancelled) setError("Could not load icons");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [search]);

  const filtered = useMemo(() => icons, [icons]);

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col">
      {/* Panel header */}
      <div className="h-12 px-4 border-b border-border flex items-center">
        <h3 className="font-semibold text-foreground text-sm">Icons</h3>
      </div>

      <Tabs.Root defaultValue="icons" className="flex flex-col flex-1 overflow-hidden">
        {/* Tab list */}
        <Tabs.List className="flex gap-1 px-3 pt-3 pb-1 flex-shrink-0">
          {(["icons", "style"] as const).map((tab) => (
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
              {tab === "icons" ? "Icons" : "Size & Color"}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Icons tab */}
        <Tabs.Content value="icons" className="flex-1 flex flex-col overflow-hidden">
          {/* Search bar */}
          <div className="px-3 py-2 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search icons…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full pl-8 pr-8 py-1.5 text-sm
                  bg-input rounded border border-border
                  text-foreground placeholder:text-muted-foreground
                  focus:outline-none focus:ring-1 focus:ring-ring
                "
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Icon grid */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {loading ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                Loading icons...
              </p>
            ) : error ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                {error}
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                No icons found
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {filtered.map((icon) => (
                  <IconCard
                    key={icon.id}
                    icon={icon}
                    selected={logo.iconId === icon.id}
                    color={logo.iconColor}
                    onSelect={() => updateLogo({ iconId: icon.id, iconSvg: icon.svg, iconLabel: icon.label })}
                  />
                ))}
              </div>
            )}

            <p className="mt-3 text-center text-[10px] text-muted-foreground/50">
              Free SVG icons load through the backend API
            </p>
          </div>
        </Tabs.Content>

        {/* Style tab  */}
        <Tabs.Content value="style" className="flex-1 overflow-y-auto p-4 space-y-6">

          {/* Size */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-muted-foreground">Size</label>
              <span className="text-xs text-foreground">{logo.iconSize}px</span>
            </div>
            <Slider.Root
              className="relative flex items-center w-full h-5"
              value={[logo.iconSize]}
              min={24}
              max={300}
              step={1}
              onValueChange={([v]) => updateLogo({ iconSize: v })}
            >
              <Slider.Track className="relative bg-secondary rounded-full h-1 flex-1">
                <Slider.Range className="absolute bg-primary rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-4 h-4 bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary" />
            </Slider.Root>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Color</label>

            {/* Native colour picker */}
            <div className="relative w-full h-10 rounded overflow-hidden border border-border">
              <input
                type="color"
                value={logo.iconColor}
                onChange={(e) => updateLogo({ iconColor: e.target.value })}
                className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
              />
              <div
                className="w-full h-full rounded"
                style={{ background: logo.iconColor }}
              />
            </div>

            {/* Hex input */}
            <input
              type="text"
              value={logo.iconColor}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#([0-9A-Fa-f]{0,6})$/.test(val)) updateLogo({ iconColor: val });
              }}
              className="
                mt-2 w-full px-3 py-1.5 text-sm
                bg-input rounded border border-border
                text-foreground font-mono
                focus:outline-none focus:ring-1 focus:ring-ring
              "
              placeholder="#7bbbeb"
            />
          </div>

          {/* Preview */}
          {(logo.iconSvg || logo.iconId) && (
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Preview</label>
              <div className="flex items-center justify-center p-4 bg-secondary rounded-lg border border-border">
                {logo.iconSvg ? (
                  <span
                    className="svg-icon-preview"
                    style={{
                      width: Math.min(logo.iconSize, 80),
                      height: Math.min(logo.iconSize, 80),
                      color: logo.iconColor,
                      display: "flex",
                    }}
                    dangerouslySetInnerHTML={{ __html: logo.iconSvg }}
                  />
                ) : (
                  <div
                    className="rounded bg-primary/20 flex items-center justify-center"
                    style={{
                      width: Math.min(logo.iconSize, 80),
                      height: Math.min(logo.iconSize, 80),
                      color: logo.iconColor,
                    }}
                  >
                    <span className="text-xs text-muted-foreground">
                      {logo.iconId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

// ── Icon card 
function IconCard({
  icon,
  selected,
  color,
  onSelect,
}: {
  icon: IconItem;
  selected: boolean;
  color: string;
  onSelect: () => void;
}) {
  return (
    <button
      title={icon.label}
      onClick={onSelect}
      className={`
        aspect-square rounded-lg flex items-center justify-center
        border transition-all duration-150
        ${selected
          ? "border-primary bg-primary/10"
          : "border-border bg-secondary hover:border-primary/50 hover:bg-secondary/80"
        }
      `}
    >
      {icon.svg ? (
        <svg
          viewBox="0 0 24 24"
          style={{ width: 20, height: 20, color: selected ? color : "currentColor" }}
          dangerouslySetInnerHTML={{ __html: icon.svg }}
        />
      ) : (
        <div
          className="w-5 h-5 rounded bg-muted-foreground/20"
          style={selected ? { background: color + "33" } : {}}
        />
      )}
    </button>
  );
}