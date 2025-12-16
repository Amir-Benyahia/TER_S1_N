# Multi-runtime image for Node + Python maze generator
FROM cgr.dev/chainguard/node:latest

# Install Python runtime and pip for the maze generator bridge
RUN apk add --no-cache python3 py3-pip

WORKDIR /app

# Install Node dependencies first to leverage Docker layer caching
COPY package*.json ./
RUN npm ci

# Install Python dependencies used by the generator
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the remaining application code
COPY . .

ENV PORT=3000
EXPOSE 3000

# Start the HTTP server (Express serves the frontend and proxies to Python)
CMD ["npm", "start"]
