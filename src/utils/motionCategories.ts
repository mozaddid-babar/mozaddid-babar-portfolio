import { SectionMotionCategory, SectionHoverEffect } from '../types';

export interface MotionCategoryMeta {
  id: SectionMotionCategory;
  name: string;
  tag: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconName: string;
  previewSummary: string;
}

export interface HoverEffectMeta {
  id: SectionHoverEffect;
  name: string;
  tag: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
}

export const MOTION_CATEGORIES: MotionCategoryMeta[] = [
  {
    id: 'opposite-angles',
    name: '3D Opposite Angles (Parallel Split)',
    tag: 'Converging 3D',
    description: 'Two parallel columns or cards enter from opposite 3D angles (left & right) and converge smoothly as you scroll.',
    badgeBg: 'bg-rose-950/60 dark:bg-rose-950/80',
    badgeText: 'text-rose-300 dark:text-rose-200',
    borderColor: 'border-rose-500/40',
    iconName: 'Split',
    previewSummary: 'Left: -75px/rotateY:15° ⇄ Right: +75px/rotateY:-15°'
  },
  {
    id: 'stacked-deck',
    name: '3D Stacked Deck (Overlapping Cascade)',
    tag: 'Deck Stacking',
    description: 'Cards slide and stack over one after another with 3D depth, progressive elevation, and scroll-responsive flow.',
    badgeBg: 'bg-amber-950/60 dark:bg-amber-950/80',
    badgeText: 'text-amber-300 dark:text-amber-200',
    borderColor: 'border-amber-500/40',
    iconName: 'Layers',
    previewSummary: 'scale: 0.92 ➔ 1.0, y: +60px, multi-layer depth'
  },
  {
    id: 'epic-bidirectional',
    name: 'Epic Agency Fluid (Bidirectional)',
    tag: 'Epic.net Style',
    description: 'Fluid continuous reveal inspired by epic.net: sections and cards smoothly appear and disappear with scrolling in both directions.',
    badgeBg: 'bg-emerald-950/60 dark:bg-emerald-950/80',
    badgeText: 'text-emerald-300 dark:text-emerald-200',
    borderColor: 'border-emerald-500/40',
    iconName: 'Zap',
    previewSummary: 'Continuous scroll appear & disappear with 3D float'
  },
  {
    id: 'perspective-flip',
    name: '3D Perspective Flip',
    tag: 'Dramatic 3D',
    description: 'Swings upright along the 3D X-axis with cinematic perspective depth and smooth specular highlight.',
    badgeBg: 'bg-indigo-950/60 dark:bg-indigo-950/80',
    badgeText: 'text-indigo-300 dark:text-indigo-200',
    borderColor: 'border-indigo-500/40',
    iconName: 'Sparkles',
    previewSummary: 'rotateX: 28° ➔ 0° with 1200px perspective'
  },
  {
    id: 'isometric-drift',
    name: '3D Isometric Drift',
    tag: 'Angled Plane',
    description: 'Glides gracefully from an angled 3D plane into perfect alignment with realistic dimensional depth.',
    badgeBg: 'bg-cyan-950/60 dark:bg-cyan-950/80',
    badgeText: 'text-cyan-300 dark:text-cyan-200',
    borderColor: 'border-cyan-500/40',
    iconName: 'Compass',
    previewSummary: 'rotateX: 16°, rotateY: -14° isometric glide'
  },
  {
    id: 'depth-zoom',
    name: 'Cinematic Depth Zoom',
    tag: 'Deep Focus',
    description: 'Dolly-zooms from deep Z-space into crisp sharpness with a focal blur reveal.',
    badgeBg: 'bg-emerald-950/60 dark:bg-emerald-950/80',
    badgeText: 'text-emerald-300 dark:text-emerald-200',
    borderColor: 'border-emerald-500/40',
    iconName: 'Layers',
    previewSummary: 'scale: 0.86, blur: 6px ➔ 0px crisp focus'
  },
  {
    id: 'origami-fold',
    name: '3D Origami Unfold',
    tag: 'Architectural',
    description: 'Unfolds gracefully from the top edge like luxury portfolio sheets or architectural folios.',
    badgeBg: 'bg-amber-950/60 dark:bg-amber-950/80',
    badgeText: 'text-amber-300 dark:text-amber-200',
    borderColor: 'border-amber-500/40',
    iconName: 'BookOpen',
    previewSummary: 'rotateX: -32° top-hinged unfold'
  },
  {
    id: 'cascade-stagger',
    name: '3D Cascade Stagger',
    tag: 'Multi-Layer',
    description: 'Renders in a dynamic multi-layered cascade with subtle micro-rotations and dimensional elevation.',
    badgeBg: 'bg-purple-950/60 dark:bg-purple-950/80',
    badgeText: 'text-purple-300 dark:text-purple-200',
    borderColor: 'border-purple-500/40',
    iconName: 'Workflow',
    previewSummary: 'rotateZ: -1.5° ➔ 0° with multi-layer rise'
  },
  {
    id: 'matrix-glissade',
    name: 'Sleek Matrix Glissade',
    tag: 'Tech Minimal',
    description: 'Glides along a diagonal 3D trajectory with modern tech-minimalist styling and clean edge.',
    badgeBg: 'bg-blue-950/60 dark:bg-blue-950/80',
    badgeText: 'text-blue-300 dark:text-blue-200',
    borderColor: 'border-blue-500/40',
    iconName: 'Cpu',
    previewSummary: 'rotateY: 16°, rotateX: 8° diagonal slide'
  },
  {
    id: 'subtle-elevation',
    name: 'Executive 3D Float',
    tag: 'Subtle Elegant',
    description: 'Ultra-refined vertical elevation with soft ambient shadows tailored for understated executive prestige.',
    badgeBg: 'bg-slate-800/80 dark:bg-slate-800/90',
    badgeText: 'text-slate-300 dark:text-slate-200',
    borderColor: 'border-slate-600/40',
    iconName: 'Shield',
    previewSummary: 'y: 40px ➔ 0px with executive cubic-bezier'
  }
];

export const HOVER_EFFECTS: HoverEffectMeta[] = [
  {
    id: 'tilt-3d',
    name: '3D Interactive Tilt',
    tag: 'Magnetic 3D',
    description: 'Cards and sections track cursor motion with realistic 3D perspective tilt and subtle specular glare.',
    badgeBg: 'bg-brand-950/60 dark:bg-brand-950/80',
    badgeText: 'text-brand-300 dark:text-brand-200',
    iconName: 'MousePointer'
  },
  {
    id: 'lift-float',
    name: 'Dynamic Lift & Float',
    tag: 'Elevation',
    description: 'Smoothly lifts up (-6px) on hover with an expanded multi-layer ambient shadow.',
    badgeBg: 'bg-emerald-950/60 dark:bg-emerald-950/80',
    badgeText: 'text-emerald-300 dark:text-emerald-200',
    iconName: 'ArrowUpCircle'
  },
  {
    id: 'glow-pulse',
    name: 'Ambient Glow Pulse',
    tag: 'Luminous',
    description: 'Emits a soft luminous radial glow and polished highlight around the section border on hover.',
    badgeBg: 'bg-amber-950/60 dark:bg-amber-950/80',
    badgeText: 'text-amber-300 dark:text-amber-200',
    iconName: 'Zap'
  },
  {
    id: 'magnetic',
    name: 'Magnetic Cursor Pull',
    tag: 'Physics',
    description: 'Gentle physics-based cursor attraction that subtly pulls elements towards the pointer.',
    badgeBg: 'bg-indigo-950/60 dark:bg-indigo-950/80',
    badgeText: 'text-indigo-300 dark:text-indigo-200',
    iconName: 'Magnet'
  },
  {
    id: 'none',
    name: 'Standard (No Hover 3D)',
    tag: 'Classic',
    description: 'Keeps normal component hover interactions without section-level 3D transformation.',
    badgeBg: 'bg-slate-800/60 dark:bg-slate-800/80',
    badgeText: 'text-slate-400 dark:text-slate-300',
    iconName: 'MinusCircle'
  }
];

export const MOTION_PRESETS = [
  {
    id: 'curated-dynamic',
    label: '✨ Curated Epic 3D Theme',
    description: 'Opposite angles for 2-column cards, 3D stacked deck for grids, and fluid scroll transitions'
  },
  {
    id: 'all-opposite-angles',
    label: '⚡ All Opposite Angles Converge',
    description: 'Parallel cards and columns converge from opposite angles across all sections'
  },
  {
    id: 'all-stacked-deck',
    label: '🃏 All 3D Stacked Deck',
    description: 'All cards stack over one after another with dimensional depth'
  },
  {
    id: 'all-epic-bidirectional',
    label: '🌊 All Epic Agency Fluid',
    description: 'Fluid bidirectional scroll appearance and disappearance across all sections'
  },
  {
    id: 'all-perspective',
    label: '🎭 All 3D Perspective Flip',
    description: 'All sections enter with dramatic 3D perspective flip'
  },
  {
    id: 'all-isometric',
    label: '📐 All 3D Isometric Drift',
    description: 'All sections glide in from modern angled isometric planes'
  },
  {
    id: 'all-depth-zoom',
    label: '🔍 All Cinematic Depth Zoom',
    description: 'All sections dolly-in from deep Z-space with crisp focus'
  },
  {
    id: 'all-origami',
    label: '📄 All 3D Origami Unfold',
    description: 'All sections unfold like luxury architectural folios'
  },
  {
    id: 'all-subtle',
    label: '👔 All Executive Subtle Float',
    description: 'Understated, ultra-clean executive rises across all sections'
  }
];
