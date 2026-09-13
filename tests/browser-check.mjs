import assert from 'node:assert/strict';

export async function evaluate(session, expression) {
  const response = await session.Runtime.evaluate({ expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  return response.result.value;
}

export async function waitFor(session, condition, timeout = 4500) {
  const start = Date.now();
  while (!(await evaluate(session, condition))) {
    assert.ok(Date.now() - start < timeout, `Timed out: ${condition}`);
    await new Promise(resolve => setTimeout(resolve, 80));
  }
}

async function click(session, selector) {
  assert.ok(await evaluate(session, `(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)return false;el.click();return true})()`), `Missing control: ${selector}`);
}

async function press(session, key, modifiers = 0) {
  await session.Input.dispatchKeyEvent({ type: 'keyDown', key, code: key, modifiers });
  await session.Input.dispatchKeyEvent({ type: 'keyUp', key, code: key, modifiers });
}

async function route(session, hash) {
  await evaluate(session, `location.hash=${JSON.stringify(hash)}`);
  await new Promise(resolve => setTimeout(resolve, 650));
}

export async function checkCore(session) {
  const results = [];
  await session.Emulation.setDeviceMetricsOverride({ width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await route(session, '#/city');
  const before = await evaluate(session, `getComputedStyle(document.querySelector('.map-world')).transform`);
  await click(session, '.waypoint[aria-label^="AIRS HQ"]');
  await waitFor(session, `!!document.querySelector('.travel-overlay')`);
  await new Promise(resolve => setTimeout(resolve, 500));
  const during = await evaluate(session, `getComputedStyle(document.querySelector('.map-world')).transform`);
  assert.notEqual(during, before, 'Camera must visibly move during travel');
  assert.ok(await evaluate(session, `document.querySelector('.map-world')._gsap.target===document.querySelector('.map-world')`));
  await waitFor(session, `location.hash==='#/hq' && !document.querySelector('.travel-overlay')`);
  results.push('HQ flight changes the rendered camera transform and arrives at the correct route');
  await click(session, '.scene-copy>.primary-action');
  await waitFor(session, `!!document.querySelector('[role="dialog"]')`);
  await click(session, '.chapter-progress button');
  await evaluate(session, `document.querySelector('[aria-label="Close content"]').focus()`);
  await press(session, 'Tab', 8);
  assert.ok(await evaluate(session, `document.activeElement===document.querySelector('.content-footer button')`), 'Shift+Tab must wrap inside the mission dialog');
  await press(session, 'Tab');
  assert.ok(await evaluate(session, `document.activeElement===document.querySelector('[aria-label="Close content"]')`));
  results.push('Mission keyboard focus wraps in both directions');
  for (let i = 0; i < 4; i++) {
    await click(session, '.content-body>.primary-action');
    await new Promise(resolve => setTimeout(resolve, 80));
  }
  assert.ok(await evaluate(session, `!!document.querySelector('.mission-complete')`));
  assert.ok(await evaluate(session, `JSON.parse(localStorage.getItem('airs-city-progress-v1')).originComplete`));
  await click(session, '.mission-complete>.primary-action');
  await waitFor(session, `location.hash==='#/city' && !document.querySelector('.travel-overlay')`);
  assert.ok(await evaluate(session, `document.querySelector('.waypoint[aria-label^="AIRS HQ"]').classList.contains('discovered')`));
  results.push('All four HQ chapters complete, persist, and mark the returned location discovered');

  for (const [id, name] of [['research', 'Research District'], ['garage', 'Project Garage'], ['arena', 'Event Arena'], ['crew', 'Crew HQ']]) {
    await click(session, '.index-button');
    await waitFor(session, `!!document.querySelector('.district-index')`);
    await evaluate(session, `[...document.querySelectorAll('.district-index button')].find(e=>e.textContent.includes(${JSON.stringify(name)})).click()`);
    await waitFor(session, `location.hash==='#/${id}' && !document.querySelector('.travel-overlay')`);
    await click(session, '.scene-copy>.primary-action');
    await waitFor(session, `location.hash==='#/${id}/mission'`);
    if (id === 'research') {
      await click(session, '.research-selector button:nth-child(5)');
      assert.equal(await evaluate(session, `document.querySelector('.domain-detail h3').textContent`), 'Edge intelligence');
    } else if (id === 'garage') {
      await click(session, '.content-body>.text-action');
      assert.equal(await evaluate(session, `document.querySelectorAll('.case-format>div').length`), 6);
    } else if (id === 'arena') {
      await click(session, '.chapter-tabs button:nth-child(3)');
      assert.ok(await evaluate(session, `document.querySelector('.empty-status').textContent.includes('Hall of fame')`));
    } else {
      await click(session, '.crew-roles button:nth-child(6)');
      assert.equal(await evaluate(session, `document.querySelector('.dossier h3').textContent`), 'Alumni & community');
    }
    await press(session, 'Escape');
    await waitFor(session, `location.hash==='#/${id}'`);
    await click(session, '.minimap');
    await waitFor(session, `location.hash==='#/city' && !document.querySelector('.travel-overlay')`);
    results.push(`${name}: entry, content interaction, Escape, and mini-map return passed`);
  }

  await route(session, '#/crew/mission');
  await click(session, '.crew-roles button:nth-child(6)');
  await route(session, '#/research/mission');
  assert.equal(await evaluate(session, `document.querySelector('.domain-detail h3').textContent`), 'Machine learning');
  await route(session, '#/arena/mission');
  await click(session, '.chapter-tabs button:nth-child(3)');
  await route(session, '#/hq/mission');
  assert.ok(await evaluate(session, `!!document.querySelector('.chapter-content, .mission-complete')`));
  results.push('Direct mission-to-mission links reset district-local state without crashing');

  await route(session, '#/city');
  await click(session, '.destination-preview .text-action');
  await waitFor(session, `location.hash!=='#/city' && !document.querySelector('.travel-overlay')`);
  await click(session, '.scene-copy>.primary-action');
  await waitFor(session, `location.hash.endsWith('/mission')`);
  await evaluate(session, 'history.back()');
  await waitFor(session, `!location.hash.endsWith('/mission')`);
  await evaluate(session, 'history.back()');
  await waitFor(session, `location.hash==='#/city'`);
  await new Promise(resolve => setTimeout(resolve, 700));
  const scale = await evaluate(session, `new DOMMatrix(getComputedStyle(document.querySelector('.map-world')).transform).a`);
  assert.ok(Math.abs(scale - 1) < .01, `History must restore overview, received ${scale}`);
  results.push('Browser Back restores district, then city, including overview camera scale');
  assert.deepEqual(await evaluate(session, 'window.__airsErrors || []'), []);
  results.push('No uncaught browser errors or unhandled rejections');
  return results;
}

export async function checkResponsive(session) {
  const results = [];
  for (const [width, height] of [[390,844],[768,1024],[1366,768],[1440,900],[1920,1080]]) {
    await session.Emulation.setDeviceMetricsOverride({ width, height, deviceScaleFactor: 1, mobile: width < 760 });
    await route(session, '#/city');
    assert.ok(await evaluate(session, 'document.documentElement.scrollWidth<=innerWidth'), `${width}: horizontal document overflow`);
    const city = await evaluate(session, `(()=>{const r=document.querySelector('.destination-preview').getBoundingClientRect();return {fits:r.x>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,width:innerWidth,height:innerHeight}})()`);
    assert.ok(city.fits, `${width}: destination panel outside viewport`);
    await route(session, '#/hq');
    assert.ok(await evaluate(session, `(()=>{const r=document.querySelector('.scene-copy>.primary-action').getBoundingClientRect();return r.x>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight})()`), `${width}: HQ action not visible`);
    await click(session, '.scene-copy>.primary-action');
    await waitFor(session, `!!document.querySelector('.content-sheet')`);
    assert.ok(await evaluate(session, `(()=>{const r=document.querySelector('.content-sheet').getBoundingClientRect();return r.x>=-1&&r.right<=innerWidth+1&&r.height<=innerHeight+1})()`), `${width}: mission panel overflow`);
    results.push(`${width} x ${height}: map, district action, and mission panel fit; no page overflow`);
  }
  await session.Emulation.setEmulatedMedia({ features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await route(session, '#/city');
  const started = Date.now();
  await click(session, '.destination-preview .text-action');
  await waitFor(session, `location.hash!=='#/city' && !document.querySelector('.travel-overlay')`, 1300);
  const elapsed = Date.now() - started;
  assert.ok(elapsed < 1100, `Reduced motion trip took ${elapsed}ms`);
  results.push(`Reduced-motion crossfade arrived in ${elapsed}ms`);
  await session.Emulation.setEmulatedMedia({ features: [] });
  return results;
}
