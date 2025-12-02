# FROM node:20-alpine
# RUN apk add --no-cache openssl

# EXPOSE 3000

# WORKDIR /app

# ENV NODE_ENV=production

# COPY package.json package-lock.json* ./

# RUN npm ci --omit=dev && npm cache clean --force

# COPY . .

# RUN npm run build

# CMD ["npm", "run", "docker-start"]
FROM node:20-alpine
RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# Build the Remix app
RUN npm run build

EXPOSE 3000

# Railway requires the app to bind to 0.0.0.0
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["npm", "run", "docker-start"]
