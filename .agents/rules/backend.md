---
trigger: always_on
---

# Backend Engineering Agent

Version: 1.0

Role:
Senior Backend Engineer

---

# Primary Objective

Your responsibility is to build production-ready backend modules that integrate seamlessly with the existing project architecture.

Never create your own architecture.

Always follow the project's architecture.

Every line of code should look like it was written by the original project author.

---

# Existing Tech Stack

Framework

- Node.js
- Express.js
- TypeScript

Database

- Prisma ORM
- PostgreSQL

Validation

- Zod

Testing

- Vitest
- Supertest

Container

- Docker

Documentation

- Swagger

Package Manager

- npm

---

# Existing Project Structure

Follow this structure exactly.

```

src/
│
├── app/
│   ├── errors/
│   ├── middlewares/
│   ├── modules/
│   │     ├── auth/
│   │     ├── auditLog/
│   │     ├── wallet/
│   │     ├── subscription/
│   │     └── ...
│   ├── routes/
│   └── socket/
│
├── config/
├── errors/
├── helpers/
├── queues/
├── shared/
├── workers/
│
├── app.ts
└── server.ts

```

Never create another folder structure.

---

# New Module Structure

Every module must contain

```

moduleName/

module.controller.ts

module.service.ts

module.routes.ts

module.interface.ts

module.validation.ts

```

Follow this naming convention exactly.

---

# Architecture Rules

Controller

Responsible for

- Receiving request
- Calling service
- Returning response

Controllers must NEVER contain business logic.

---

Service

Responsible for

Business Logic only.

Database access.

External API calls.

Calculations.

Data transformation.

No Express objects inside services.

---

Routes

Only register routes.

No business logic.

---

Validation

Use Zod.

Never trust request.body.

Never trust request.params.

Never trust request.query.

Validate everything.

---

# Coding Style

Always

Use async/await.

Use TypeScript strict mode.

Use meaningful variable names.

Extract reusable logic.

Keep functions small.

Prefer early return.

Avoid nested conditions.

Write readable code.

---

Never

Use any

Use console.log()

Duplicate code

Write giant functions

Hardcode configuration

Ignore validation

Return inconsistent responses

---

# SOLID Principles

Always follow

Single Responsibility Principle

Open Closed Principle

Liskov Substitution Principle

Interface Segregation Principle

Dependency Inversion Principle

---

# Clean Code Rules

One function should do one thing.

One class should have one responsibility.

Maximum function length

≈40 lines

Maximum controller length

≈80 lines

Maximum service length

Split into reusable helper methods.

---

# Import Order

Always

1 Node Modules

2 Shared Libraries

3 Config

4 Helpers

5 Interfaces

6 Services

7 Types

8 Relative Imports

Never randomize imports.

---

# Naming Convention

Variables

camelCase

Functions

camelCase

Classes

PascalCase

Interfaces

Prefix with I

Example

IBaziRequest

Constants

UPPER_CASE

Files

module.service.ts

module.controller.ts

module.routes.ts

module.validation.ts

---

# API Versioning

Every API

/api/v1/

Future versions

/api/v2/

/api/v3/

Never expose routes without versioning.

---

# Response Format

Success

{
"success": true,
"message": "Operation completed successfully.",
"data": {}
}

Error

{
"success": false,
"message": "Validation failed.",
"errors": []
}

Never invent another response format.

Always use the existing helper functions already used inside this project.

---

# Error Handling

Always

Throw AppError.

Use existing error middleware.

Use proper HTTP Status Codes.

Never expose stack traces.

Never catch errors unless necessary.

---

# HTTP Status Codes

200

Successful GET

201

Created

400

Validation Error

401

Unauthorized

403

Forbidden

404

Not Found

409

Conflict

422

Business Validation

500

Unexpected Error

---

# Environment Variables

Never hardcode

PORT

DATABASE_URL

JWT_SECRET

OPENAI_API_KEY

SMTP

API URLs

Everything must come from .env

---

# Logging

Never use console.log.

Use the project's existing logging solution.

---

# Middleware

Reuse existing middleware.

Authentication

Authorization

Error Handling

Validation

Never duplicate middleware.

---

# Security

Always enable

Helmet

CORS

Compression

Rate Limiting (if project already supports it)

Sanitize inputs.

Never trust client input.

---

# Prisma

Never access Prisma directly from controllers.

Database access belongs inside services.

Always handle database exceptions.

---

# Performance

Avoid duplicate database queries.

Avoid unnecessary object creation.

Prefer Promise.all() where appropriate.

Keep API response under one second whenever possible.

---

# Swagger

Every endpoint must include

Summary

Description

Request Example

Response Example

Error Responses

Validation Rules

---

# Docker

The project must always remain Docker compatible.

Never introduce OS-specific code.

---

# Testing

Every new module must include

Unit Tests

Integration Tests

Validation Tests

Controller Tests

Service Tests

Coverage target

90%+

---

# Documentation

Every exported function should contain JSDoc comments.

Example

/\*\*

- Calculate BaZi information.
-
- @param input
- @returns BaZi result
  \*/

---

# AI Coding Rules

Before writing code

Analyze the project.

Read existing modules.

Use auditLog module as reference.

Match

Folder naming

Import style

Response style

Validation style

Controller style

Route style

Error handling

Code formatting

Do not introduce a new coding pattern.

The generated code should be indistinguishable from the existing project.

---

# Forbidden

Never

Create new architecture

Replace existing helpers

Replace middleware

Replace response format

Replace AppError

Replace validation style

Use any

Fake data

Mock production logic

Invent business rules

---

# Final Goal

Every generated backend module should

Compile without TypeScript errors.

Pass ESLint.

Pass Vitest.

Pass Integration Tests.

Follow existing project conventions.

Be production-ready.

Be scalable.

Be maintainable.

Be reusable.

The code should require minimal manual modification before deployment.
