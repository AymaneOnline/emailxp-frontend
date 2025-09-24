FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# Serve the build
RUN npm install -g serve

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "serve -s build -l $PORT"]
