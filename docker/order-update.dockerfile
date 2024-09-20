# Указываем базовый образ
FROM node:18-alpine

# Указываем рабочую директорию
WORKDIR /app/order-update

# Копируем все файлы проекта
COPY order-update/ ./

# Копируем package.json и устанавливаем зависимости
RUN npm install

# Используем entrypoint для запуска миграций и приложения
ENTRYPOINT ["npm", "run", "start:dev"]
