import { Canvas as FabricCanvas } from "fabric";
import { toPng } from "html-to-image";

export async function generateThumbnailFromProjectData(
  projectData: Record<string, any>
): Promise<string | null> {
  return new Promise((resolve) => {
    const el = document.createElement("canvas");
    
    const sourceCanvas = projectData.canvas;
    const w = sourceCanvas?.width ?? 800;
    const h = sourceCanvas?.height ?? 600;
    
    el.width = w;
    el.height = h;

    const fabric = new FabricCanvas(el, { width: w, height: h });

    const objects = projectData.objects;
    if (!objects) {
      fabric.dispose();
      resolve(null);
      return;
    }

    fabric.loadFromJSON(objects, () => {
      fabric.backgroundColor = sourceCanvas?.background ?? "#ffffff";
      fabric.requestRenderAll();

      const dataUrl = fabric.toDataURL({
        format: "png",
        multiplier: 280 / w,
      });

      fabric.dispose();
      resolve(dataUrl);
    });
  });
}

export async function generateLogoThumbnail(ref: HTMLElement) {
  const dataUrl = await toPng(ref, {
    pixelRatio: 0.8,
    cacheBust: true,
  });

  return dataUrl;
}
