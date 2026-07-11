# Mini LMS V2

A consultation portal that allows students to register, book consultations, and manage them from a personalised dashboard.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
  - [Node.js Setup](#nodejs-setup)
  - [Docker Setup](#docker-setup)
  - [Supabase Setup](#supabase-setup)
- [Running the Project](#running-the-project)
  - [Using Docker](#using-docker)
  - [Without Docker](#without-docker)
- [Stopping the Project](#stopping-the-project)
- [Running Tests](#running-tests)
  - [Unit Tests](#unit-tests)
  - [E2E Tests](#e2e-tests)
- [Summary of Overall Implementation](#summary-of-overall-implementation)
  - [Architecture](#architecture)
  - [Authentication](#authentication)
  - [Student Dashboard](#student-dashboard)
  - [Consultation Booking](#consultation-booking)
  - [Database Design](#database-design)
  - [Security](#security)
  - [Testing](#testing)
  - [Assumptions and Considerations](#assumptions-and-considerations)
- [Future Improvements](#future-improvements)
- [Deployed Version](#deployed-version)

## Tech Stack

| Category          | Technology              | Version | Purpose                                               |
| ----------------- | ----------------------- | ------- | ----------------------------------------------------- |
| Framework         | Next.js                 | v16     | Full-stack React framework with App Router            |
| Language          | TypeScript              | v5      | Static typing across the entire codebase              |
| Database          | Supabase (PostgreSQL)   | -       | Hosted PostgreSQL with built-in Auth and RLS          |
| Supabase Client   | `@supabase/ssr`         | v0.8    | SSR-compatible Supabase client for Next.js            |
| Supabase Client   | `@supabase/supabase-js` | v2      | Core Supabase JS client                               |
| Form Management   | React Hook Form         | v7      | Performant form state management                      |
| Schema Validation | Zod                     | v4      | Runtime validation for forms and API boundaries       |
| UI Components     | Shadcn/UI + Radix UI    | -       | Accessible, unstyled primitives with Tailwind styling |
| Styling           | Tailwind CSS            | v4      | Utility-first CSS                                     |
| Date Handling     | TBD                     | TBD     | Date formatting and display                           |
| Unit Testing      | Vitest                  | v4      | Fast unit test runner with Jest-compatible API        |
| Coverage          | `@vitest/coverage-v8`   | v4      | V8-based code coverage                                |
| E2E Testing       | Cypress                 | v15     | End-to-end browser testing                            |
| Linting           | ESLint                  | v9      | Static analysis with Next.js config                   |

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/andylu0129/mini-lms.git
cd mini-lms
```

Install dependencies:

```bash
npm ci
```

---

## Prerequisites

### Node.js Setup

This project requires **Node.js v20**. It is recommend to use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions.

1. **Install nvm**

   **macOS / Linux:**

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   ```

   **Windows:**

   Download and install [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) from the latest release (nvm-setup.exe can be found scrolling down to Assets section).

2. **Install and use Node.js v20**

   **macOS / Linux:**

   ```bash
   nvm install 20
   nvm use 20
   ```

   **Windows:**

   ```powershell
   nvm install 20
   nvm use 20
   ```

3. **Verify the installation**

   ```bash
   node -v
   ```

   You should see a version starting with `v20`.

### Docker Setup

1. **Install Docker Desktop and CLI**

   Download and install from the official site: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

2. **Configure Docker Desktop settings** (Settings > General)

   Enable the following options:
   - **Expose daemon on tcp://localhost:2375 without TLS**
   - **Use the WSL 2 based engine** (Windows Home can only run the WSL 2 backend)
   - **Add the \*.docker.internal names to the host's /etc/hosts file** (requires password)

### Supabase Setup

> **Note:** Supabase requires Docker to be installed and running.

1. **Install the Supabase CLI**

   **Windows (via Scoop):**

   If you don't have Scoop installed, run the following in PowerShell:

   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

   # Reverts the execution policy back to its default.
   Set-ExecutionPolicy -ExecutionPolicy Undefined -Scope CurrentUser
   ```

   Then install the Supabase CLI:

   ```powershell
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

   **macOS / Linux (via Homebrew):**

   ```bash
   brew install supabase/tap/supabase
   ```

2. **Ensure your terminal is inside the project directory before running the following commands**

3. **Start Supabase**

   ```bash
   supabase start
   ```

4. **Reset the database** (applies migrations and seed data if exist)

   ```bash
   supabase db reset
   ```

## Running the Project

### Using Docker Container

1. **Set up environment variables**

   Run `supabase status` to retrieve your local credentials:

   ```bash
   supabase status
   ```

   The output includes an **Authentication Keys** section.
   Create a copy of `.env.example` named `.env.local` and fill in the values below.

   Example `supabase status` output:

   ```
   🔑 Authentication Keys
   ├─────────────┬────────────────────────────────────────────────┤
   │ Publishable │ sb_publishable_xxxxxxxxxxxxxxxxxxxx            │
   ```

   Your completed `.env.local` should look like:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://host.docker.internal:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxx
   ```

2. Build and start the container:

   ```bash
   docker compose up --build
   ```

3. Access the app at [http://localhost:3000](http://localhost:3000)

### Without Docker Container

1.  **Set up environment variables**

    Run `supabase status` to retrieve your local credentials:

    ```bash
    supabase status
    ```

    The output includes an **APIs** section and an **Authentication Keys** section.
    Create a copy of `.env.example` named `.env.local` and fill in the values below.

    | Section             | Field         | Maps to                                |
    | ------------------- | ------------- | -------------------------------------- |
    | APIs                | `Project URL` | `NEXT_PUBLIC_SUPABASE_URL`             |
    | Authentication Keys | `Publishable` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |

    Example `supabase status` output:

    ```
    🌐 APIs
    ├────────────────┬─────────────────────────────────────┤
    │ Project URL    │ http://127.0.0.1:54321              │

    🔑 Authentication Keys
    ├─────────────┬────────────────────────────────────────────────┤
    │ Publishable │ sb_publishable_xxxxxxxxxxxxxxxxxxxx            │
    ```

    Your completed `.env.local` should look like:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxx
    ```

2.  Build the app:

    ```bash
    npm run build
    ```

3.  Start the server:

    ```bash
    npm start
    ```

4.  Access the app at [http://localhost:3000](http://localhost:3000)

## Stopping the Project

- **Stop Supabase:**

  ```bash
  supabase stop
  ```

- **Stop the Docker container:**

  ```bash
  docker compose down
  ```

---

## Running Tests

### Unit Tests

Run all unit tests:

```bash
npm run test:unit
```

Run with coverage report:

```bash
npm run test:coverage
```

### E2E Tests

1. **Set up the Cypress environment file**

   Create a copy of `cypress.env.json.example` named `cypress.env.json` and fill in the credentials of an existing user in your local Supabase instance:

   ```json
   {
     "TEST_USER_EMAIL": "your-test-user@example.com",
     "TEST_USER_PASSWORD": "YourPassword1!"
   }
   ```

   > The test user must already exist in your local Supabase instance. You can register one via the sign-up page or create one directly through the Supabase dashboard at [http://127.0.0.1:54323](http://127.0.0.1:54323).

2. **Start the dev server**

   Cypress runs tests against the live application, so the Next.js dev server must be running first:

   ```bash
   npm run dev
   ```

3. **Open Cypress**

   In a separate terminal:

   ```bash
   npm run test:e2e
   ```

4. In the Cypress UI, select **E2E Testing** → choose a browser → click any spec file to run it.

---
