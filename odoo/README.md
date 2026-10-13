# Odoo 20.0 Community Edition (Docker Environment)

This directory contains the Dockerized Odoo 20.0 Community Edition environment and custom addons for **Texon ERP Integration**.

---

## Quick Start

### 1. Start Odoo and PostgreSQL
From within the `odoo/` directory:
```bash
docker compose up -d
```
Or from the project root:
```bash
docker compose -f odoo/docker-compose.yml up -d
```

### 2. Access Odoo Web UI
Open your browser and navigate to:
```
http://localhost:8069
```

### 3. Default Credentials & Settings
- **Database Host:** `odoo-db:5432`
- **Database User:** `odoo`
- **Database Password:** `odoo_secure_password`
- **Master Admin Password:** `admin_master_secret`
- **Default Database Name:** `texon_odoo`

---

## Directory Structure

```
odoo/
├── docker-compose.yml       # Docker compose service definitions
├── README.md                # This setup guide
├── .gitignore               # Ignored cache files
├── config/
│   └── odoo.conf            # Custom Odoo configuration
└── addons/
    └── texon_bridge/        # Custom integration addon
        ├── __init__.py
        ├── __manifest__.py
        ├── models/
        │   ├── __init__.py
        │   ├── command_receipt.py  # Idempotent receipt model
        │   └── bridge_service.py   # Atomic RPC facade
        └── security/
            └── ir.model.access.csv
```

---

## Useful Commands

### Check Container Status
```bash
docker compose ps
```

### View Live Logs
```bash
docker compose logs -f odoo
```

### Stop Containers
```bash
docker compose down
```

### Reset Data Completely
```bash
docker compose down -v
```
