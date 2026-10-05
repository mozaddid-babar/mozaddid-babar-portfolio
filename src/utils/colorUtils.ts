/**
 * Converts any CSS OKLCH color string into standard sRGB rgb() or rgba().
 * This provides 100% compatibility with html2canvas and older PDF engines
 * which throw "Attempting to parse an unsupported color function oklch".
 */

// In-memory memoization cache for rapid repeated color conversions
const colorCache = new Map<string, string>();

export function oklchToRgb(oklchStr: string): string {
  if (!oklchStr || !oklchStr.includes('oklch')) return oklchStr;
  
  const trimmed = oklchStr.trim();
  if (colorCache.has(trimmed)) {
    return colorCache.get(trimmed)!;
  }

  // 1. If in a browser environment, use native canvas 2D context for ultra-accurate hardware color rendering
  if (typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillStyle = trimmed;
        if (ctx.fillStyle && !ctx.fillStyle.includes('oklch')) {
          colorCache.set(trimmed, ctx.fillStyle);
          return ctx.fillStyle;
        }
      }
    } catch {
      // Fallback to mathematical converter below
    }
  }

  // 2. Pure mathematical conversion from OKLCH -> OKLab -> Linear sRGB -> Gamma-encoded sRGB
  try {
    const match = trimmed.match(
      /oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+%?))?\s*\)/i
    );
    if (!match) return trimmed;

    const [, lStr, cStr, hStr, aStr] = match;
    let L = parseFloat(lStr);
    if (trimmed.includes(lStr + '%') || L > 1) {
      L /= 100;
    }
    const C = parseFloat(cStr);
    const H = (parseFloat(hStr) * Math.PI) / 180;
    const alpha = aStr
      ? aStr.includes('%')
        ? parseFloat(aStr) / 100
        : parseFloat(aStr)
      : 1;

    const a = C * Math.cos(H);
    const b = C * Math.sin(H);

    // OKLab to linear LMS
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

    const l = l_ * l_ * l_;
    const mo = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    // Linear LMS to Linear sRGB
    const rLin = +4.0767434057 * l - 3.3077115913 * mo + 0.2309699291 * s;
    const gLin = -1.2684380046 * l + 2.6097574011 * mo - 0.3413193965 * s;
    const bLin = -0.0041960863 * l - 0.7034186147 * mo + 1.7076147010 * s;

    // Linear sRGB to standard gamma sRGB
    const gamma = (val: number) => {
      const clamped = Math.max(0, Math.min(1, val));
      return clamped <= 0.0031308
        ? 12.92 * clamped
        : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
    };

    const R = Math.round(gamma(rLin) * 255);
    const G = Math.round(gamma(gLin) * 255);
    const B = Math.round(gamma(bLin) * 255);

    const converted =
      alpha < 1
        ? `rgba(${R}, ${G}, ${B}, ${alpha})`
        : `rgb(${R}, ${G}, ${B})`;

    colorCache.set(trimmed, converted);
    return converted;
  } catch {
    return trimmed;
  }
}

/**
 * Replaces all occurrences of oklch(...) inside CSS text or inline style attributes.
 */
export function replaceOklchInString(cssText: string): string {
  if (!cssText || !cssText.includes('oklch')) return cssText;
  return cssText.replace(/oklch\([^)]+\)/gi, match => oklchToRgb(match));
}
