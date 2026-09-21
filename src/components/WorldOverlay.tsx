import { useEffect, useRef } from "react";
import { districts, type DistrictId } from "../data/districts";
import { Icon } from "./Icon";

export function WorldOverlay({
  kind,
  close,
  travel,
  discovered,
}: {
  kind: "index" | "guide";
  close: () => void;
  travel: (id: DistrictId) => void;
  discovered: DistrictId[];
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const el = root.current!;
    const items = () => [
      ...el.querySelectorAll<HTMLElement>("button, a[href]"),
    ];
    items()[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const buttons = items(),
        first = buttons[0],
        last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    el.addEventListener("keydown", trap);
    return () => {
      el.removeEventListener("keydown", trap);
      if (previous.isConnected) previous.focus();
    };
  }, []);
  return (
    <div
      className="world-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="overlay-title"
      ref={root}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section className="overlay-panel">
        <header>
          <span className="eyebrow">AIRS City / Field guide</span>
          <button
            className="icon-button"
            onClick={close}
            aria-label="Close field guide"
          >
            <Icon name="close" />
          </button>
        </header>
        <h2 id="overlay-title">
          {kind === "index"
            ? "Choose your next discovery."
            : "This isn't a website. It's a place."}
        </h2>
        {kind === "index" ? (
          <>
            <p>{districts.length} districts. Follow your curiosity.</p>
            <nav className="district-index" aria-label="All destinations">
              {districts.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    close();
                    travel(d.id);
                  }}
                >
                  <span className="index-number">{d.number}</span>
                  <Icon name={d.id} size={23} />
                  <span>
                    <strong>{d.name}</strong>
                    <small>
                      {d.sector} /{" "}
                      {discovered.includes(d.id) ? "Discovered" : "Unexplored"}
                    </small>
                  </span>
                  <Icon name="arrow" />
                </button>
              ))}
            </nav>
          </>
        ) : (
          <>
            <p>
              Move through the city, enter a district, and uncover its story.
              Your discoveries stay with you on this device.
            </p>
            <dl className="controls-guide">
              <div>
                <dt>Move around</dt>
                <dd>Drag the map. Use + / - to change altitude.</dd>
              </div>
              <div>
                <dt>Choose a district</dt>
                <dd>
                  Select a waypoint, or press 1 to 5. On mobile, tap a district
                  below the map.
                </dd>
              </div>
              <div>
                <dt>Enter a district</dt>
                <dd>Click a waypoint on desktop, or choose Enter district.</dd>
              </div>
              <div>
                <dt>Find your way back</dt>
                <dd>
                  Use the mini-map or press Escape. Escape closes content before
                  returning to the city.
                </dd>
              </div>
              <div>
                <dt>Explore with a keyboard</dt>
                <dd>
                  Tab through controls. Enter activates a focused control.
                  District index lists every location.
                </dd>
              </div>
            </dl>
            <div className="reference-note">
              <span className="eyebrow">Environment & content notice</span>
              <p>
                This is an interactive concept prototype. The supplied master
                map and matching HQ exterior were not present in the workspace.
                Scenery is temporary Atlanta aerial photography by{" "}
                <a
                  href="https://unsplash.com/photos/an-aerial-view-of-a-city-at-night-F2PrSHG2nEk"
                  target="_blank"
                  rel="noreferrer"
                >
                  Venti Views / Unsplash
                </a>
                , not AIRS geography. Waypoints are provisional.
              </p>
              <p>
                HQ manifesto is draft editorial copy. People, projects, events,
                results, and application links await verified AIRS information.
                No affiliations are implied by the reference buildings.
              </p>
            </div>
            <p className="editorial-note">
              Sound starts off. Reduced-motion preferences are respected. No
              account or tracking is required.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
