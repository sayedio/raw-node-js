# Raw Node.js Uptime Monitoring API

A lightweight REST API built with Node.js core modules only (no Express), with file-based storage and a background worker that monitors URLs and sends SMS alerts through Twilio when status changes.

## What This Project Does

- Creates and manages users
- Creates and manages login tokens
- Creates and manages uptime checks (HTTP/HTTPS)
- Runs a background worker every minute to test checks
- Stores all data as JSON files inside `.data/`

## Tech Stack

- Node.js (CommonJS)
- Built-in modules: `http`, `https`, `fs`, `path`, `crypto`
- Dev tools: ESLint, Prettier
- File-based persistence (no external database)

## Project Structure

- `index.js`: App entry point (starts server + worker)
- `lib/server.js`: HTTP server bootstrap
- `helpers/handleReqRes.js`: Request parser + route dispatcher
- `routes.js`: Route mapping
- `handlers/`: Route handlers (`users`, `token`, `check`, etc.)
- `lib/worker.js`: Periodic uptime checker
- `lib/data.js`: File CRUD helper for `.data/`
- `helpers/environment.js`: Environment config
- `.data/`: JSON storage (`users`, `token`, `checks`, `test`)

## Prerequisites

1. Install Node.js 18+ (Node.js 20+ recommended)
2. Verify installation:

```bash
node -v
npm -v
```

## Setup (Step by Step)

1. Open terminal in the project root.
2. Install dependencies:

```bash
npm install
```

3. Ensure storage folders exist.

This project reads and writes files in `.data/`. Make sure these folders exist:

- `.data/users`
- `.data/token`
- `.data/checks`
- `.data/test`

If needed, create them manually.

4. Configure environment values in `helpers/environment.js`:

- `port`
- `authSecret`
- `maxChecks`
- Twilio config in `twilio` object:
  - `fromNumber`
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`

## Running the App

### Option A: Git Bash / WSL (works with existing npm scripts)

```bash
npm start
```

For production mode:

```bash
npm run production
```

### Option B: Windows PowerShell

The current scripts use POSIX-style environment assignment (`NODE_ENV=...`), which may not work in plain PowerShell.

Use this instead:

```powershell
$env:NODE_ENV="staging"
npx nodemon index
```

Production:

```powershell
$env:NODE_ENV="production"
npx nodemon index
```

### Option C: Windows CMD

```cmd
set NODE_ENV=staging&& npx nodemon index
```

## Verify Server Is Running

When started successfully, terminal should show something like:

```text
listening on port 3000
```

Health welcome response:

```bash
curl http://localhost:3000/
```

Expected response:

```text
welcome to raw nodejs
```

Sample route:

```bash
curl http://localhost:3000/sample
```

Expected JSON response:

```json
{ "test": "ok" }
```

## API Documentation

Base URL:

```text
http://localhost:3000
```

### 1) Users API (`/users`)

#### Create user

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstname":"John",
    "lastname":"Doe",
    "phone":"01811111111",
    "password":"12345",
    "tosAgree":true
  }'
```

#### Get user (requires token)

```bash
curl "http://localhost:3000/users?phone=01811111111" \
  -H "token: YOUR_TOKEN_ID"
```

#### Update user (requires token)

```bash
curl -X PUT http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "token: YOUR_TOKEN_ID" \
  -d '{
    "phone":"01811111111",
    "firstname":"Johnny"
  }'
```

#### Delete user (requires token)

```bash
curl -X DELETE "http://localhost:3000/users?phone=01811111111" \
  -H "token: YOUR_TOKEN_ID"
```

### 2) Token API (`/token`)

#### Create token (login)

```bash
curl -X POST http://localhost:3000/token \
  -H "Content-Type: application/json" \
  -d '{
    "phone":"01811111111",
    "password":"12345"
  }'
```

#### Get token details

```bash
curl "http://localhost:3000/token?token=YOUR_TOKEN_ID"
```

#### Extend token expiry

```bash
curl -X PUT http://localhost:3000/token \
  -H "Content-Type: application/json" \
  -d '{
    "token":"YOUR_TOKEN_ID",
    "extend":true
  }'
```

#### Delete token

```bash
curl -X DELETE "http://localhost:3000/token?token=YOUR_TOKEN_ID"
```

### 3) Check API (`/check`)

Requires a valid token header for all operations.

#### Create check

```bash
curl -X POST http://localhost:3000/check \
  -H "Content-Type: application/json" \
  -H "token: YOUR_TOKEN_ID" \
  -d '{
    "protocol":"https",
    "url":"example.com",
    "method":"get",
    "successCodes":[200,201],
    "timeoutSeconds":3
  }'
```

#### Get check by id

```bash
curl "http://localhost:3000/check?id=YOUR_CHECK_ID" \
  -H "token: YOUR_TOKEN_ID"
```

#### Update check

```bash
curl -X PUT http://localhost:3000/check \
  -H "Content-Type: application/json" \
  -H "token: YOUR_TOKEN_ID" \
  -d '{
    "id":"YOUR_CHECK_ID",
    "url":"example.org",
    "method":"get"
  }'
```

#### Delete check

```bash
curl -X DELETE http://localhost:3000/check \
  -H "Content-Type: application/json" \
  -H "token: YOUR_TOKEN_ID" \
  -d '{
    "id":"YOUR_CHECK_ID"
  }'
```

## Recommended End-to-End Test Flow

1. Create user via `POST /users`
2. Create token via `POST /token`
3. Create check via `POST /check` with token header
4. Wait 1-2 minutes for worker loop to run
5. Open `.data/checks/<checkId>.json` and verify `status` and `lastChecked` are updated

## Data Storage Details

All records are JSON files under `.data/`:

- `.data/users/<phone>.json`
- `.data/token/<tokenId>.json`
- `.data/checks/<checkId>.json`

No external database is required.

## Linting and Formatting

Run lint:

```bash
npm run lint
```

Run formatter:

```bash
npm run format
```

## Common Issues and Fixes

1. `nodemon is not recognized`

Install nodemon locally:

```bash
npm i -D nodemon
```

Then rerun with:

```bash
npx nodemon index
```

2. Windows cannot run `npm start`

Use PowerShell or CMD commands shown in Running the App section.

3. Check creation fails with unauthorized error

Make sure:

- You created token with correct phone + password
- You send header exactly as `token: <tokenId>`
- Token is not expired

4. SMS not sending

Verify Twilio credentials in `helpers/environment.js` and ensure `fromNumber` is configured correctly.

## Notes

- Default port is `3000` for both staging and production in current config.
- Max checks per user is controlled by `maxChecks` in environment settings.
- This project is intentionally minimal and built with raw Node.js patterns for learning and control.
