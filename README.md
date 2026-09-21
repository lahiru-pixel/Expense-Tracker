# Personal Expense Tracker & Budget Dashboard

A simple, full-stack web application built for a university DevOps Engineering module assignment (Group 34). 
It features a React frontend and an Express/Mongoose backend, designed to be containerized and run through a CI/CD pipeline.

## Repository Structure
- `client/` - React frontend (Vite, React Router v6, Tailwind CSS, Recharts)
- `server/` - Node.js backend (Express, Mongoose, JWT)

## Setup Instructions
1. Clone the repository.
2. In the `server` directory, copy `.env.example` to `.env` and fill in the values.
3. In the `client` directory, copy `.env.example` to `.env` and fill in the values.
4. Run `npm install` in both `client` and `server` directories.

## Running Locally
- Backend: `cd server && npm run dev`
- Frontend: `cd client && npm run dev`

## Available Scripts

### Backend (`server/`)
- `npm run dev`: Start the server in development mode.
- `npm start`: Start the server in production mode.
- `npm test`: Run backend tests.
- `npm run lint`: Run ESLint.
- `npm run seed`: Seed the database with demo users and expenses.

### Frontend (`client/`)
- `npm run dev`: Start the Vite development server.
- `npm run build`: Build the frontend for production.
- `npm run preview`: Preview the production build locally.
- `npm run lint`: Run ESLint.

## API Endpoints (Prefix: `/api`)
- `GET /health` - Check health status
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile
- `GET /expenses` - List expenses with filters and pagination
- `POST /expenses` - Create an expense
- `PUT /expenses/:id` - Update an expense
- `DELETE /expenses/:id` - Delete an expense
- `GET /expenses/summary` - Get expense summary for a month
- `GET /expenses/trend` - Get expense trend for last N months
- `GET /budget` - Get budget for a month
- `PUT /budget` - Set or update budget for a month
