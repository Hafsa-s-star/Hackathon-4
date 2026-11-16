# wellnest clinic portal

The React/Vite frontend provides separate patient, doctor, and administrator workspaces. It connects to the Express API at `http://localhost:3000/api` by default. To use a different API URL, set `VITE_API_URL` in a frontend `.env` file.

## Run locally

```powershell
npm install
npm run dev
```

The Vite development server runs at `http://localhost:5173`. Start the backend and configure MongoDB first; see [Backend setup](../Backend/README.md).

Patient accounts can be registered from the sign-in page. The first admin must be created with the backend's `create-admin` script, and admins create doctor accounts in the dashboard.
