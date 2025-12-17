FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm ci --only=production

FROM base AS build
RUN npm ci
COPY . .

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps ./apps
COPY --from=build /app/services ./services
COPY --from=build /app/lib ./lib
COPY --from=build /app/middleware ./middleware
COPY --from=build /app/server.js ./
COPY --from=build /app/mcp-server.js ./
COPY --from=build /app/package.json ./
EXPOSE 5000
CMD ["node", "server.js"]
