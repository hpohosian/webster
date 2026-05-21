import { useCallback, useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import { useLogo } from './LogoProvider';
import type { LayoutVariant } from './Layout';
import { useEditorStore } from '../../store/editorStore';
import { generateLogoThumbnail } from "../../routes/ProjectPage/generateThumbnail";
import { useParams } from 'react-router';

function getFlexDirection(layout: LayoutVariant): React.CSSProperties['flexDirection'] {
  switch (layout) {
    case 'Icon-Right':  return 'row-reverse';
    case 'Icon-Top':    return 'column';
    case 'Icon-Bottom': return 'column-reverse';
    default:            return 'row';
  }
}

// Download helper
// async function downloadImage(el: HTMLElement) {
//   try {
//     // @ts-ignore — optional peer dep
//     const { toPng } = await import('html-to-image');
//     const dataUrl = await toPng(el, { pixelRatio: 2 });
//     const link = document.createElement('a');
//     link.download = 'logo.png';
//     link.href = dataUrl;
//     link.click();
//   } catch {
//     console.warn('html-to-image not installed; download skipped.');
//   }
// }

const API = import.meta.env?.VITE_API;

export function LogoPreview() {
  const [logo] = useLogo();
  const ref = useRef<HTMLDivElement>(null);
  const { setLogoRef } = useEditorStore();

  useEffect(() => {
    setLogoRef(ref.current);
  }, [setLogoRef]);

  const flexDir = getFlexDirection(logo.layout as LayoutVariant);

  const { projectId } = useParams();

  const saveProject = useCallback(async () => {
    if (!projectId) return;
  
    const thumbnail = await generateLogoThumbnail(ref.current);


    await fetch(`${API}/projects/${projectId}/save`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        thumbnail,
      }),
    });
  }, [ref]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      saveProject();
    }, 800);

    return () => clearTimeout(timeout);
  }, [logo, saveProject]);
  
  return (
    <div className="flex flex-col items-center gap-6 p-8 flex-1 overflow-auto">

      {/* Logo box */}
      <div
        ref={ref}
        className="shadow-xl rounded-2xl"
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
        {logo.iconSvg && (
          <span
            style={{
              width: logo.iconSize,
              height: logo.iconSize,
              color: logo.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            dangerouslySetInnerHTML={{ __html: logo.iconSvg }}
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