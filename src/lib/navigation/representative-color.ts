import "server-only";

import path from "node:path";

import sharp from "sharp";

import type { CapabilityMedia } from "@/content/capabilities/types";
import type { WorkMedia } from "@/content/work/types";

import { DEFAULT_NAV_COLOR } from "./nav-region-colors";

type HslColor = {
  hue: number;
  lightness: number;
  saturation: number;
};

const representativeColorCache = new Map<string, Promise<string>>();

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function rgbToHsl(red: number, green: number, blue: number): HslColor {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const maximum = Math.max(r, g, b);
  const minimum = Math.min(r, g, b);
  const delta = maximum - minimum;
  const lightness = (maximum + minimum) / 2;

  if (delta === 0) {
    return { hue: 0, lightness, saturation: 0 };
  }

  const saturation =
    delta / (1 - Math.abs(2 * lightness - 1));
  let hue: number;

  if (maximum === r) {
    hue = 60 * (((g - b) / delta) % 6);
  } else if (maximum === g) {
    hue = 60 * ((b - r) / delta + 2);
  } else {
    hue = 60 * ((r - g) / delta + 4);
  }

  return {
    hue: hue < 0 ? hue + 360 : hue,
    lightness,
    saturation,
  };
}

function hslToHex({ hue, lightness, saturation }: HslColor) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const segment = hue / 60;
  const secondary = chroma * (1 - Math.abs((segment % 2) - 1));
  let red = 0;
  let green = 0;
  let blue = 0;

  if (segment < 1) {
    red = chroma;
    green = secondary;
  } else if (segment < 2) {
    red = secondary;
    green = chroma;
  } else if (segment < 3) {
    green = chroma;
    blue = secondary;
  } else if (segment < 4) {
    green = secondary;
    blue = chroma;
  } else if (segment < 5) {
    red = secondary;
    blue = chroma;
  } else {
    red = chroma;
    blue = secondary;
  }

  const match = lightness - chroma / 2;
  const channelToHex = (channel: number) =>
    Math.round((channel + match) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${channelToHex(red)}${channelToHex(green)}${channelToHex(blue)}`;
}

function normalizeForNavigation(red: number, green: number, blue: number) {
  const source = rgbToHsl(red, green, blue);
  const saturation =
    source.saturation < 0.06
      ? clamp(source.saturation, 0.025, 0.06)
      : clamp(source.saturation * 1.35, 0.16, 0.36);
  const lightness = clamp(0.14 + source.lightness * 0.09, 0.15, 0.22);

  return hslToHex({
    hue: source.hue,
    lightness,
    saturation,
  });
}

async function sampleRepresentativeColor(source: string, fallback: string) {
  if (!source.startsWith("/")) {
    return fallback;
  }

  const publicRoot = path.resolve(process.cwd(), "public");
  const absolutePath = path.resolve(publicRoot, source.replace(/^\/+/, ""));

  if (!absolutePath.startsWith(`${publicRoot}${path.sep}`)) {
    return fallback;
  }

  try {
    const statistics = await sharp(absolutePath)
      .resize(48, 48, { fit: "inside", withoutEnlargement: true })
      .removeAlpha()
      .stats();
    const [red, green, blue] = statistics.channels;

    if (!red || !green || !blue) {
      return fallback;
    }

    return normalizeForNavigation(red.mean, green.mean, blue.mean);
  } catch {
    return fallback;
  }
}

export function getRepresentativeNavColor(
  source: string | undefined,
  fallback: string = DEFAULT_NAV_COLOR,
) {
  if (!source) {
    return Promise.resolve(fallback);
  }

  const cacheKey = `${source}|${fallback}`;
  const cached = representativeColorCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const pending = sampleRepresentativeColor(source, fallback);
  representativeColorCache.set(cacheKey, pending);
  return pending;
}

export function getWorkMediaColorSource(media: WorkMedia) {
  return media.kind === "video" ? media.poster.src : media.src;
}

export function getCapabilityMediaColorSource(
  media: CapabilityMedia,
): string | undefined {
  if (media.type === "video") {
    return media.poster.src;
  }

  if (media.type === "image") {
    return media.src;
  }

  if (media.type === "interactive") {
    return getCapabilityMediaColorSource(media.fallback);
  }

  return undefined;
}
