# SAAS Dashboard Application

A modern, full-stack SAAS dashboard built with React, TypeScript, Vite, and Tailwind CSS. Features a complete authentication system, responsive design, dark/light theme support, and multiple data management pages.

## Features

- **Authentication System**: Login and signup pages with protected routes
- **Dark/Light Theme**: Seamless theme switching with localStorage persistence
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Smooth Animations**: framer-motion for page transitions and micro-interactions
- **Data Tables**: Sortable, searchable, and paginated tables
- **Toast Notifications**: Using Sonner for elegant notifications
- **State Management**: Zustand for lightweight state management

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Animations**: framer-motion
- **State Management**: Zustand
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Default Login

The authentication system uses in-memory storage for demo purposes. You can login with any email/password combination.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── layout/         # Layout components (Sidebar, Header, etc.)
│   └── ui/             # UI components (Button, Card, etc.)
├── lib/                # Utility functions and dummy data
├── pages/              # Page components
│   ├── admin-table/    # Admin management pages
│   ├── data-management/# Data overview and analytics
│   └── user-table/     # User management pages
├── store/              # Zustand stores for state management
└── App.tsx             # Main app component with routing
```

## Pages

### Public Routes
- `/login` - User login page
- `/signup` - User registration page

### Protected Routes
- `/dashboard` - Overview dashboard with statistics
- `/data-management/overview` - Data table with CRUD operations
- `/data-management/analytics` - Analytics and insights
- `/user-table/all-users` - All users table
- `/user-table/inactive` - Inactive users table
- `/admin-table/admins` - Admin users management
- `/admin-table/permissions` - Permission matrix
- `/settings` - User settings and preferences

## Features in Detail

### Authentication
- Protected routes redirect to login if not authenticated
- Token stored in localStorage
- Automatic auth state restoration on page reload

### Theme System
- Light/dark mode toggle in header
- Persistent theme preference in localStorage
- Smooth transitions between themes

### Data Tables
- Search functionality
- Pagination
- Sorting capabilities
- Action dropdowns for each row
- Responsive design with horizontal scroll on mobile

### Animations
- Page transitions with fade and slide effects
- Loading skeletons for better UX
- Hover effects on interactive elements
- Smooth accordion animations in sidebar

## Customization

### Colors
Edit `src/index.css` to customize the color scheme. The app uses CSS variables for theming.

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/layout/Sidebar.tsx`

### Styling
- Use Tailwind utility classes for styling
- Follow the existing color scheme using CSS variables
- Use shadcn/ui components for consistency

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Author

SAAS Dashboard 2025
