# Texon - RMG ERP System

A comprehensive Enterprise Resource Planning (ERP) system tailored for the Ready-Made Garment (RMG) industry. This system streamlines production, inventory, order management, and various operational workflows specific to garment manufacturing.

## 📸 Screenshots

![Admin Home](ui-image/admin-home.png)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Ensure you have the following installed:
- [Python 3.8+](https://www.python.org/downloads/)
- [PostgreSQL](https://www.postgresql.org/download/) or [MySQL](https://dev.mysql.com/downloads/)
- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/)
- [uv](https://github.com/astral-sh/uv) (For Python dependency management)
- [Docker](https://www.docker.com/) (Optional, for containerized deployment)

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd texon/backend
```

#### 2. Create and activate a virtual environment
```bash
uv venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
```

#### 3. Install Python dependencies
```bash
uv pip install -r requirements.txt
```

#### 4. Configure Environment Variables
Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database Configuration
DB_NAME=texon
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=[IP_ADDRESS]
DB_PORT=5432

# Django Settings
SECRET_KEY=your_secret_key_here
DEBUG=True
ALLOWED_HOSTS=*

# Email Configuration (Optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@example.com
EMAIL_HOST_PASSWORD=your_email_password
```

#### 5. Run Database Migrations
```bash
uv run manage.py migrate
```

#### 6. Collect Static Files
```bash
uv run manage.py collectstatic
```

#### 7. Create Superuser (Optional)
```bash
uv run manage.py createsuperuser
```

#### 8. Start Development Server
```bash
uv run manage.py runserver
```

## 🏗️ Project Structure

```
backend/
├── config/              # Django project settings and config
├── authentication/      # User authentication and profile management
├── operations/          # Core operations (Orders, Purchases, Sales, Production)
├── inventory/           # Inventory and stock management
├── master_data/         # Static and master data (Colors, Sizes, Fabrics, etc.)
├── reports/             # Report generation
├── settings/            # Settings modules
└── static/              # Static files
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 6.0
- **API**: Django REST Framework
- **Database**: PostgreSQL / MySQL
- **Authentication**: JWT, Social Auth
- **Documentation**: drf-spectacular (OpenAPI/Swagger)
- **Validation**: Pydantic (via `pydantic-settings`)
- **Deployment**: Gunicorn, Nginx (optional)

### Frontend
- **Framework**: Django Templates + HTMX
- **Styling**: Tailwind CSS (compiled via Django)
- **UI Kit**: Unfold Admin (Custom Admin Interface)

## 🧪 Testing

Run the test suite using pytest:
```bash
uv run pytest
```

## 🚀 Deployment

### Docker Deployment

For a production deployment, use the provided Docker configuration.

1. **Build and Run Containers**:
   ```bash
   docker-compose -f docker-compose.yml up -d --build
   ```

2. **Access the Application**:
   - **Frontend**: http://localhost:8000
   - **Admin**: http://localhost:8000/admin
   - **API Docs**: http://localhost:8000/swagger-ui/

3. **Stop Containers**:
   ```bash
   docker-compose -f docker-compose.yml down
   ```

### Manual Production Setup

If deploying manually:
1. Install Gunicorn: `pip install gunicorn`
2. Configure Nginx as a reverse proxy
3. Set up systemd service for Gunicorn
4. Configure SSL/TLS certificates

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.