FROM python:3.11-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# Copy project
COPY . /app

# Install dependencies
RUN pip install --upgrade pip
# Install runtime dependencies from requirements.txt instead of building the
# project package. Building the project fails because the repo uses a
# flat layout with many top-level Django apps (setuptools package discovery
# refuses to proceed). Installing from requirements avoids that error.
RUN pip install -r requirements.txt

# Collect static
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
