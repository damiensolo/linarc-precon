// Module router for the Prequalification screens (docs/prequal/00-plan.md, Q5).
//
// Each screen is its own prototype slug, so the sandbox picker and `yarn shot <slug>` keep working. A link from one
// screen to another sets `?p=<slug>` and carries the record id in the hash: `?p=prequal-review#req-004`. Other query
// params (theme, chrome) are preserved.
//
// Navigation stays in the document (D-24, docs/5-ui-patterns.md §6): `go()` pushes a history entry and tells App.vue to
// swap the screen, so the app shell never blanks. It used to be `location.assign`, a full reload that showed a white
// page until every module and the CSS loaded again (F-057). Back / Forward work through `popstate`.

/** Event App.vue listens for to swap the screen after `go()` changes the URL. */
export const NAVIGATE_EVENT = 'prototype:navigate';

export const SCREENS = Object.freeze({
  dashboard: 'prequal-dashboard',
  queue: 'prequal-queue',
  qualified: 'prequal-qualified',
  wizard: 'prequal-wizard',
  portal: 'prequal-portal',
  review: 'prequal-review',
  record: 'prequal-record',
});

const SLUG_TO_SCREEN = Object.fromEntries(Object.entries(SCREENS).map(([screen, slug]) => [slug, screen]));

// Slugs that exist as prototypes. A lazy glob only lists the files (nothing is imported), which avoids a circular
// import between the shell and the prototype registry.
const BUILT_SLUGS = Object.keys(import.meta.glob('../../prototypes/*/index.vue')).map((f) => f.split('/').slice(-2)[0]);

/** { screen, slug, id } for the current page. `id` is the hash without `#`, or null. */
export function currentRoute() {
  const slug = new URLSearchParams(window.location.search).get('p') || '';
  const id = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : null;
  return { screen: SLUG_TO_SCREEN[slug] || null, slug, id };
}

/** Does a prototype exist for this screen? Links to unbuilt screens stay inert. */
export function isBuilt(screen) {
  return BUILT_SLUGS.includes(SCREENS[screen]);
}

/** URL for a screen, keeping theme / chrome params. Unbuilt screens return null (render no link). */
export function href(screen, id) {
  if (!isBuilt(screen)) return null;
  const url = new URL(window.location.href);
  url.searchParams.set('p', SCREENS[screen]);
  url.hash = id ? encodeURIComponent(id) : '';
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Navigate. Returns false (and does nothing) for a screen that isn't built yet. */
export function go(screen, id) {
  const target = href(screen, id);
  if (!target) return false;
  window.history.pushState(null, '', target);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
  return true;
}
