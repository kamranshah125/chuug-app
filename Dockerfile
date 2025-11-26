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
FROM node:20-alpine

# Install OpenSSL (Prisma needs it)
RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma

RUN npm install
RUN npx prisma generate

COPY . .

RUN npm run build

CMD ["npm", "start"]
