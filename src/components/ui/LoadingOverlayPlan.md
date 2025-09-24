LoadingOverlay Component Plan

Goal: Provide a global, lightweight visual indicator for in-progress route transitions or critical data fetches that exceed a short threshold (avoid flicker on fast transitions, improve perceived performance on slower ones).

Key Requirements:
1. Non-intrusive: Semi-transparent backdrop + centered spinner; avoid layout shift.
2. Accessible: Uses role="status" + aria-live="polite" with visually hidden text (e.g., "Loading"). Prevents double announcements.
3. Deferred activation: Appears only if loading > 200ms (configurable) to avoid flashing.
4. Cancellable: Automatically removed when navigation/data load resolves; supports abort signal for manual long fetches.
5. Theming aware: Dark mode friendly (backdrop opacity & spinner colors adjust via CSS variables or utility classes).
6. Re-entrant safe: If multiple loads start, reference count increments; overlay only hides when all complete.

Implementation Outline:
A. Component API
<LoadingOverlay active message="Loading" />
- active: boolean OR internal global store subscription
- message: optional status text (default: "Loading")
- delay: ms before showing (default 200)
- fullscreen: boolean (default true)

B. Global Hook Integration
- Create useGlobalLoading() hook returning { start, stop } with an internal ref count (Zustand or minimal event emitter in module scope).
- Navigation Integration: In root layout, watch useNavigation() from react-router; when state === 'loading' start(); when idle stop().

C. Internal Logic
- useEffect sets timer on active request; if still active after delay => show.
- Cleanup clears timer and hides overlay.
- Maintain refCount; show if refCount > 0.

D. Accessibility
- role="status" container with aria-live="polite" and visually hidden text span.
- Avoid aria-busy on body to reduce screen reader verbosity; optionally expose hook consumer API for specific regions.

E. Styling (Tailwind)
Wrapper: fixed inset-0 z-50 flex items-center justify-center bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm
Spinner: animate-spin h-10 w-10 border-4 border-primary-red/30 border-t-primary-red rounded-full
Text: mt-4 text-sm text-gray-700 dark:text-gray-200

F. Edge Cases
- Rapid sequential navigations: timer reused; do not flicker (keep overlay until idle for >=100ms or immediately hide? Consider 100ms grace period).
- Memory leaks: ensure stop clears pending timers.
- Server errors: stop still called in error boundaries; ensure global handler stops loading.

G. Future Enhancements
- Progress estimation (if backend exposes content-length or streaming metadata).
- Variant mini inline overlay for panel-level loads.
- Prefer CSS prefers-reduced-motion adjustments (spinner slowdown or pulse variant).

Next Step: Implement hook + component and wire into root layout after confirmation.
