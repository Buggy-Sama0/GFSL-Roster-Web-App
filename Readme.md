## Security Roster App Project Summary

This is a web-based security operations and workforce management application for managing security guards, weekly rosters, licenses, client contracts, invoices, and document processing.

### Technology Stack

- Frontend: React 19 with Vite
- Routing: React Router
- Styling: Tailwind CSS and custom CSS
- Charts: Recharts
- Database and authentication: Supabase
- Backend: FastAPI with Python
- AI integration: DeepSeek API
- OCR/image processing: Pillow and AI-based extraction
- Scheduled notifications: APScheduler
- Deployment: Vercel frontend AND Render backend

### Main Features

#### 1. Authentication and Role-Based Access

- Users log in through Supabase authentication.
- The user’s role is loaded from the `users` table.
- Users with the `portal_admin` role can access the Accounts Receivable page.
- Unauthenticated users are redirected to `/login`.
- Authenticated users are redirected to `/roster`.
- Idle timeout functionality is included for automatic session protection.

#### 2. Weekly Security Roster

Route:

```text
/roster
```

Features:

- Displays security guards in a weekly Monday-to-Sunday roster.
- Supports previous-week and next-week navigation.
- Displays day and night shifts.
- Shows scheduled, off-duty, and leave statuses.
- Allows users to toggle individual shifts.
- Allows users to toggle an employee’s weekly schedule.
- Saves schedule changes to Supabase.
- Supports site-based roster filtering.
- Highlights guards with expired licenses.
- Allows users to resolve leave conflicts.

Main Supabase tables:

- `employees`
- `schedules`
- `sites`

#### 3. License Compliance Management

Route:

```text
/licences
```

Features:

- Displays all tracked security personnel.
- Searches by employee name or HKID.
- Filters by:
  - All
  - Valid
  - Expiring Soon
  - Expired
- Calculates license status dynamically based on expiry dates.
- Tracks the following licenses:
  - CWR card
  - Green card
  - SPP
- Displays counts for total staff, expired licenses, and licenses expiring within 60 days.
- Includes pagination.
- Provides a detail drawer for individual guards.
- Supports document upload for license renewal or rescanning. (AI extracts the data from image)
- Shows license validity timelines.

#### 4. Accounts Receivable Dashboard

Route:

```text
/accounts
```

Access:

- Admin users only.

Features:

- Displays total receivables.
- Displays payment collected.
- Displays overdue invoice count.
- Displays overdue client count.
- Calculates collection rate.
- Displays an invoiced-versus-collected line chart.
- Displays an accounts receivable aging bar chart.
- Supports invoice search by client name.
- Supports invoice filtering by:
  - All
  - Pending
  - Overdue
  - Paid
- Supports filtering invoices by issue month.
- Includes client-side invoice pagination.
- Displays pagination status such as:

```text
Showing 1-7 of 156 invoices
```

- Includes previous, next, page-number, and ellipsis pagination controls.

Main Supabase tables:

- `invoices`
- `clients`

#### 5. AI Document and Roster Assistant

Route:

```text
/scan
```

Features:

- Allows users to upload documents or images.
- Allows users to paste raw text.
- Sends input to the FastAPI backend.
- Converts uploaded data or text into CSV format.
- Displays a data preview table.
- Allows the generated CSV file to be downloaded.
- Supports fields such as:
  - Name
  - HKID
  - CWR card number
  - CWR expiry date
  - Green card expiry date
  - SPP expiry date
- Includes an animated processing interface showing text being converted into CSV.

Frontend API request:

```text
POST /convert
```

#### 6. License Expiry Notifications

The backend checks employee license dates and identifies:

- Expired licenses
- Licenses expiring within 60 days

It can generate HTML email notifications containing:

- Employee name
- HKID
- License type
- Expiry status

The scheduled license check runs daily at:

```text
09:00 Hong Kong time
```

#### 7. Contract Expiry Notifications

The backend checks client contracts ending within approximately 30 days.

The notification includes:

- Client name
- Contract number
- Contract end date

The scheduled contract check runs daily at:

```text
09:30 Hong Kong time
```

#### 8. Backend API

Backend location:

```text
backend-ai/
```

Available endpoints:

```text
GET /
```

Checks whether the backend service is online.

```text
POST /convert
```

Converts uploaded files or raw text into a downloadable CSV file.

```text
POST /extract-data
```

Processes an uploaded license image and attempts to extract an expiry date using AI.

### Frontend Routes

```text
/login       Login page
/roster      Weekly security roster
/scan        AI document scanner
/licences    License compliance register
/accounts    Accounts receivable dashboard
/leave       Placeholder page
/settings    Placeholder page
```

### Data Flow

1. The frontend authenticates users through Supabase.
2. React components query Supabase tables directly for operational data.
3. Roster changes are written back to the `schedules` table.
4. License statuses are calculated from employee expiry dates.
5. Documents and raw text are sent to the FastAPI backend.
6. The backend uses AI and conversion utilities to process documents.
7. APScheduler runs automated license and contract notification jobs.


