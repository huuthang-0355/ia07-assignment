# React Authentication App with JWT

A React single-page application implementing JWT-based authentication with access tokens and refresh tokens. Built with React, Axios, React Query, React Hook Form, and React Router.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

## Run

Start the development server:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`

## Access

### Demo Credentials

**User Account:**
- Email: `user@example.com`
- Password: `password123`

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

## Build for Production

```bash
npm run build
```

The production files will be in the `dist` folder, ready to deploy to platforms like Netlify, Vercel, or GitHub Pages.

## Public Hosting

To deploy to a public hosting platform:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your chosen platform (Netlify, Vercel, GitHub Pages, etc.)
3. Update the `VITE_API_BASE_URL` environment variable if using a real API backend
