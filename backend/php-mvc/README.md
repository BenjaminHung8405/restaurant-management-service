# PHP MVC Skeleton (Vertrigo Ready)

This folder contains a lightweight MVC scaffold for PHP projects.

## Structure

- app/Controllers: Request handlers
- app/Models: Data access layer
- app/Views: Presentation templates
- app/Core: Router, app kernel, request, response, database
- app/Config: App and database configuration
- app/Middlewares: Middleware classes
- bootstrap: Bootstrapping and autoload
- public: Apache document root (front controller)
- routes: Web route registration
- storage: Runtime files (logs and cache)

## Quick start

1. Copy .env.example to .env and update DB credentials.
2. Import database schema from ../schema.sql.
3. Point Apache document root to this folder's public directory.
4. Open APP_URL from .env in browser.

## Default route

- GET / -> HomeController@index
