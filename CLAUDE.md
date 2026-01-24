# Shopping Planner

A Next.js application for planning shopping lists and meals.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Database**: Drizzle ORM with Neon (PostgreSQL)
- **Authentication**: Clerk

## Project Structure

```
src/
├── app/           # Next.js App Router pages and layouts
├── components/    # React components (ui/ for shadcn components)
├── db/            # Database schema and utilities (Drizzle)
└── lib/           # Utility functions
```

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:seed` - Seed the database

## Adding UI Components

```bash
npx shadcn@latest add <component-name>
```

Components are installed to `src/components/ui/`.

## Development Guidelines

- Always use shadcn components, no custom components
- Use zod and react-hook-form for form state and validation
- Always run the linter after new changes are added
