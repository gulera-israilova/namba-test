# Указываем базовый образ
FROM node:18-alpine

# Указываем рабочую директорию
WORKDIR /app/order-create

# Копируем все файлы проекта
COPY order-create/ ./

# Копируем package.json и устанавливаем зависимости
RUN npm install

# Используем entrypoint для запуска миграций и приложения
ENTRYPOINT ["/bin/sh", "-c", "npm run migration:run && npm run start:dev"]
