# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

## Onboarding Implementation Notes

### Overview
The dashboard gate keeps most data queries disabled until the user is both `isVerified` and `isProfileComplete`. Until then, the onboarding overlay shows a checklist, teaser panel, and a blurred placeholder behind it.

### Key Files
- `src/pages/DashboardNew.js`: Applies gating, blur preview, completion transition + confetti.
- `src/components/OnboardingChecklist.js`: Renders steps, progress bar, cooldown logic, accessibility attributes.
- `src/utils/onboarding.js`: Helper to determine completion.
- `src/hooks/useReducedMotion.js`: Detects user preference for reduced motion.
- `src/utils/confetti.js`: Lightweight canvas confetti (no external dependency).
- `src/services/analyticsClient.js`: Simple client for tracking events (currently logs in dev).

### Analytics Events
Emitted through `track()`:
- `onboarding_progress_change` `{ completed, total }`
- `onboarding_complete`

Extend by replacing `track` implementation to POST to backend.

### Cooldown Logic
Verification resend has a 60s cooldown stored in `localStorage` under `verifyEmailCooldown`. A progress bar (role="progressbar") reflects elapsed time. Width formula: `((60 - remainingSeconds) / 60) * 100`.

### Accessibility
- Progress region uses `aria-live="polite"`.
- Active step heading receives focus when state changes.
- Cooldown progress bar has `aria-valuenow`, `aria-valuemax=60`.
- Buttons include focus rings and `aria-disabled` where appropriate.

### Reduced Motion
If `(prefers-reduced-motion: reduce)` is set, most transition classes are suppressed and confetti is skipped.

### Adding New Steps
1. Adjust `total` in checklist progress closure.
2. Append new `renderStep` call with proper completion predicate.
3. Update analytics events if total changes.

### Testing
Basic tests: `src/__tests__/onboardingCooldown.test.jsx` covers progress counts and state-driven UI. Extend with interaction tests using `user-event` for more coverage.

### Future Enhancements
- Replace inline teaser content with dynamic marketing copy.
- Persist analytics events to backend.
- Add skeleton preview components under blur.

## Backend Onboarding Analytics Events

### Endpoint
`POST /api/analytics-events`

### Auth
Requires standard auth (JWT/session) via existing `protect` middleware.

### Request Body
```
{
	"events": [
		{ "event": "onboarding_progress_change", "payload": { "completed": 2, "total": 3 }, "ts": 1732212345678 },
		{ "event": "onboarding_complete", "payload": {} }
	]
}
```
Notes:
- `ts` optional (ms epoch). If omitted, server sets current time.
- Max 100 events per request (client currently batches at 25).

### Persistence Model
Collection: `onboardingeven ts` (Mongoose model `OnboardingEvent`). Fields:
- `userId` (ObjectId, indexed)
- `event` (string, indexed)
- `payload` (object)
- `ts` (Date, indexed)

### Client Batching
Implemented in `src/services/analyticsClient.js`:
- Queues events; flush every 5s or when 25 queued.
- Retries failed batch by re-queuing at front.

### Extending
- Add server-side aggregation endpoints for funnel analytics later (e.g. `/api/analytics-events/summary`).
- Consider TTL index if long-term retention not required.


