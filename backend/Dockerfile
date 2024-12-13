# Use an official Python runtime as a base image
FROM python:3.10

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file to the working directory
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the app runs on
EXPOSE 8000

# Command to run the application using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--lifespan=on", "--use-colors", "--loop", "uvloop", "--http", "httptools", "--reload", "--log-level", "debug"]
