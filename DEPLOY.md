# Инструкции по деплою

## Деплой бекенда на Render

### Вариант 1: Используя render.yaml (рекомендуется)

1. Создайте аккаунт на [Render.com](https://render.com)
2. Перейдите в Dashboard → New → Blueprint
3. Подключите ваш GitHub репозиторий
4. Render автоматически обнаружит `render.yaml` и настроит сервис

### Вариант 2: Ручная настройка

1. Создайте аккаунт на [Render.com](https://render.com)
2. Создайте новый Web Service
3. Подключите ваш GitHub репозиторий
4. Настройки:
   - **Name**: `leotype-backend`
   - **Root Directory**: оставьте пустым (не указывайте `server`)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build:server`
   - **Start Command**: `npm run start:server` или `node server/dist/index.js`
   - **Plan**: Free (или выберите нужный план)

5. Добавьте переменные окружения в настройках сервиса:
   - `XAI_API_KEY` - ваш API ключ от XAI (начинается с `xai-`)
   - `NODE_ENV` - `production`
   - `ALLOWED_ORIGINS` - URL вашего фронтенда на Vercel (например: `https://your-app.vercel.app`)

6. После деплоя скопируйте URL вашего сервиса (например: `https://leotype-backend.onrender.com`)

## Деплой фронтенда на Vercel

1. Создайте аккаунт на [Vercel.com](https://vercel.com)
2. Импортируйте ваш GitHub репозиторий
3. Настройки проекта:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Добавьте переменную окружения:
   - `VITE_API_URL` - URL вашего бекенда на Render (например: `https://leotype-backend.onrender.com`)

5. Нажмите Deploy

## Важные моменты

- После деплоя бекенда, обновите `ALLOWED_ORIGINS` на Render, добавив URL вашего фронтенда
- Убедитесь, что переменная `VITE_API_URL` на Vercel указывает на правильный URL бекенда
- Если используете кастомный домен, добавьте его в `ALLOWED_ORIGINS` на бекенде

## Проверка работы

1. Откройте ваш фронтенд на Vercel
2. Включите AI генерацию в настройках
3. Попробуйте сгенерировать текст - должно работать

## Локальная разработка

Для локальной разработки создайте файл `.env` в корне проекта:

```
XAI_API_KEY=xai-your-api-key-here
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
VITE_API_URL=http://localhost:3001
```

Запуск:
```bash
npm run dev:all
```
