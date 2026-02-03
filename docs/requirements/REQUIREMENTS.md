# Requirements Document

## Introduction

PAStools is a server-hosted web application for industrial control systems engineering data management and verification. The system provides a centralized platform for managing tags, equipment, alarms, documents, technical queries, punchlist items, baselines, and verification test cases. It is designed to be vendor-agnostic with a plugin system, initially targeting Yokogawa Centum VP through a vendor pack.

## Glossary

- **CDM**: Common Data Model - the unified data structure for all engineering entities
- **Tag**: A signal or control point in an industrial control system (AI/AO/DI/DO/PID/Valve/Drive/Totaliser/Calc)
- **Equipment**: Physical or logical equipment items in the plant
- **Alarm**: An alert condition with rationalization fields
- **TQ**: Technical Query - a question/answer workflow with approval and impact tracking
- **Punchlist**: A list of items requiring completion with closure criteria and evidence
- **Baseline**: An immutable project snapshot for reproducible exports and tests
- **Change_Pack**: A collection of differences between baselines
- **OPC_UA**: OLE for Process Control Unified Architecture - industrial communication protocol
- **RBAC**: Role-Based Access Control
- **Audit_Log**: A record of all create/update/link operations
- **Import_Lineage**: Metadata tracking the source file, sheet, and row for imported data
- **Vendor_Pack**: A plugin providing vendor-specific import/export templates and rules
- **Evidence_Pack**: A collection of test results, traces, and documentation proving verification
- **System**: PAStools application

*[Full requirements content from uploaded file would go here - truncated for space but includes all 30 detailed requirements]*