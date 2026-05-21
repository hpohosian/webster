import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

@Injectable()
export class IntegrationsService {
  constructor(private readonly configService: ConfigService) {}

  health() {
    return {
      ok: true,
      services: {
        unsplash: this.hasRealKey(this.unsplashAccessKey),
        googleFonts: this.hasRealKey(this.googleFontsApiKey),
        iconify: true,
        colorApi: true,
      },
    };
  }

  async searchImages(rawQuery?: string): Promise<{ query: string; images: DemoImage[] }> {
    const query = rawQuery?.trim() || 'design';

    if (!this.hasRealKey(this.unsplashAccessKey)) {
      return { query, images: this.fallbackImages(query) };
    }

    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.set('query', query);
    url.searchParams.set('per_page', '8');
    url.searchParams.set('orientation', 'landscape');

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${this.unsplashAccessKey}`,
          'Accept-Version': 'v1',
        },
      });

      if (!response.ok) {
        return { query, images: this.fallbackImages(query) };
      }

      const data = await response.json();
      const images = (data.results || []).map((item: any): DemoImage => ({
        id: item.id,
        alt: item.alt_description || item.description || query,
        thumb: item.urls?.thumb,
        regular: item.urls?.regular,
        author: item.user?.name,
        link: item.links?.html,
      }));

      return { query, images };
    } catch {
      return { query, images: this.fallbackImages(query) };
    }
  }

  async listFonts(rawLimit?: string): Promise<{ fonts: DemoFont[] }> {
    const limit = this.clamp(Number(rawLimit || 40), 1, 100);

    if (!this.hasRealKey(this.googleFontsApiKey)) {
      return { fonts: this.fallbackFonts().slice(0, limit) };
    }

    const url = new URL('https://www.googleapis.com/webfonts/v1/webfonts');
    url.searchParams.set('key', this.googleFontsApiKey);
    url.searchParams.set('sort', 'popularity');

    try {
      const response = await fetch(url);

      if (!response.ok) {
        return { fonts: this.fallbackFonts().slice(0, limit) };
      }

      const data = await response.json();
      const fonts = (data.items || []).slice(0, limit).map((font: any): DemoFont => ({
        family: font.family,
        category: font.category,
        variants: font.variants,
      }));

      return { fonts };
    } catch {
      return { fonts: this.fallbackFonts().slice(0, limit) };
    }
  }

  async searchIcons(rawQuery?: string, rawLimit?: string): Promise<{ query: string; icons: DemoIcon[] }> {
    const query = rawQuery?.trim() || 'logo';
    const limit = this.clamp(Number(rawLimit || 32), 1, 50);
    const iconifyLimit = Math.max(32, limit);

    const url = new URL('/search', this.iconifyApiBaseUrl);
    url.searchParams.set('query', query);
    url.searchParams.set('limit', String(iconifyLimit));
    url.searchParams.set('prefixes', this.iconifyPrefixes);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        return { query, icons: this.fallbackIcons(query).slice(0, limit) };
      }

      const data = await response.json();
      const iconIds = Array.isArray(data.icons) ? data.icons.slice(0, limit) : [];
      const icons = await Promise.all(iconIds.map((iconId: string) => this.mapIconifyIcon(iconId)));
      const availableIcons = icons.filter(Boolean) as DemoIcon[];

      return {
        query,
        icons: availableIcons.length ? availableIcons : this.fallbackIcons(query).slice(0, limit),
      };
    } catch {
      return { query, icons: this.fallbackIcons(query).slice(0, limit) };
    }
  }

  async getPalette(
    rawHex?: string,
    rawMode?: string,
    rawCount?: string,
  ): Promise<{ hex: string; mode: string; palette: DemoColor[] }> {
    const hex = this.sanitizeHex(rawHex || '454fda');
    const mode = rawMode || 'analogic';
    const count = this.clamp(Number(rawCount || 6), 3, 12);

    const url = new URL('/scheme', this.colorApiBaseUrl);
    url.searchParams.set('hex', hex);
    url.searchParams.set('mode', mode);
    url.searchParams.set('count', String(count));

    try {
      const response = await fetch(url);

      if (!response.ok) {
        return { hex, mode, palette: this.fallbackPalette(hex) };
      }

      const data = await response.json();
      const palette = (data.colors || []).map((color: any): DemoColor => ({
        hex: color.hex?.value,
        name: color.name?.value,
      }));

      return { hex, mode, palette };
    } catch {
      return { hex, mode, palette: this.fallbackPalette(hex) };
    }
  }

  private get unsplashAccessKey() {
    return this.configService.get<string>('UNSPLASH_ACCESS_KEY') || '';
  }

  private get googleFontsApiKey() {
    return this.configService.get<string>('GOOGLE_FONTS_API_KEY') || '';
  }

  private get colorApiBaseUrl() {
    return this.configService.get<string>('COLOR_API_BASE_URL') || 'https://www.thecolorapi.com';
  }

  private get iconifyApiBaseUrl() {
    return this.configService.get<string>('ICONIFY_API_BASE_URL') || 'https://api.iconify.design';
  }

  private get iconifyPrefixes() {
    return this.configService.get<string>('ICONIFY_PREFIXES') || 'mdi,ph,lucide,tabler,carbon,heroicons,solar';
  }

  private async mapIconifyIcon(iconId: string): Promise<DemoIcon | null> {
    const [prefix, name] = iconId.split(':');
    if (!prefix || !name) return null;

    const url = new URL(`/${prefix}/${name}.svg`, this.iconifyApiBaseUrl);
    url.searchParams.set('height', 'none');

    const svg = await this.fetchSvg(url.toString());
    if (!svg) return null;

    return {
      id: iconId,
      label: name.replace(/[-_]/g, ' '),
      svg,
      source: `Iconify / ${prefix}`,
    };
  }

  private async fetchSvg(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'image/svg+xml,text/plain,*/*' },
      });

      if (!response.ok) return null;

      const svg = await response.text();
      if (!svg.includes('<svg')) return null;

      return this.cleanSvg(svg);
    } catch {
      return null;
    }
  }

  private cleanSvg(svg: string) {
    return svg
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/\son[a-z]+="[^"]*"/gi, '')
      .replace(/\son[a-z]+='[^']*'/gi, '');
  }

  private fallbackImages(query: string): DemoImage[] {
    const label = encodeURIComponent(query);

    return [
      {
        id: 'demo-forest',
        alt: `${query} forest`,
        thumb: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=240&q=60&demo=${label}`,
        regular: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
        author: 'Demo image',
        link: 'https://unsplash.com',
      },
      {
        id: 'demo-desk',
        alt: `${query} desk`,
        thumb: `https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=240&q=60&demo=${label}`,
        regular: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
        author: 'Demo image',
        link: 'https://unsplash.com',
      },
      {
        id: 'demo-city',
        alt: `${query} city`,
        thumb: `https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=240&q=60&demo=${label}`,
        regular: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
        author: 'Demo image',
        link: 'https://unsplash.com',
      },
    ];
  }

  private fallbackFonts(): DemoFont[] {
    return [
      { family: 'Inter', category: 'sans-serif', variants: ['regular', '500', '700'] },
      { family: 'Roboto', category: 'sans-serif', variants: ['regular', '500', '700'] },
      { family: 'Montserrat', category: 'sans-serif', variants: ['regular', '600', '700'] },
      { family: 'Playfair Display', category: 'serif', variants: ['regular', '700'] },
      { family: 'Merriweather', category: 'serif', variants: ['regular', '700'] },
      { family: 'Poppins', category: 'sans-serif', variants: ['regular', '600', '700'] },
      { family: 'Oswald', category: 'sans-serif', variants: ['regular', '500', '700'] },
      { family: 'Lora', category: 'serif', variants: ['regular', '700'] },
    ];
  }

  private fallbackIcons(query: string): DemoIcon[] {
    const normalized = query.toLowerCase();
    const icons: DemoIcon[] = [
      {
        id: 'fallback-spark',
        label: 'Spark',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/></svg>',
        source: 'Fallback',
      },
      {
        id: 'fallback-leaf',
        label: 'Leaf',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c8 0 14-6 14-14C11 5 5 11 5 19z"/><path d="M5 19c3-5 6-8 11-11"/></svg>',
        source: 'Fallback',
      },
      {
        id: 'fallback-bolt',
        label: 'Bolt',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 10-13h-7l0-7z"/></svg>',
        source: 'Fallback',
      },
      {
        id: 'fallback-heart',
        label: 'Heart',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6z"/></svg>',
        source: 'Fallback',
      },
      {
        id: 'fallback-camera',
        label: 'Camera',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h4l2-3h4l2 3h4v11H4V8z"/><circle cx="12" cy="13.5" r="3.5"/></svg>',
        source: 'Fallback',
      },
      {
        id: 'fallback-crown',
        label: 'Crown',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l5 5 4-8 4 8 5-5-2 12H5L3 7z"/><path d="M5 19h14"/></svg>',
        source: 'Fallback',
      },
    ];

    const matches = icons.filter((icon) => icon.label.toLowerCase().includes(normalized));
    return matches.length ? matches : icons;
  }

  private fallbackPalette(hex: string): DemoColor[] {
    return [
      { hex: `#${hex}`, name: 'Selected' },
      { hex: '#0f0f14', name: 'Ink' },
      { hex: '#e5e5e7', name: 'Mist' },
      { hex: '#ef4444', name: 'Signal' },
      { hex: '#22c55e', name: 'Fresh' },
      { hex: '#f59e0b', name: 'Amber' },
    ];
  }

  private sanitizeHex(hex: string) {
    return hex.replace('#', '').replace(/[^a-fA-F0-9]/g, '').slice(0, 6) || '454fda';
  }

  private clamp(value: number, min: number, max: number) {
    if (Number.isNaN(value)) return min;
    return Math.min(max, Math.max(min, value));
  }

  private hasRealKey(value: string) {
    return Boolean(value && !value.toLowerCase().startsWith('your_'));
  }
}
