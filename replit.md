# EffectForge AI - Digital Special Effects Generator

## Overview

EffectForge AI is a revolutionary special effects generator powered by artificial intelligence, designed to create and manage visual effects across multiple platforms. The application features a sophisticated full-stack architecture with React frontend, Express.js backend, and an intelligent AI engine that generates effects with "constitutional compliance" - ensuring performance, compatibility, and visual excellence standards.

The system is built to become a standalone desktop application (.exe) with local intelligence capabilities, zero external dependencies in production, and a focus on 60fps performance with sub-200ms response times.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18+ with TypeScript**: Modern component-based UI using functional components and hooks
- **shadcn/ui Component System**: Consistent design system with Radix UI primitives and Tailwind CSS
- **Wouter Router**: Lightweight client-side routing for navigation
- **TanStack Query**: Server state management with caching and synchronization
- **Vite Build System**: Fast development and optimized production builds
- **Custom Cursor & Particle Effects**: Enhanced UI experience with visual effects

### Backend Architecture
- **Express.js with TypeScript**: RESTful API server with comprehensive middleware
- **Modular Service Architecture**: Separated concerns with dedicated services for AI engine, file parsing, effect generation, constitution validation, and performance monitoring
- **In-Memory Storage**: Currently using MemStorage class for development, designed to be replaced with database integration
- **Multer File Handling**: Support for multiple file formats (TXT, MD, JSON, CSV, PDF, DOCX, XLSX, RTF, XML)
- **Real-time Performance Monitoring**: System metrics collection and health monitoring

### AI Engine & Effect Generation
- **DAAR Methodology**: Four-phase effect generation process (DÉCONSTRUIRE, AMÉLIORER, AMPLIFIER, RECONSTRUIRE)
- **Constitutional Compliance System**: Seven-article constitution ensuring effect quality and performance standards
- **Multi-format Code Generation**: Supports JavaScript, CSS, and After Effects code generation
- **Local Intelligence**: Designed for offline operation with embedded neural processing
- **Effect DNA Analysis**: Content analysis and optimization based on emotional profiles and technical requirements

### Database Design
- **PostgreSQL with Drizzle ORM**: Type-safe database operations with schema-first approach
- **Effects Table**: Complete effect metadata including code implementations, performance metrics, and constitutional compliance scores
- **Files Table**: File upload management with parsing status and content storage
- **AI Sessions Table**: Tracking of AI processing sessions and results
- **System Metrics Table**: Performance and health monitoring data

### Build & Deployment
- **Dual Build Process**: Separate client (Vite) and server (esbuild) builds
- **Production Ready**: Configured for standalone deployment with static asset serving
- **Development Tools**: Hot reload, runtime error overlay, and Replit integration
- **TypeScript Strict Mode**: Comprehensive type safety across the entire codebase

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connector optimized for serverless environments
- **drizzle-orm & drizzle-kit**: Type-safe ORM and migration tools for database management
- **express**: Web application framework for the backend server
- **react & react-dom**: Frontend UI library and DOM renderer

### UI & Styling Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives for building the component system
- **tailwindcss**: Utility-first CSS framework for consistent styling
- **class-variance-authority & clsx**: Utility libraries for conditional CSS class management
- **lucide-react**: Icon library providing consistent iconography

### Development & Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Type system for enhanced development experience
- **tsx**: TypeScript execution environment for development
- **esbuild**: Fast JavaScript bundler for production builds

### Utility Libraries
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form & @hookform/resolvers**: Form management with validation
- **zod & drizzle-zod**: Schema validation and type inference
- **wouter**: Lightweight routing for single-page application
- **date-fns**: Date manipulation utilities
- **multer**: Middleware for handling multipart/form-data file uploads

### AI & Processing
- **nanoid**: Unique ID generation for entities
- **connect-pg-simple**: PostgreSQL session store for Express sessions

The architecture emphasizes local processing capabilities, performance optimization, and constitutional compliance standards while maintaining flexibility for future enhancements and desktop application packaging.