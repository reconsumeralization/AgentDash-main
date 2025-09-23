# Project Overview

This is a Next.js (React/TypeScript) project called "DefConect," an aspiration-based professional networking platform. It's built with v0.app and deployed on Vercel. The application uses Clerk for authentication (currently disabled in `middleware.ts` for development), Supabase for the database, and various UI components from Radix UI. The main interface is an "Agent Command Center" that allows users to interact with a multi-agent system, monitor processes, and manage data models.

The core idea is to connect users based on their future aspirations rather than past achievements. The platform includes features for managing agents, workflows, integrations, and professional networking.

# Building and Running

The following commands are available to build, run, and test the project:

*   **`npm run dev`**: Starts the development server.
*   **`npm run build`**: Creates a production build of the application.
*   **`npm run start`**: Starts the production server.
*   **`npm run lint`**: Lints the codebase for errors and style issues.
*   **`npm run demo-check`**: Runs a health check script to verify demo endpoints.

# Development Conventions

*   **Styling**: The project uses Tailwind CSS for styling, with `tailwind-merge` and `clsx` for utility class management.
*   **Components**: UI components are built using Radix UI and organized in the `components/ui` directory. Core application components are in the `components` directory.
*   **API Routes**: API routes are located in the `app/api` directory and use the Next.js App Router structure.
*   **Database**: The project uses Supabase for its database. The Supabase client is configured in `lib/supabase.ts`, which also defines the TypeScript interfaces for the database tables.
*   **Authentication**: Authentication is handled by Clerk, but it is currently disabled in `middleware.ts` for development purposes.
*   **State Management**: The application appears to manage state using React hooks and context providers, as seen with the `SolanaWalletProvider`.
