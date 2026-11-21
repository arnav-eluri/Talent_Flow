# TalentFlow - HR Management System

A modern, responsive HR platform built with **React, TypeScript, and Tailwind CSS** for managing candidates, employees, onboarding/offboarding, and HR analytics.

## Features
- **Dashboard:** Real-time HR metrics  
- **Candidate & Employee Management:** Track records, onboarding/offboarding  
- **Interview Scheduling:** Organize interviews  
- **Document Management:** Upload & verify HR documents  
- **Analytics & Reporting:** Role-based insights for HR managers, department heads, and employees  

## Tech Stack
- **Frontend:** React 18 + TypeScript  
- **Styling:** Tailwind CSS  
- **State Management:** React Query  
- **Routing:** React Router v6  
- **Charts & UI Components:** Recharts, Radix UI, Lucide React  

## Responsive Design
- Mobile: Sidebar hidden, single-column layouts  
- Tablet: Sidebar visible, 2-column grids  
- Desktop: Collapsible sidebar, 3-4 column layouts, max width `7xl`  
- Touch-friendly, mobile-first, smooth animations, lazy-loaded components  

## Design System

Our design is based on a clean, modern, and accessible HR interface with consistent UI patterns.

###  Color Palette
- Primary: `hsl(172, 65%, 36%)` — deep forest teal (unique in HR SaaS)
- Sidebar: `hsl(172, 55%, 9%)` — deep dark teal
- Background: `hsl(168, 20%, 97%)` — teal-tinted off-white
- Accents: Blue, Green, Yellow, Red for status badges
- Neutral teal-greys for text hierarchy

###  Typography
- **Aptos** – Microsoft’s modern humanist sans-serif (system font on Windows 11+), falls back to Segoe UI
- Consistent font sizes using Tailwind’s scale

###  Spacing & Layout
- 8px spacing grid system
- Fluid responsive containers up to `max-w-7xl`
- Card-based UI with soft shadows and rounded corners (`rounded-xl`, `rounded-2xl`)

### Components
Reusable components designed:
- Navigation sidebar  
- Top search bar  
- Candidate cards  
- Employee cards  
- Interview cards  
- Modals, inputs, buttons  
- Tag badges for skills & statuses  


## Project Structure
```bash
src/
├── components/
│   ├── ui/          # shadcn/ui primitives
│   ├── layout/      # AppLayout, Header, Sidebar
│   └── dashboard/   # Dashboard widgets
├── contexts/        # React contexts (AuthContext)
├── hooks/           # Custom hooks
├── lib/             # API client, utilities
├── pages/           # Page components
├── types/           # TypeScript types
├── App.tsx
├── main.tsx
└── index.css

server/
├── src/
│   ├── routes/      # Express route handlers
│   ├── data.ts      # In-memory data store (seeded from JSON)
│   ├── store.ts     # JSON persistence helpers
│   ├── types.ts     # Shared TypeScript types
│   └── index.ts     # Express entry point
└── package.json
```

## Getting Started
```bash
npm install        # or bun install
npm run dev        # or bun run dev
```

