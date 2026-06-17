FROM python:3.11-slim-bookworm

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies and run security upgrades
# - poppler-utils is required for pdf2image
# - libgl1 and libglib2.0-0 are often required for vision/opencv libraries
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Upgrade pip itself (often flags in scanners) and install Python dependencies
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Ensure the uploads directory exists
RUN mkdir -p uploads

# Expose the port (Railway will provide the $PORT environment variable dynamically)
EXPOSE 8000

# Run the FastAPI application using uvicorn
# We use sh -c to allow interpolation of the $PORT variable provided by Railway
CMD ["sh", "-c", "uvicorn backend.api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
