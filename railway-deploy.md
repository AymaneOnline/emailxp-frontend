Railway Deployment Guide (Frontend)
=================================

Steps to deploy this frontend on Railway:

1. Create a new Railway project and connect the `emailxp-frontend` GitHub repository.
2. Set the service's "Start Directory" to `frontend`.
3. Railway will detect a Node.js app. Set the `Start Command` to `npm run start:prod` if it's not detected.
4. Add required environment variables in Railway project settings:
   - `REACT_APP_BACKEND_URL` (public backend URL) — used by frontend to call the API.
   - Any other `REACT_APP_*` variables you use in the frontend.
5. Deploy. The build step runs `react-scripts build`; production server uses `serve`.

Notes:
- Railway provides `PORT` automatically. The `start:prod` script reads `$PORT`.
- Do not store secrets directly in the repo. Use Railway's Environment settings.
