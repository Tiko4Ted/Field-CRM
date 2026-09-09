# Field-CRM

Field-CRM is a modern, responsive web application built for field agents to track and manage school client acquisition and intelligence. 

It replaces the manual tracking of leads and visits in notebooks by providing a digital pipeline where you can gather intelligence, schedule visits, and ultimately convert prospects into active school records with comprehensive contact details.

## Core Features

- **Intelligence Pipeline**: Log prospective schools with details like estimated student counts, school type, and current system usage. 
- **Visit Scheduling**: Set a "Plan Visit Date" on intelligence records to automatically populate a weekly/calendar schedule view, ensuring you know exactly who to visit and when.
- **Schools Management**: Maintain a comprehensive database of visited schools.
- **Smart Importing**: When creating a new school record, you can import data directly from a scheduled intelligence record, seamlessly linking the two and updating the prospect's status to "VISITED".
- **Contact Management**: Keep track of multiple contacts per school, including their roles and designating a primary follow-up contact.
- **Universal Search**: Quickly find schools, intelligence records, or specific contacts by name, location, or phone number.
- **Mobile-First UI**: Designed for the field, the application features a flat, card-less interface with bottom navigation on mobile devices, ensuring quick one-handed use during school visits.

## Technology Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query, React Hook Form, Zod
- **Backend**: NestJS, Prisma, PostgreSQL
- **Database**: PostgreSQL through Docker for local development

## Structure

- `/client` - Contains the React frontend application. Run `npm run dev` to start the frontend server.
- `/api` - Contains the NestJS backend application. Run `npm run start:dev` to start the backend server.

## Getting Started

1. Clone the repository.
2. Copy `/api/.env.example` to `/api/.env`.
3. Start PostgreSQL from the repo root with `docker compose up -d`.
4. In `/api`, run `npm install`, `npx prisma generate`, and `npx prisma db push`.
5. In `/api`, run `npm run start:dev`.
6. In `/client`, run `npm install` and `npm run dev`.
