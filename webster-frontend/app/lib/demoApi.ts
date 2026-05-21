const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export interface DemoImage {
  id: string;
  alt: string;
  thumb: string;
  regular: string;
  author?: string;
  link?: string;
}

export interface DemoFont {
  family: string;
  category?: string;
  variants?: string[];
}

export interface DemoColor {
  hex: string;
  name?: string;
}

export interface DemoIcon {
  id: string;
  label: string;
  svg: string;
  source?: string;
  author?: string;
  license?: string;
}

export async function searchImages(query: string): Promise<DemoImage[]> {
  const response = await fetch(`${API_BASE_URL}/images/search?q=${encodeURIComponent(query)}`);
  const data = await readJson(response);
  return data.images || [];
}

export async function listFonts(): Promise<DemoFont[]> {
  const response = await fetch(`${API_BASE_URL}/fonts?limit=40`);
  const data = await readJson(response);
  return data.fonts || [];
}

export async function searchIcons(query: string): Promise<DemoIcon[]> {
  const response = await fetch(`${API_BASE_URL}/icons/search?q=${encodeURIComponent(query)}&limit=30`);
  const data = await readJson(response);
  return data.icons || [];
}

export async function getPalette(hex: string): Promise<DemoColor[]> {
  const cleanHex = hex.replace("#", "");
  const response = await fetch(`${API_BASE_URL}/colors/palette?hex=${encodeURIComponent(cleanHex)}&mode=analogic&count=6`);
  const data = await readJson(response);
  return data.palette || [];
}

async function readJson(response: Response) {
  if (!response.ok) {
    throw new Error(`API request failed with ${response.status}`);
  }

  return response.json();
}
