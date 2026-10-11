// CANDIDATE 2026-10-10: request lifecycle for LoadRegion / LoadStatus, see docs/components/LoadingStates.md and
// docs/5-ui-patterns.md §6. Ships with LoadRegion.
//
// One controller per region of data. It owns the timers and the "latest request wins" rule so screens don't:
//   - nothing shows for the first `indicatorDelayMs` (a fast answer never flashes a loader),
//   - then `indicator` turns on (skeleton on a first load, an inline "Updating…" on a refresh),
//   - after `slowAfterMs`, `slow` turns on ("Still loading…"), honest, with no stage or percentage,
//   - a newer run() or cancel() makes the older answer stale; it is ignored, never applied.
// Every path ends in ready, error or cancelled; nothing is left loading.

import Vue from 'vue';

/** Configurable timing. Override per controller: createLoad({ indicatorDelayMs, slowAfterMs }). */
export const LOAD_TIMING = Object.freeze({
  /** Below this, show the result directly: no skeleton, no spinner (perceived as instant). */
  indicatorDelayMs: 200,
  /** After this, add "Still loading…". */
  slowAfterMs: 5000,
});

function capitalise(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * @param {object} [options]
 * @param {string} [options.label] what is loading, lower case, for announcements ("review queue")
 * @returns reactive state + run / cancel / destroy
 */
export function createLoad({ label = 'content', indicatorDelayMs = LOAD_TIMING.indicatorDelayMs, slowAfterMs = LOAD_TIMING.slowAfterMs } = {}) {
  let seq = 0;
  let controller = null;
  let timers = [];

  const load = Vue.observable({
    label,
    /** idle | loading | ready | error | cancelled */
    status: 'idle',
    /** Valid content has been shown at least once: refreshes keep it on screen. */
    hasData: false,
    /** Loading has lasted indicatorDelayMs: show the skeleton (first load) or the inline indicator (refresh). */
    indicator: false,
    /** Loading has lasted slowAfterMs. */
    slow: false,
    /** The last load replaced a visible skeleton: LoadRegion fades the content in once. */
    fromSkeleton: false,
    error: null,
    /** Polite screen-reader message; set on meaningful changes only, never per animation cycle. */
    announcement: '',
  });

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function settle(status) {
    clearTimers();
    load.status = status;
    load.indicator = false;
    load.slow = false;
    controller = null;
  }

  /**
   * Start a request; a running one becomes stale (and is aborted).
   * @param {(signal: AbortSignal) => Promise<any>} request
   * @param {(value: any) => void} apply puts the result on the screen; called before the state turns ready, so the
   *   content renders with its data in the same frame.
   * @returns {Promise<{ ok: true, value } | { ok: false, error } | { stale: true } | { cancelled: true }>}
   */
  load.run = (request, apply) => {
    if (controller) controller.abort();
    clearTimers();
    const id = ++seq;
    controller = new AbortController();
    const { signal } = controller;
    // A run that replaces one whose indicator is already showing keeps it on: no off-and-on flicker between requests.
    const continuing = load.status === 'loading' && load.indicator;
    load.status = 'loading';
    load.error = null;
    load.indicator = continuing;
    load.slow = false;
    if (!continuing) {
      timers.push(
        setTimeout(() => {
          if (id !== seq) return;
          load.indicator = true;
          load.announcement = load.hasData ? `Updating ${label}…` : `Loading ${label}…`;
        }, indicatorDelayMs),
      );
    }
    timers.push(
      setTimeout(() => {
        if (id !== seq) return;
        load.slow = true;
        load.announcement = `Still loading ${label}…`;
      }, slowAfterMs),
    );

    // Start the request now, not in a later microtask: a load begun in created() must be in flight while the first
    // render runs, or the render's time is counted against the indicator delay (seen in testing: +110ms).
    let pending;
    try {
      pending = Promise.resolve(request(signal));
    } catch (error) {
      pending = Promise.reject(error);
    }
    return pending.then(
        (value) => {
          if (id !== seq) return { stale: true };
          const announced = load.indicator;
          load.fromSkeleton = announced && !load.hasData;
          if (apply) apply(value);
          load.hasData = true;
          settle('ready');
          // Announce completion only when the start was announced; a fast load says nothing.
          load.announcement = announced ? `${capitalise(label)} loaded` : '';
          return { ok: true, value };
        },
        (error) => {
          if (id !== seq) return { stale: true };
          if (signal.aborted || (error && error.name === 'AbortError')) {
            settle('cancelled');
            return { cancelled: true };
          }
          settle('error');
          load.error = error;
          // The error UI uses role="alert", which announces itself.
          load.announcement = '';
          return { ok: false, error };
        },
      );
  };

  /** Stop the running request. Content already on screen stays; with none, the region offers Retry. */
  load.cancel = () => {
    if (load.status !== 'loading') return;
    seq += 1;
    if (controller) controller.abort();
    settle(load.hasData ? 'ready' : 'cancelled');
    load.announcement = `Stopped loading ${label}`;
  };

  /** Call from beforeDestroy: clears timers and drops any pending result. */
  load.destroy = () => {
    seq += 1;
    if (controller) controller.abort();
    clearTimers();
  };

  return load;
}
