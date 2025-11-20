# Food Finding App

A food logging website built with React, Node.js, and Prisma.

## Prerequisites

- Node.js
- pnpm

## Setup

1. Install dependencies:
   ```bash
   pnpm install:all
   ```

2. Initialize the database:
   ```bash
   cd server
   npx prisma migrate dev --name init
   ```

## Running the App

To start both the frontend and backend servers concurrently:

```bash
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
