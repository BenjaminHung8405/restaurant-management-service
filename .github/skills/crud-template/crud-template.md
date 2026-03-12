# SKILL: Generate Clean Architecture CRUD Module

When asked to "generate a CRUD module for [EntityName]", you MUST strictly follow this blueprint and output the exact production-ready TypeScript code for the following 4 files. 

Assume standard Express.js, `pg` (node-postgres) pool, and our standard `AppError` and standard JSON response `{ success, message, data }`.

1. **Repository (`src/infrastructure/repositories/[entityName]Repository.ts`)**
- Import `pool`.
- Implement and export async functions: `findAll()`, `findById(id)`, `create(data)`, `update(id, data)`, `remove(id)`.
- Use parameterized queries ($1, $2...) and `RETURNING *`.

2. **Service (`src/services/[entityName]Service.ts`)**
- Import the Repository and `AppError`.
- Implement and export async functions that call the Repository.
- Add business logic (e.g., throw 404 `AppError` if `findById` returns null, or throw 400 if a unique constraint is violated).

3. **Controller (`src/controllers/[entityName]Controller.ts`)**
- Import the Service.
- Implement and export Express middlewares: `getAll`, `getOne`, `create`, `update`, `delete`.
- Wrap everything in `try/catch`. 
- Return standard JSON responses.

4. **Routes (`src/routes/[entityName]Routes.ts`)**
- Import Express, the Controller, and the `authMiddleware` (`protect`, `restrictTo`).
- Map standard REST routes: 
  - `GET /` -> `getAll`
  - `GET /:id` -> `getOne`
  - `POST /` -> `protect`, `restrictTo('admin')`, `create`
  - `PUT /:id` -> `protect`, `restrictTo('admin')`, `update`
  - `DELETE /:id` -> `protect`, `restrictTo('admin')`, `delete`