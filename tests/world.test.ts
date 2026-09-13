import test from 'node:test';
import assert from 'node:assert/strict';
import { districts } from '../src/data/districts.ts';
import {
  cameraAt, clampCamera, districtIds, initialWorld, parseRoute, readProgress,
  routeHash, worldReducer, type Action, type Route,
} from '../src/store/world.ts';

const start = (hash = '#/city', progress = readProgress(null)) => initialWorld(parseRoute(hash), progress);
const saved = (data: unknown) => readProgress({ getItem: () => JSON.stringify(data) });
const viewports = [[390, 844], [768, 1024], [1366, 768], [1440, 900], [1920, 1080]];

test('canonical city, district, and mission routes round-trip through hashes', () => {
  assert.deepEqual(districtIds, ['hq', 'research', 'garage', 'arena', 'crew']);
  const routes: Route[] = [{ level: 'CITY', district: null }];
  for (const district of districtIds) {
    routes.push({ level: 'DISTRICT', district }, { level: 'CONTENT', district });
    assert.equal(routeHash({ level: 'DISTRICT', district }), `#/${district}`);
    assert.equal(routeHash({ level: 'CONTENT', district }), `#/${district}/mission`);
  }
  assert.equal(routeHash(routes[0]), '#/city');
  for (const route of routes) assert.deepEqual(parseRoute(routeHash(route)), route);
  assert.deepEqual(parseRoute('#hq'), { level: 'DISTRICT', district: 'hq' });
  assert.deepEqual(parseRoute('#hq/mission'), { level: 'CONTENT', district: 'hq' });
});

test('empty and invalid district paths safely fall back to the city', () => {
  for (const hash of ['', '#', '#/', '#/city', '#/unknown', '#/unknown/mission', '#//hq', '#/HQ', '#/../hq']) {
    assert.deepEqual(parseRoute(hash), { level: 'CITY', district: null }, hash);
    assert.equal(routeHash(parseRoute(hash)), '#/city');
  }
  assert.deepEqual(parseRoute('#/hq/'), { level: 'DISTRICT', district: 'hq' });
  assert.deepEqual(parseRoute('#/hq/unknown'), { level: 'DISTRICT', district: 'hq' });
});

test('a fresh city starts safely and intro/audio actions preserve progress', () => {
  const initial = start();
  assert.deepEqual(initial, {
    level: 'CITY', district: null, selected: 'hq', discovered: [],
    originComplete: false, chapter: 0, introComplete: false,
    isTransitioning: false, transitionTo: null, audioEnabled: false,
  });
  assert.strictEqual(worldReducer(initial, { type: 'ARRIVE' }), initial);
  assert.strictEqual(worldReducer(initial, { type: 'OPEN_CONTENT' }), initial);
  assert.deepEqual(worldReducer(initial, { type: 'CLOSE_CONTENT' }), initial);
  const introduced = worldReducer(initial, { type: 'INTRO_COMPLETE' });
  assert.deepEqual(introduced, { ...initial, introComplete: true });
  const audible = worldReducer(introduced, { type: 'AUDIO', enabled: true });
  assert.deepEqual(audible, { ...introduced, audioEnabled: true });
  assert.deepEqual(worldReducer(audible, { type: 'AUDIO', enabled: false }), introduced);
});

test('City -> HQ -> Content -> complete -> City retains the completed mission', () => {
  let state = worldReducer(start(), { type: 'INTRO_COMPLETE' });
  state = worldReducer(state, { type: 'SELECT', id: 'hq' });
  state = worldReducer(state, { type: 'TRAVEL', id: 'hq' });
  assert.equal(routeHash(state), '#/city');
  assert.equal(state.isTransitioning, true);
  assert.equal(state.transitionTo, 'hq');
  assert.deepEqual(state.discovered, []);
  state = worldReducer(state, { type: 'ARRIVE' });
  assert.equal(routeHash(state), '#/hq');
  assert.equal(state.selected, 'hq');
  assert.equal(state.isTransitioning, false);
  assert.equal(state.transitionTo, null);
  assert.deepEqual(state.discovered, ['hq']);
  state = worldReducer(state, { type: 'OPEN_CONTENT' });
  assert.equal(routeHash(state), '#/hq/mission');
  assert.equal(state.chapter, 0);
  for (const chapter of [1, 2, 3]) {
    state = worldReducer(state, { type: 'CHAPTER', chapter });
    assert.equal(state.chapter, chapter);
    assert.equal(state.originComplete, false);
  }
  state = worldReducer(state, { type: 'COMPLETE_ORIGIN' });
  assert.equal(state.chapter, 4);
  assert.equal(state.originComplete, true);
  assert.equal(state.level, 'CONTENT');
  assert.strictEqual(worldReducer(state, { type: 'COMPLETE_ORIGIN' }), state);
  state = worldReducer(state, { type: 'TRAVEL', id: 'city' });
  assert.equal(state.transitionTo, 'city');
  state = worldReducer(state, { type: 'ARRIVE' });
  assert.deepEqual(state, {
    ...start(), selected: 'hq', introComplete: true, discovered: ['hq'],
    originComplete: true, chapter: 4,
  });
  assert.equal(routeHash(state), '#/city');
  const restored = start('#/city', saved(state));
  assert.deepEqual(restored.discovered, ['hq']);
  assert.equal(restored.originComplete, true);
  assert.equal(restored.chapter, 4);
});

test('double-clicks cannot replace a pending trip or open content in transit', () => {
  const initial = start('#/hq');
  const traveling = worldReducer(initial, { type: 'TRAVEL', id: 'research' });
  const blocked: Action[] = [
    { type: 'TRAVEL', id: 'research' }, { type: 'TRAVEL', id: 'garage' },
    { type: 'TRAVEL', id: 'city' }, { type: 'SELECT', id: 'crew' }, { type: 'OPEN_CONTENT' },
  ];
  for (const action of blocked) assert.strictEqual(worldReducer(traveling, action), traveling);
  const arrived = worldReducer(traveling, { type: 'ARRIVE' });
  assert.equal(arrived.district, 'research');
  assert.equal(arrived.selected, 'research');
  assert.equal(arrived.isTransitioning, false);
  assert.equal(arrived.transitionTo, null);
  assert.strictEqual(worldReducer(arrived, { type: 'ARRIVE' }), arrived);
  assert.equal(worldReducer(arrived, { type: 'SELECT', id: 'crew' }).selected, 'crew');
  assert.equal(worldReducer(arrived, { type: 'TRAVEL', id: 'city' }).transitionTo, 'city');
  assert.equal(initial.isTransitioning, false);
});

test('origin completion requires HQ content at the last chapter', () => {
  for (const hash of ['#/city', '#/hq', '#/research/mission']) {
    const state = worldReducer(start(hash), { type: 'CHAPTER', chapter: 3 });
    assert.strictEqual(worldReducer(state, { type: 'COMPLETE_ORIGIN' }), state, hash);
  }
  for (const chapter of [0, 1, 2]) {
    const state = worldReducer(start('#/hq/mission'), { type: 'CHAPTER', chapter });
    assert.strictEqual(worldReducer(state, { type: 'COMPLETE_ORIGIN' }), state);
  }
});

for (const district of districtIds) {
  test(`direct ${district} mission links bypass intro and discover their destination`, () => {
    const state = start(`#/${district}/mission`);
    assert.deepEqual(state, {
      ...start(), level: 'CONTENT', district, selected: district,
      discovered: [district], introComplete: true,
    });
    assert.equal(routeHash(state), `#/${district}/mission`);
    assert.equal(routeHash(worldReducer(state, { type: 'CLOSE_CONTENT' })), `#/${district}`);
  });
}

test('history routing cancels transit and stale arrival while preserving progress', () => {
  let state = start('#/hq', saved({ discovered: ['hq'], chapter: 2, originComplete: false }));
  state = worldReducer(state, { type: 'TRAVEL', id: 'garage' });
  state = worldReducer(state, { type: 'ROUTE', route: parseRoute('#/crew/mission') });
  assert.equal(routeHash(state), '#/crew/mission');
  assert.equal(state.selected, 'crew');
  assert.equal(state.chapter, 2);
  assert.equal(state.isTransitioning, false);
  assert.equal(state.transitionTo, null);
  assert.deepEqual(state.discovered, ['hq', 'crew']);
  assert.strictEqual(worldReducer(state, { type: 'ARRIVE' }), state);
  state = worldReducer(state, { type: 'ROUTE', route: parseRoute('#/invalid') });
  assert.equal(routeHash(state), '#/city');
  assert.equal(state.selected, 'crew');
  assert.equal(state.chapter, 2);
  assert.deepEqual(state.discovered, ['hq', 'crew']);
});

test('initialization, revisits, and routing deduplicate discoveries without mutating saved progress', () => {
  const progress = saved({ discovered: ['hq', 'research'], originComplete: true, chapter: 4 });
  const initial = start('#/hq', progress);
  let state = initial;
  for (const id of ['hq', 'garage', 'hq', 'garage'] as const) {
    state = worldReducer(state, { type: 'TRAVEL', id });
    state = worldReducer(state, { type: 'ARRIVE' });
    state = worldReducer(state, { type: 'ROUTE', route: parseRoute(`#/${id}/mission`) });
  }
  state = worldReducer(state, { type: 'TRAVEL', id: 'city' });
  state = worldReducer(state, { type: 'ARRIVE' });
  assert.deepEqual(state.discovered, ['hq', 'research', 'garage']);
  assert.equal(state.originComplete, true);
  assert.equal(state.chapter, 4);
  assert.deepEqual(initial.discovered, ['hq', 'research']);
  assert.deepEqual(progress, { discovered: ['hq', 'research'], originComplete: true, chapter: 4 });
});

test('an unfinished chapter resumes after closing, navigating, and reloading', () => {
  let state = start('#/hq/mission');
  state = worldReducer(state, { type: 'CHAPTER', chapter: 2 });
  state = worldReducer(state, { type: 'CLOSE_CONTENT' });
  state = worldReducer(state, { type: 'OPEN_CONTENT' });
  assert.equal(state.chapter, 2);
  state = worldReducer(state, { type: 'ROUTE', route: parseRoute('#/city') });
  state = start('#/hq', saved(state));
  state = worldReducer(state, { type: 'OPEN_CONTENT' });
  assert.equal(state.level, 'CONTENT');
  assert.equal(state.chapter, 2);
  assert.equal(state.originComplete, false);
  assert.equal(start('#/hq/mission', saved(state)).chapter, 2);
});

test('reopening a completed mission replays from zero without losing completion', () => {
  let state = start('#/hq/mission', saved({ discovered: ['hq'], originComplete: true, chapter: 4 }));
  assert.equal(state.chapter, 4);
  state = worldReducer(state, { type: 'CLOSE_CONTENT' });
  state = worldReducer(state, { type: 'OPEN_CONTENT' });
  assert.equal(state.chapter, 0);
  assert.equal(state.originComplete, true);
  assert.deepEqual(state.discovered, ['hq']);
});

test('chapter actions clamp to readable chapters, floor fractions, and ignore non-finite values', () => {
  const state = start('#/hq/mission');
  for (const [chapter, expected] of [[-20, 0], [-0.5, 0], [0, 0], [1, 1], [2.9, 2], [3, 3], [4, 3], [99, 3]]) {
    assert.deepEqual(worldReducer(state, { type: 'CHAPTER', chapter }), { ...state, chapter: expected });
  }
  for (const chapter of [NaN, Infinity, -Infinity]) {
    assert.strictEqual(worldReducer(state, { type: 'CHAPTER', chapter }), state);
  }
});

test('saved progress filters unknown/duplicate discoveries and requires literal completion', () => {
  let requestedKey = '';
  const progress = readProgress({ getItem: key => {
    requestedKey = key;
    return JSON.stringify({ discovered: ['crew', 'hq', 'crew', 'unknown', 1, null, 'HQ'], originComplete: true, chapter: 2 });
  } });
  assert.equal(requestedKey, 'airs-city-progress-v1');
  assert.deepEqual(progress, { discovered: ['hq', 'crew'], originComplete: true, chapter: 2 });
  for (const originComplete of [false, 'true', 1, null]) {
    assert.equal(saved({ originComplete }).originComplete, false);
  }
});

test('missing, malformed, and denied storage return safe defaults', () => {
  const empty = { discovered: [], originComplete: false, chapter: 0 };
  assert.deepEqual(readProgress(null), empty);
  for (const raw of [null, '', '{broken', 'null', '[]', 'false', '42', '"text"', '{}', '{"discovered":"hq","chapter":"2"}']) {
    assert.deepEqual(readProgress({ getItem: () => raw }), empty, String(raw));
  }
  assert.deepEqual(readProgress({ getItem: () => { throw new DOMException('Storage denied', 'SecurityError'); } }), empty);
});

test('saved chapter indices clamp to 0-4 and invalid values reset to zero', () => {
  for (const [chapter, expected] of [[-10, 0], [0, 0], [2, 2], [3, 3], [4, 4], [99, 4]]) {
    assert.equal(saved({ chapter, originComplete: true }).chapter, expected);
  }
  for (const chapter of [2.5, '2', null, true, {}, [], NaN, Infinity, -Infinity]) {
    assert.equal(saved({ chapter }).chapter, 0);
  }
});

for (const [width, height] of viewports) {
  test(`cameraAt centers normalized waypoints at ${width}px across map zoom levels`, () => {
    const worldHeight = Math.max(height * (width < 760 ? 1.6 : 1.08), width * 1.08 / (2600 / 1700));
    const worldWidth = worldHeight * 2600 / 1700;
    const points = [...districts.map(d => d.position), { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0.5, y: 0.5 }];
    for (const point of points) for (const scale of [1, 2.2, 3.8, 3.92]) {
      const camera = cameraAt(point, width, height, worldWidth, worldHeight, scale);
      assert.equal(camera.scale, scale);
      assert.ok(Math.abs((point.x * worldWidth * scale + camera.x) / width - 0.5) < 1e-10, `x: ${JSON.stringify({ point, scale })}`);
      assert.ok(Math.abs((point.y * worldHeight * scale + camera.y) / height - 0.5) < 1e-10, `y: ${JSON.stringify({ point, scale })}`);
    }
  });
}

test('clampCamera respects scaled bounds, preserves in-bounds positions, and does not mutate input', () => {
  for (const [width, height] of viewports) for (const scale of [1, 2.2, 3.8]) {
    const worldWidth = width * 2, worldHeight = height * 2;
    const minX = width - worldWidth * scale, minY = height - worldHeight * scale;
    for (const x of [minX - 100, minX, minX / 2, 0, 100]) for (const y of [minY - 100, minY, minY / 2, 0, 100]) {
      const input = Object.freeze({ x, y, scale });
      const result = clampCamera(input, width, height, worldWidth, worldHeight);
      assert.deepEqual(result, { x: x < minX ? minX : x > 0 ? 0 : x, y: y < minY ? minY : y > 0 ? 0 : y, scale });
      assert.deepEqual(clampCamera(result, width, height, worldWidth, worldHeight), result);
    }
  }
  for (const size of [200, 400]) {
    assert.deepEqual(clampCamera({ x: -100, y: 100, scale: 2 }, 800, 800, size, size), { x: 0, y: 0, scale: 2 });
  }
});
