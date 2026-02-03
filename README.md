# PAStools Platform 🏭

Industrial Control System Engineering Data Management Platform

## Overview

PAStools is a comprehensive web-based platform for managing industrial control systems engineering data. It provides a centralized solution for tags, equipment, alarms, documents, technical queries, punchlist items, and verification testing.

## Architecture

- **Frontend**: React + TypeScript + Material-UI
- **Backend**: NestJS + TypeScript + TypeORM  
- **Database**: PostgreSQL + Redis + MinIO
- **Features**: OPC UA integration, testing automation, evidence packs, plugin system

## Key Features

### 🏗️ Core Platform
- **Project Management** - Multi-project support with role-based access
- **Common Data Model** - Unified storage for all engineering entities
- **Universal Linking** - Link any entity to any other entity
- **Audit Logging** - Complete change tracking and compliance
- **File Storage** - S3-compatible attachment system

### 📊 Data Management  
- **Spreadsheet Import** - CSV/XLSX import with mapping profiles
- **Data Validation** - Configurable rule packs for quality assurance
- **Export Engine** - Generate reports in multiple formats
- **Merge & Deduplication** - Clean up duplicate data
- **Global Search** - Full-text search across all entities

### 🔄 Workflows
- **Punchlist Management** - Track commissioning completion
- **Technical Query Workflow** - Threaded Q&A with approval process
- **Change Control** - Baseline management and change packs
- **Reporting** - Dashboards and traceability matrices

### 🧪 Verification Automation
- **OPC UA Integration** - Connect to live plant data
- **Signal Emulation** - Generate test signals and inject faults  
- **Scenario Runner** - YAML-based test automation
- **Evidence Packs** - Automated verification documentation

### 🔌 Extensibility
- **Plugin Framework** - Vendor-specific extensions
- **Yokogawa Centum VP** - Built-in vendor pack

## Project Status

**Phase 1** (Core Platform) - *In Progress*
- ✅ Project structure & dependencies
- ✅ Database schema & migrations  
- ✅ Authentication & authorization
- ✅ File storage & audit logging
- ✅ CDM entity modules & linking
- ✅ Global search & frontend shell

**Phase 2** (Data Ingestion) - *Planned*
- Spreadsheet import wizard
- Validation rules engine  
- Export engine
- Job management system

## Quick Start

```bash
# Clone and setup
git clone https://github.com/hopkinsbl/pastools.git
cd pastools

# Start development environment  
docker-compose up -d

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Run development servers
npm run dev
```

## Documentation

- **[Design Document](docs/design/DESIGN_DOCUMENT.md)** - Complete system architecture
- **[Requirements](docs/requirements/REQUIREMENTS.md)** - Detailed functional requirements  
- **[Implementation Plan](docs/implementation/IMPLEMENTATION_PLAN.md)** - Phase-by-phase development roadmap

## Contributing

See [Issues](../../issues) for current development tasks and planning discussions.

---

**🎯 Goal**: Enterprise-grade industrial engineering data management platform with advanced verification capabilities.

*Managed via [hopkinsbl/project-hub](https://github.com/hopkinsbl/project-hub)*