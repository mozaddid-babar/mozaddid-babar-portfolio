import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

function oklchToRgbPlugin() {
  function oklchToRgb(str: string): string {
    const m = str.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+%?))?\s*\)/i);
    if (!m) return str;
    let [, lStr, cStr, hStr, aStr] = m;
    let L = parseFloat(lStr);
    if (str.includes(lStr + '%') || L > 1) L /= 100;
    const C = parseFloat(cStr);
    const H = (parseFloat(hStr) * Math.PI) / 180;
    let alpha = aStr ? (aStr.includes('%') ? parseFloat(aStr) / 100 : parseFloat(aStr)) : 1;

    const a = C * Math.cos(H);
    const b = C * Math.sin(H);

    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

    const l = l_ * l_ * l_;
    const mo = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    let rLin = +4.0767434057 * l - 3.3077115913 * mo + 0.2309699291 * s;
    let gLin = -1.2684380046 * l + 2.6097574011 * mo - 0.3413193965 * s;
    let bLin = -0.0041960863 * l - 0.7034186147 * mo + 1.7076147010 * s;

    const gamma = (val: number) => {
      const clamped = Math.max(0, Math.min(1, val));
      return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
    };

    const R = Math.round(gamma(rLin) * 255);
    const G = Math.round(gamma(gLin) * 255);
    const B = Math.round(gamma(bLin) * 255);

    return alpha < 1 ? `rgba(${R}, ${G}, ${B}, ${alpha})` : `rgb(${R}, ${G}, ${B})`;
  }

  function replaceOklch(code: string): string {
    if (!code || !code.includes('oklch')) return code;
    return code.replace(/oklch\([^)]+\)/gi, match => oklchToRgb(match));
  }

  return {
    name: 'vite-plugin-oklch-to-rgb',
    enforce: 'post' as const,
    transform(code: string, id: string) {
      if (id.endsWith('.css') || id.includes('.css?')) {
        return {
          code: replaceOklch(code),
          map: null,
        };
      }
    },
    generateBundle(_: any, bundle: Record<string, any>) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'asset' && typeof file.source === 'string' && file.fileName.endsWith('.css')) {
          file.source = replaceOklch(file.source);
        }
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), oklchToRgbPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
