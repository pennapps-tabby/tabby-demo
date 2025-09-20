# Use a base image with Node.js and Python
FROM mcr.microsoft.com/devcontainers/universal:2-linux

# Set the working directory
WORKDIR /app

# Copy the entire project into the container
COPY . .

# Expose ports for the backend and frontend
EXPOSE 5000
EXPOSE 5173

# Command to run when the container starts (optional, can be overridden by devcontainer.json)
# CMD ["bash"]