# Changelog

## [Unreleased]

### Added

- **Centralized Types** - moved all typescript type definitions to root `types/` folder for better organization
- **Feature-Based Components** - reorganized components into feature-based structure (`components/groups/`, `components/auth/`)
- **Infrastructure Providers** - moved react context providers to `lib/providers/` alongside other infrastructure
- **Documentation Folder** - created `md/` folder for all markdown documentation files (except README and CHANGELOGS)
- **Barrel Exports** - added index.ts files for clean feature exports
- **Login/Signup Page** - Login and Signup Page for OAuth users
- **Google OAuth User Sync** - Automatic user profile creation on Google login
- **Landing Page Redesign** - Complete landing page redesign with receipt-style theme and bill aesthetic
- **Receipt-Style Components** - Receipt-style boxes with jagged edges throughout the landing page
- **How It Works Section** - Interactive how it works section with clickable steps
- **Bill Splitting Mockups** - Receipt, split options, expense tracker, and upload notification mockups
- **Pricing Section** - Pricing section with free, monthly, and lifetime pro plans
- **Customer Feedback Section** - Testimonials and customer feedback section
- **Receipt Pattern Backgrounds** - Receipt pattern backgrounds and gradients for visual consistency
- **Next.js Image Optimization** - Configured Next.js for Unsplash image optimization
- **Redesign Landing Page** - Updated hero banner, pricing, customer
- **Added layout to Dashboard/User Page** - Added layout to dashboard/user page
- **Sidebar Navigation** - Implemented collapsible sidebar with active menu state and cookie persistence
- **Sidebar Components** - Added app sidebar, nav main, nav user, and site header components
- **Shadcn UI Components** - Added avatar, button, dropdown menu, input, separator, sheet, sidebar, skeleton, and tooltip components
- **Groups Feature** - Added groups page and groups list component with supabase queries
- **User Store** - Implemented zustand store for global user state management with localstorage persistence
- **Mobile Hook** - Added custom hook to detect mobile screen sizes
- **Group Types** - Added comprehensive typescript types for groups, members, and queries
- **Database Migrations** - Added initial schema, rls policies, and indexes migrations
- **Supabase Queries** - Split queries into client-side and server-side implementations

### Changed

- **Project Structure** - restructured entire codebase with clear separation of concerns
- **Component Organization** - moved feature components from `/components/dashboard/` to `/components/groups/components/`
- **Type Imports** - updated all type imports to use centralized `/types/` folder
- **Provider Location** - relocated UserProvider from components to infrastructure (`lib/providers/`)
- **Query Location** - moved database queries to `lib/supabase/queries/` for better organization
- **Mock Data Location** - centralized mock data in `lib/mocks/` folder
- **Server Actions Location** - organized server actions in `hooks/` folder
- **Documentation Organization** - moved all documentation files to `md/` folder for cleaner root directory

### Removed

- **Duplicate Type Definitions** - removed type files from feature folders after centralization
- **Old Component Folders** - cleaned up legacy component structure (`components/dashboard/`, `components/layout/`, etc)
- **Test Pages** - removed obsolete test-groups page
- **Unused Components** - deleted unused GroupCardCredit and CreateGroupForm components
- **Legacy Import Paths** - removed outdated import references throughout codebase

- **Dashboard Layout** - Refactored dashboard to use new sidebar layout instead of header
- **Tailwind Config** - Updated to tailwind v4 with custom theme variables and css layers
- **Component Structure** - Reorganized components into sidebar, dashboard, and ui directories
- **User Type Definitions** - Enhanced user types with additional oauth metadata fields

### Fixed

- **RLS Infinite Recursion** - Fixed infinite recursion in supabase rls policies by avoiding self-referencing queries in group_members policies
- **React Strict Mode Duplicate Calls** - Prevented duplicate api calls in groupslist component using useref flag
- **Tailwind CSS Variables** - Fixed css variable usage in arbitrary values by wrapping in var()
- **Sidebar Active State** - Implemented smooth active menu transitions with purple gradient background

### Removed

- **Header Component** - Removed old header component in favor of new sidebar navigation
