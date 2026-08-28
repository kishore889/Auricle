FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV APP_HOME=/app

# Create a non-root user
RUN addgroup --system appuser && adduser --system --group appuser

# Set working directory
WORKDIR $APP_HOME

# Install system dependencies (if needed, e.g., for audio libs in the future)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools \
    && pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Ensure entrypoint is executable
RUN chmod +x entrypoint.sh

# Change ownership of the app directory to the non-root user
RUN chown -R appuser:appuser $APP_HOME

# Switch to non-root user
USER appuser

EXPOSE 8000

# Run entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
