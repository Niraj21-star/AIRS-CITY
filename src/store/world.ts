import type { DistrictId, Point } from '../data/districts.ts';

export const districtIds: DistrictId[] = ['hq', 'research', 'garage', 'arena', 'crew', 'joinAIRS'];
export type Route = { level: 'CITY' | 'DISTRICT' | 'CONTENT'; district: DistrictId | null };
export type WorldState = Route & {
  selected: DistrictId;
  discovered: DistrictId[];
  originComplete: boolean;
  introComplete: boolean;
  isTransitioning: boolean;
  transitionTo: DistrictId | 'city' | null;
  audioEnabled: boolean;
  chapter: number;
};
export type Action =
  | { type: 'SELECT'; id: DistrictId }
  | { type: 'TRAVEL'; id: DistrictId | 'city' }
  | { type: 'ARRIVE' }
  | { type: 'ROUTE'; route: Route }
  | { type: 'INTRO_COMPLETE' }
  | { type: 'OPEN_CONTENT' }
  | { type: 'CLOSE_CONTENT' }
  | { type: 'CHAPTER'; chapter: number }
  | { type: 'COMPLETE_ORIGIN' }
  | { type: 'AUDIO'; enabled: boolean };

export function parseRoute(hash: string): Route {
  const [raw, content] = hash.replace(/^#\/?/, '').split('/');
  if (!districtIds.includes(raw as DistrictId)) return { level: 'CITY', district: null };
  return { level: content === 'mission' ? 'CONTENT' : 'DISTRICT', district: raw as DistrictId };
}

export function routeHash(route: Route) {
  return route.level === 'CITY' ? '#/city' : `#/${route.district}${route.level === 'CONTENT' ? '/mission' : ''}`;
}

export function readProgress(storage: Pick<Storage, 'getItem'> | null) {
  try {
    const data = JSON.parse(storage?.getItem('airs-city-progress-v1') || '{}');
    return {
      discovered: districtIds.filter(id => Array.isArray(data?.discovered) && data.discovered.includes(id)),
      originComplete: data?.originComplete === true,
      chapter: Number.isInteger(data?.chapter) ? Math.max(0, Math.min(data?.originComplete === true ? 4 : 3, data.chapter)) : 0,
    };
  } catch { return { discovered: [] as DistrictId[], originComplete: false, chapter: 0 }; }
}

export function initialWorld(route: Route, progress: ReturnType<typeof readProgress>): WorldState {
  return {
    ...route, ...progress,
    discovered: route.district ? [...new Set([...progress.discovered, route.district])] : progress.discovered,
    selected: route.district || 'hq',
    introComplete: route.level !== 'CITY', isTransitioning: false, transitionTo: null,
    audioEnabled: false,
  };
}

export function worldReducer(state: WorldState, action: Action): WorldState {
  switch (action.type) {
    case 'SELECT': return state.isTransitioning ? state : { ...state, selected: action.id };
    case 'TRAVEL': return state.isTransitioning ? state : { ...state, isTransitioning: true, transitionTo: action.id };
    case 'ARRIVE': {
      if (!state.transitionTo) return state;
      const district = state.transitionTo === 'city' ? null : state.transitionTo;
      return { ...state, level: district ? 'DISTRICT' : 'CITY', district, selected: district || state.selected, isTransitioning: false, transitionTo: null, discovered: district ? [...new Set([...state.discovered, district])] : state.discovered };
    }
    case 'ROUTE': return { ...state, ...action.route, selected: action.route.district || state.selected, discovered: action.route.district ? [...new Set([...state.discovered, action.route.district])] : state.discovered, isTransitioning: false, transitionTo: null };
    case 'INTRO_COMPLETE': return { ...state, introComplete: true };
    case 'OPEN_CONTENT': return state.district && !state.isTransitioning ? { ...state, level: 'CONTENT', chapter: state.originComplete ? 0 : state.chapter } : state;
    case 'CLOSE_CONTENT': return { ...state, level: state.district ? 'DISTRICT' : 'CITY' };
    case 'CHAPTER': return Number.isFinite(action.chapter) ? { ...state, chapter: Math.max(0, Math.min(3, Math.floor(action.chapter))) } : state;
    case 'COMPLETE_ORIGIN': return state.district === 'hq' && state.level === 'CONTENT' && state.chapter === 3 ? { ...state, originComplete: true, chapter: 4 } : state;
    case 'AUDIO': return { ...state, audioEnabled: action.enabled };
  }
}

export type Camera = { x: number; y: number; scale: number };
export function cameraAt(point: Point, width: number, height: number, worldWidth: number, worldHeight: number, scale: number): Camera {
  return { x: width / 2 - point.x * worldWidth * scale, y: height / 2 - point.y * worldHeight * scale, scale };
}

export function clampCamera(camera: Camera, width: number, height: number, worldWidth: number, worldHeight: number): Camera {
  return { ...camera, x: Math.min(0, Math.max(width - worldWidth * camera.scale, camera.x)), y: Math.min(0, Math.max(height - worldHeight * camera.scale, camera.y)) };
}
