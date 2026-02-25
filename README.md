# Leotype

Тренажер скорости печати с AI-генерацией текста, режимом памяти, PvP-гонками и рейтинговым матчмейкингом.

## Возможности
- Режимы: time, words, quote, memory (тренировка памяти) и ranked (рейтинговые гонки)
- AI-тексты по теме и сложности через xAI Grok, с авто-пополнением словаря
- Словарный режим на Postgres/Prisma для оффлайн-генерации текста
- PvP-гонки: комнаты, публичные/приватные лобби, синхронизация результатов
- Ranked PvP: автоподбор соперника по рейтингу с ботом-подменой при долгом поиске, мгновенный отчет о приросте рейтинга
- Профиль игрока: рейтинг, победы/поражения, winrate, средние WPM и точность
- Темы: dark, light, neon, ocean, forest
- RU/EN интерфейс и выбор языка словаря
- Детальная статистика: WPM, точность, график скорости
- Виртуальная клавиатура, анимации и эффекты

## Стек
- React 18, Vite, TypeScript
- Express, Socket.io
- Prisma + PostgreSQL
- Zustand, Tailwind CSS, Framer Motion

## Требования
- Node.js 18+
- PostgreSQL

## Установка и запуск
1. Установите зависимости: `npm install`
2. Создайте `.env` в корне проекта и заполните переменные
3. Примените миграции: `npx prisma migrate dev`
4. Запустите приложение: `npm run dev:all`

Отдельный запуск фронта и бэкенда:
```bash
npm run dev:server
npm run dev
```

- Фронтенд: `http://localhost:5173`
- Бекенд API: `http://localhost:3001`

## Переменные окружения
Сервер:
- `DATABASE_URL` - строка подключения к Postgres
- `JWT_SECRET` - секрет для JWT
- `XAI_API_KEY` - ключ xAI для AI-генерации (опционально, но нужен для AI)
- `ALLOWED_ORIGINS` - список origin через запятую для CORS
- `PORT` - порт сервера (по умолчанию 3001)
- `AUTH_USERNAME_MIN` - минимальная длина логина
- `AUTH_PASSWORD_MIN` - минимальная длина пароля
- `DICTIONARY_LANGUAGES` - языки словаря через запятую (например `ru,en`)
- `DICTIONARY_DEFAULT_LANGUAGE` - язык словаря по умолчанию

Клиент (Vite):
- `VITE_API_URL` - базовый URL API (в dev по умолчанию `http://localhost:3001`)
- `VITE_SOCKET_URL` - URL Socket.io (по умолчанию как API)
- `VITE_SUPPORTED_LANGUAGES` - языки интерфейса (например `ru,en`)
- `VITE_DEFAULT_LANGUAGE` - язык интерфейса по умолчанию

Пример `.env`:
```bash
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/leotype
JWT_SECRET=change-me
XAI_API_KEY=xai-...
ALLOWED_ORIGINS=http://localhost:5173
PORT=3001
DICTIONARY_LANGUAGES=ru,en
DICTIONARY_DEFAULT_LANGUAGE=ru

VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
VITE_SUPPORTED_LANGUAGES=ru,en
VITE_DEFAULT_LANGUAGE=ru
```

## Скрипты
- `npm run dev` - фронтенд
- `npm run dev:server` - бекенд
- `npm run dev:all` - фронтенд + бекенд
- `npm run build` - сборка фронтенда
- `npm run build:server` - сборка бекенда
- `npm run start:server` - запуск собранного бекенда
- `npm run preview` - preview сборки фронтенда
- `npm run lint` - линтер
- `npm run format` - форматирование

## Структура проекта
```
leotype/
├── src/                 # фронтенд
│   ├── components/      # UI, включая memory и pvp
│   ├── config/          # настройки, i18n, темы
│   ├── services/        # API, Socket.io
│   ├── store/           # Zustand стора
│   ├── utils/           # генераторы текста, метрики
│   └── types/           # типы
├── server/              # Express + Socket.io
│   ├── config/          # конфиги сервера
│   ├── services/        # AI, словарь, PvP
│   ├── routes/          # API маршруты
│   └── db/              # Prisma клиент
├── prisma/              # схема и миграции
└── dist/                # билд фронтенда
```

## Заметки
- Режимы memory и PvP требуют авторизации.
- Если словарь пустой, режимы без AI покажут ошибку. Словарь можно наполнить через AI-генерацию или напрямую в таблице `DictionaryEntry`.
