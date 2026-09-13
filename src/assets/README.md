# Environment Asset Slots

No AIRS City master map or HQ exterior was present in the supplied workspace.

`city-reference.webp` is temporary aerial photography by Venti Views, showing Atlanta.
Source: https://unsplash.com/photos/an-aerial-view-of-a-city-at-night-F2PrSHG2nEk
License: https://unsplash.com/license

This image is NOT the AIRS master map. The interface identifies it as reference scenery.

Replace the import in `src/data/assets.ts` with the supplied master map. Set its native
width and height and recalibrate normalized waypoint positions in `districts.ts`.
Add a matching HQ exterior in `districtEnvironments.hq`. A null environment deliberately
uses an enlarged crop of the same city image, avoiding an unrelated building.

Use WebP or AVIF for environments, approximately 2400-3000 px wide for the city and
1600-2000 px for district exteriors. Keep total compressed environment assets modest.
