# FROM node:20-alpine
# RUN apk add --no-cache openssl

# EXPOSE 3000
# WORKDIR /app
# ENV NODE_ENV=production

# # Copy package files first
# COPY package.json package-lock.json* ./

# # Copy Prisma schema
# COPY prisma ./prisma

# # Install all dependencies including dev dependencies temporarily
# RUN npm install

# # Generate Prisma client for linux-musl
# RUN npx prisma generate
# RUN npx prisma migrate deploy

# # Remove dev dependencies to keep image light
# RUN npm prune --production

# # Copy rest of the application
# COPY . .

# # Build your project
# RUN npm run build

# # Start the app
# # CMD ["npm", "run", "docker-start"]\
# CMD ["npm", "start"]
#newww......
# -----------------------------
# Base image
# -----------------------------
FROM node:20

# -----------------------------
# Install OS dependencies
# -----------------------------
RUN apt-get update && apt-get install -y openssl

# -----------------------------
# Set working directory
# -----------------------------
WORKDIR /app

# -----------------------------
# Copy package files and install dependencies
# -----------------------------
COPY package.json package-lock.json ./
RUN npm install
RUN npm install -g @react-router/serve

# -----------------------------
# Copy the rest of the source code
# -----------------------------
COPY . .

# -----------------------------
# Expose the app port
# -----------------------------
EXPOSE 3000

# -----------------------------
# Set environment variable placeholders (optional defaults)
# -----------------------------
ENV NODE_ENV=production
ENV PORT=3000

# -----------------------------
# Start command: generate Prisma client at runtime, then start app
# -----------------------------
#CMD npx prisma generate && npm run docker-start
CMD ["node", "build/index.js"]

