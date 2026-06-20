# Phase 0 — Environment Setup (Day 1, ~4 hours)

Ordered by dependency. Complete every item before moving to Phase 1.

---

- [ ] **0.1** Install: Python 3.12, Node.js 20 LTS, PostgreSQL 16, Redis 7, Docker Desktop

- [ ] **0.2** Create GitHub repo: `garments-erp`

  Structure:

  ```
  /backend    (Django project)
  /frontend   (Next.js project)
  /docs       (your domain notes)
  /scripts    (deployment, seed data)
  docker-compose.yml
  .env.example
  ```

- [ ] **0.3** Create Python virtual environment

  ```bash
  pip install django djangorestframework
  django-rest-framework-simplejwt
  psycopg2-binary redis celery django-celery-beat
  django-cors-headers drf-spectacular
  django-filter python-decouple
  ```

- [ ] **0.4** Scaffold Next.js frontend

  ```bash
  npx create-next-app@latest frontend \
    --typescript --tailwind --app --src-dir
  cd frontend && npx shadcn@latest init
  ```

- [ ] **0.5** `docker-compose.yml` with services: `postgres`, `redis`  
  (Run Django and Next.js locally, not in Docker yet)

- [ ] **0.6** Create `.env` file with:

  - `DATABASE_URL`
  - `REDIS_URL`
  - `SECRET_KEY`
  - `DEBUG=True`
  - `ALLOWED_HOSTS`

- [ ] **0.7** Django project and apps

  ```bash
  django-admin startproject core .
  python manage.py startapp accounts
  python manage.py startapp organizations
  python manage.py startapp buyers
  python manage.py startapp styles
  python manage.py startapp inventory
  python manage.py startapp production
  python manage.py startapp quality
  python manage.py startapp planning
  ```

- [ ] **0.8** Configure settings:

  - `INSTALLED_APPS`
  - `DATABASES` (PostgreSQL)
  - `CACHES` (Redis)
  - `REST_FRAMEWORK` defaults
  - CORS settings
  - `SIMPLE_JWT` settings

---

**Next:** [Phase 1 — Identity & Security](phase-01-identity-security.md)
