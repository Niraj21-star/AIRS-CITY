import cityReference from '../assets/city-reference.webp';
import type { DistrictId } from './districts';

// ── Final AIRS City master map ─────────────────────────────────────────────
// 1. Drop `city-master-map.webp` into src/assets/
// 2. Replace the import below:  import cityMasterMap from '../assets/city-master-map.webp';
// 3. Replace `src: cityReference` with `src: cityMasterMap`
// 4. Update width and height to match the master map's pixel dimensions
// 5. Set isReference: false
// 6. Recalibrate district waypoint positions in districts.ts against the new map
export const cityAsset = {
  src: cityReference,
  width: 2600,
  height: 1700,
  isReference: true,
  description: 'Temporary aerial photograph of Atlanta at blue hour, by Venti Views. AIRS City master map pending.',
};

// ── District environment images ────────────────────────────────────────────
// Drop each WebP into src/assets/ and replace the null values with the import.
// Recommended: ~1600–2000 px wide, WebP or AVIF for performance.
// Expected filenames  →  suggested visual identity
//
// import hqEnvironment       from '../assets/hq-environment.webp';       // Monumental / Visionary / Institutional
// import researchEnvironment from '../assets/research-environment.webp'; // Scientific / Experimental / Precise
// import garageEnvironment   from '../assets/garage-environment.webp';   // Industrial / Engineering / Kinetic
// import arenaEnvironment    from '../assets/arena-environment.webp';    // Energetic / Social / Spectacular
// import crewEnvironment     from '../assets/crew-environment.webp';     // Human / Collaborative / Cultural
//
// After importing, replace each null below with the imported variable:
export const districtEnvironments: Record<DistrictId, string | null> = {
  hq:       null, // → hqEnvironment
  research: null, // → researchEnvironment
  garage:   null, // → garageEnvironment
  arena:    null, // → arenaEnvironment
  crew:     null, // → crewEnvironment
};
