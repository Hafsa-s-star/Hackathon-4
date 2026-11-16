# wellnest clinic API

Express and MongoDB API for patient registration, role-based dashboards, doctor management, and appointments.

## Configure and run

1. Install dependencies:

   ```powershell
   npm install
   ```

2. In PowerShell, copy the example config:

   ```powershell
   Copy-Item .env.example .env
   ```

   Open `Backend/.env` and replace the `MONGODB_URI` example with your MongoDB connection string. Replace the `JWT_SECRET` example with a long, random secret (you can generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). Set `FRONTEND_URL` if the Vite app is hosted somewhere other than `http://localhost:5173`. Do not commit `.env` or paste database credentials into source code.

3. Create the first admin account by setting the following environment values in PowerShell, then running the script:

   ```powershell
   $env:ADMIN_NAME = "Clinic Admin"
   $env:ADMIN_EMAIL = "admin@example.com"
   $env:ADMIN_PASSWORD = "choose-a-long-password"
   npm run create-admin
   ```

4. Start the API:

   ```powershell
   npm run dev
   ```

   The API listens on port `3000` by default. Start the frontend separately with `npm run dev` from `Frontend`.

## API overview

- `POST /api/auth/register` and `POST /api/auth/login` — patient registration and sign-in; the session uses an HTTP-only cookie.
- `POST /api/auth/logout` and `GET /api/auth/me` — end or inspect the current session.
- `GET /api/doctors?search=&specialization=` and `GET /api/doctors/:id` — authenticated doctor search, specialty filtering, and details.
- `POST /api/appointments`, `GET /api/appointments/my`, `PATCH /api/appointments/:id/cancel` — patient appointment actions.
- `GET /api/appointments/doctor`, `PATCH /api/appointments/:id/status` — doctor's requests and decisions.
- `GET /api/admin/users`, `GET /api/admin/appointments?patientName=`, `GET /api/admin/stats`, `POST /api/admin/doctors`, `POST /api/admin/admins`, `PATCH /api/admin/users/:id/status`, `DELETE /api/admin/users/:id` — admin management. Creating admins requires an existing admin session.

Appointment documents reference the `User` collection through populated `patient` and `doctor` fields. Dates and times are stored separately as `appointmentDate` and `appointmentTime`.

## Creating accounts with Postman

Public `POST /api/auth/register` creates patient accounts only. To create the first admin, run the `create-admin` script above. In Postman, sign in with `POST /api/auth/login` and that admin's credentials; keep requests on the same host so Postman sends the returned HTTP-only session cookie.

Then create a doctor with `POST /api/admin/doctors`:

```json
{
  "name": "Dr. Alex Morgan",
  "email": "alex@example.com",
  "password": "choose-a-long-password",
  "specialization": "Cardiology",
  "experience": 8
}
```

Create another admin with `POST /api/admin/admins` using `name`, `email`, and `password` (and optionally `phone`). Both endpoints require the signed-in admin session.
