# Use Python 3.9 slim image as base
FROM python:3.9-slim

# Set working directory in container
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and static files
COPY bookstore_server.py .
COPY static/ static/

# Expose port 8080
EXPOSE 8080

# Set environment variables (can be overridden by Kubernetes)
ENV FLASK_APP=bookstore_server.py
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["python", "bookstore_server.py"]
