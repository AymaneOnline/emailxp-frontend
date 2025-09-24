// Analytics client with simple batching to backend.
// API: track(eventName, payload)
import api from './api';

const queue = [];
let flushTimer = null;
const FLUSH_INTERVAL = 5000; // 5s
const MAX_BATCH = 25;
let inflight = false;

async function flush() {
  if (inflight) return;
  if (queue.length === 0) return;
  inflight = true;
  const batch = queue.splice(0, MAX_BATCH);
  try {
    await api.post('/analytics-events', { events: batch });
  } catch (e) {
    // If forbidden (likely unverified email), drop the batch to prevent retry storm
    const status = e?.response?.status;
    if (status === 403) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[analytics] dropping batch due to 403 (prob. unverified user)');
      }
      // Do NOT requeue – user not authorized yet
    } else {
      // Requeue on other failures (prepend to maintain order)
      batch.reverse().forEach(ev => queue.unshift(ev));
    }
  } finally {
    inflight = false;
    if (queue.length > 0) scheduleFlush(1000); // retry sooner if backlog
  }
}

function scheduleFlush(delay = FLUSH_INTERVAL) {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, delay);
}

function emit(event, payload) {
  const record = { ts: Date.now(), event, payload: payload || {} };
  queue.push(record);
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[analytics][queued]', event, payload || {});
  }
  if (queue.length >= MAX_BATCH) {
    flush();
  } else {
    scheduleFlush();
  }
}

export function track(event, payload) { emit(event, payload); }
export function getQueue() { return [...queue]; }
export async function flushNow() { await flush(); }
