# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Устанавливаем все зависимости (включая dev)
COPY package*.json ./
RUN npm ci

# Копируем исходники и билдим
COPY . .
RUN npm run build

# ---------- Run stage ----------
FROM node:20-alpine AS run
WORKDIR /app

# Копируем только нужное для запуска
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/src/main.js"]
