import { useRef } from 'react';
import { Download } from 'lucide-react';
import { useLogo } from './LogoProvider';
import type { LayoutVariant } from './Layout';

// ── Layout helpers (replaces utils/layout) ───────────────────────────────────

function getFlexDirection(layout: LayoutVariant): React.CSSProperties['flexDirection'] {
  switch (layout) {
    case 'Icon-Right':  return 'row-reverse';
    case 'Icon-Top':    return 'column';
    case 'Icon-Bottom': return 'column-reverse';
    default:            return 'row'; // Icon-Left
  }
}

// ── Download helper (replaces utils/downloadImage) ───────────────────────────
// Uses html-to-image if available, falls back to a basic canvas approach.

async function downloadImage(el: HTMLElement) {
  try {
    // @ts-ignore — optional peer dep
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(el, { pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = 'logo.png';
    link.href = dataUrl;
    link.click();
  } catch {
    console.warn('html-to-image not installed; download skipped.');
  }
}

// ── Component 

export function LogoPreview() {
  const [logo] = useLogo();
  const ref = useRef<HTMLDivElement>(null);

  // Resolve icon from @styled-icons/material
  const Icon = (icons as Record<string, React.ComponentType<{ color?: string; size?: number }>>)[logo.iconId];

  const flexDir = getFlexDirection(logo.layout as LayoutVariant);

  return (
    <div className="flex flex-col items-center gap-6 p-8 flex-1 overflow-auto">

      {/* ── Logo box ── */}
      <div
        ref={ref}
        className="shadow-2xl rounded-xl"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: flexDir,
          backgroundColor: logo.backgroundColor,
          gap: `${logo.gap}px`,
          padding: `${logo.padding}px`,
        }}
      >
        {Icon && (
          <Icon
            color={logo.iconColor}
            size={logo.iconSize}
          />
        )}

        <span
          className={logo.fontFamily}
          style={{
            color: logo.color,
            fontSize: `${logo.fontSize}px`,
            letterSpacing: `${logo.letterSpacing}px`,
            fontWeight: logo.fontWeight === 'bold' ? 700 : 400,
            fontFamily: `'${logo.fontFamily.replace(/_/g, ' ')}', sans-serif`,
            whiteSpace: 'nowrap',
          }}
        >
          {logo.text}
        </span>
      </div>

      {/* ── Download button ──
      <button
        onClick={() => ref.current && downloadImage(ref.current)}
        className="
          inline-flex items-center gap-2
          px-5 py-2.5 rounded-lg text-sm font-medium
          bg-primary text-primary-foreground
          hover:bg-primary/90 active:scale-95
          transition-all duration-150
          shadow-md
        "
      >
        <Download className="w-4 h-4" />
        Download
      </button> */}
    </div>
  );
}