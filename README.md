# PAStools Platform

Industrial Control Systems Engineering Data Management and Verification Platform

## Overview

PAStools is a server-hosted web application for managing engineering data in industrial control systems projects. It provides a centralized platform for managing tags, equipment, alarms, documents, technical queries, punchlist items, baselines, and verification test cases.

## Architecture

- **Frontend**: React + TypeScript + Material-UI
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Job Queue**: BullMQ + Redis
- **Object Storage**: MinIO (S3-compatible)
- **Deployment**: Docker Compose

## Project Structure

```
pastools-platform/
├── packages/
│   ├── backend/          # NestJS API server
│   ├── frontend/         # React web application
│   └── shared/           # Shared types and utilities
├── docker-compose.yml    # Docker services configuration
└── package.json          # Monorepo root configuration
```

## Getting Started

### Prerequisites

- Node.js 20 LTS
- Docker and Docker Compose
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
cd packages/backend && npm install
cd ../frontend && npm install
cd ../shared && npm install
```

2. Set up environment variables:
```bash
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
```

3. Start infrastructure services:
```bash
npm run docker:up
```

4. Start development servers:

Backend:
```bash
npm run backend:dev
```

Frontend (in a separate terminal):
```bash
npm run frontend:dev
```

### Access Points

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs
- MinIO Console: http://localhost:9001

### Default Credentials

**Database:**
- Host: localhost:5432
- Database: pastools
- User: pastools
- Password: pastools_dev_password

**MinIO:**
- Console: http://localhost:9001
- Access Key: pastools
- Secret Key: pastools_dev_password

**Redis:**
- Host: localhost:6379

## Development

### Backend Development

```bash
cd packages/backend
npm run start:dev        # Start with hot reload
npm run build            # Build for production
npm run test             # Run tests
npm run migration:generate -- -n MigrationName  # Generate migration
npm run migration:run    # Run migrations
```

### Frontend Development

```bash
cd packages/frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Docker Commands

```bash
npm run docker:up        # Start all services
npm run docker:down      # Stop all services
npm run docker:logs      # View logs
```

## Technology Stack

### Backend
- NestJS - Progressive Node.js framework
- TypeORM - ORM for TypeScript and JavaScript
- PostgreSQL - Relational database
- BullMQ - Job queue for background processing
- Passport.js - Authentication middleware
- AWS SDK - S3-compatible storage client
- node-opcua - OPC UA client library

### Frontend
- React 18 - UI library
- TypeScript - Type-safe JavaScript
- Material-UI - React component library
- React Router - Client-side routing
- React Query - Server state management
- Axios - HTTP client
- Recharts - Charting library

### Infrastructure
- Docker - Containerization
- PostgreSQL 15 - Database
- Redis 7 - Cache and job queue
- MinIO - S3-compatible object storage

## Features

- **Project Management**: Multi-project support with data isolation
- **Common Data Model**: Unified storage for tags, equipment, alarms, documents
- **Universal Linking**: Link any entity to any other entity
- **File Attachments**: Attach files and evidence to entities
- **Authentication & Authorization**: Role-based access control
- **Audit Logging**: Complete audit trail of all changes
- **Data Import/Export**: CSV and Excel import/export
- **Data Validation**: Configurable validation rules
- **Baseline Management**: Immutable project snapshots
- **Change Tracking**: Compare baselines and generate change packs
- **Technical Queries**: Workflow for design questions
- **Punchlist Management**: Track commissioning items
- **OPC UA Integration**: Connect to industrial control systems
- **Test Automation**: Scenario-based verification testing
- **Evidence Generation**: Automated test evidence packs
- **Plugin System**: Vendor-specific extensions

## License

Proprietary - All rights reserved

## Support

For support and questions, please contact the development team.
