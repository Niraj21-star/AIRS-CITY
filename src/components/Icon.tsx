import type { DistrictId } from '../data/districts';

export type IconName = DistrictId | 'arrow' | 'close' | 'sound' | 'mute' | 'map' | 'plus' | 'minus' | 'target' | 'chevron' | 'check' | 'help' | 'back' | 'expand';
const paths: Record<IconName, React.ReactNode> = {
  hq: <><path d="M5 20V9l7-5 7 5v11M9 20v-6h6v6M3 20h18M9 9h6"/><path d="M12 4V1"/></>,
  research: <><path d="m9 3-1 6-5 9a2 2 0 0 0 2 3h14a2 2 0 0 0 2-3l-5-9-1-6M8 3h8M7 14h10"/><path d="M10 17h.01M14 18h.01"/></>,
  garage: <><path d="m3 9 9-6 9 6v11H3ZM7 20V10h10v10M7 14h10M7 17h10"/></>,
  arena: <><path d="M5 4h14v5a7 7 0 0 1-14 0ZM5 6H2v3a4 4 0 0 0 4 4M19 6h3v3a4 4 0 0 1-4 4M12 16v5M8 21h8"/></>,
  crew: <><circle cx="12" cy="7" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3M5 5a3 3 0 0 0 0 6M19 5a3 3 0 0 1 0 6M2 19v-2a4 4 0 0 1 3-4M22 19v-2a4 4 0 0 0-3-4"/></>,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  sound: <><path d="m11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8M18 4a11 11 0 0 1 0 16"/></>,
  mute: <><path d="m11 4-6 5H2v6h3l6 5ZM16 9l6 6M22 9l-6 6"/></>,
  map: <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2ZM9 3v16M15 5v16"/>,
  plus: <path d="M12 5v14M5 12h14"/>, minus: <path d="M5 12h14"/>,
  target: <><circle cx="12" cy="12" r="6"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/></>,
  chevron: <path d="m9 5 7 7-7 7"/>, check: <path d="m5 12 4 4L19 6"/>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.5 1-1.5 1.5-1.5 3M12 17h.01"/></>,
  back: <path d="M20 12H4m6-6-6 6 6 6"/>,
  expand: <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5"/>,
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function AirsMark() {
  return <svg className="airs-mark" width="39" height="37" viewBox="0 0 42 40" fill="none" aria-hidden="true"><path d="M2 36 19 4h5l17 32H30L21.5 19 13 36H2Z" fill="currentColor"/><path d="M18 29h7v7h-7z" fill="currentColor"/></svg>;
}
