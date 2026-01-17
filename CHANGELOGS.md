# Changelog

## [Unreleased]

### Added

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
