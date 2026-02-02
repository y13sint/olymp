# Управление столовой

**Автоматизированная информационная система школьного питания**

Веб-приложение для организации питания учащихся в школьной столовой. Позволяет ученикам просматривать меню и оплачивать питание, поварам — вести учёт выданных блюд и остатков, администраторам — формировать отчёты и согласовывать закупки.

| | Ссылка |
|---|--------|
| **Репозиторий** | https://github.com/y13sint/olymp |
| **Видеоролик** | `[link]` |
| **Документация** | [DOCUMENTATION.docx](./DOCUMENTATION.docx) |

---

## Возможности

### Для учеников
- Регистрация и авторизация
- Просмотр меню завтраков и обедов на неделю
- Оплата питания (разово или абонементом)
- Заказ и получение питания
- Указание пищевых аллергий (с подсветкой в меню)
- Отзывы о блюдах

### Для поваров
- Учёт выданных завтраков и обедов
- Контроль остатков продуктов на складе
- Оформление заявок на закупку продуктов

### Для администраторов
- Статистика оплат и посещаемости
- Согласование заявок на закупки
- Формирование отчётов по питанию и затратам
- Управление меню и пользователями
- Система шаблонов меню

---

## Технологии

| Компонент | Технологии |
|-----------|------------|
| **Frontend** | React 18, Vite, Ant Design, TanStack Query, Zustand |
| **Backend** | Node.js, Express, Sequelize ORM |
| **База данных** | PostgreSQL 15+ |
| **Безопасность** | JWT (httpOnly), bcrypt, Helmet, CSRF, Rate Limiting |

---

## Установка и запуск

### Требования

- Node.js 18+
- Docker и Docker Compose
- Git

### 1. Клонирование репозитория

```bash
git clone <URL репозитория>
cd newSchool
```

### 2. Запуск базы данных

```bash
docker-compose up -d
```

PostgreSQL будет доступен на порту 5432.

### 3. Настройка переменных окружения

```bash
# Скопируйте файл примера
cp .env.example server/.env

# Отредактируйте server/.env при необходимости:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=school_canteen
# DB_USER=postgres
# DB_PASSWORD=postgres
# JWT_SECRET=your-secret-key
# JWT_REFRESH_SECRET=your-refresh-secret-key
```

### 4. Установка зависимостей

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 5. Инициализация базы данных

```bash
cd server

# Выполнить миграции
npm run db:migrate

# Заполнить тестовыми данными
npm run db:seed
```

### 6. Запуск приложения

**В двух терминалах:**

```bash
# Терминал 1 — Backend (порт 5000)
cd server
npm run dev

# Терминал 2 — Frontend (порт 3000)
cd client
npm run dev
```

Откройте http://localhost:3000 в браузере.

---

## Тестовые пользователи

| Email | Пароль | Роль |
|-------|--------|------|
| admin@school.ru | password123 | Администратор |
| cook@school.ru | password123 | Повар |
| student1@school.ru | password123 | Ученик 9А |
| student2@school.ru | password123 | Ученик 10Б |
| student3@school.ru | password123 | Ученик 11В |

---

## Структура проекта

```
newSchool/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── app/            # Providers, роутер
│   │   ├── pages/          # Страницы по ролям
│   │   ├── features/       # Бизнес-функции (auth)
│   │   ├── widgets/        # Layouts
│   │   └── shared/         # API, UI, хуки
│   └── package.json
│
├── server/                 # Backend (Express)
│   ├── src/
│   │   ├── interface/http/ # Controllers, Routes
│   │   ├── shared/         # Services, Errors
│   │   └── infrastructure/ # Database, Models
│   └── package.json
│
├── docker-compose.yml      # PostgreSQL
├── DOCUMENTATION.md        # Полная документация
├── PROGRESS.md             # Прогресс разработки
└── README.md               # Этот файл
```

---

## API эндпоинты

| Группа | Эндпоинты | Описание |
|--------|-----------|----------|
| Auth | 5 | Регистрация, авторизация, токены |
| Menu | 2 | Меню на неделю/дату |
| Student | 11 | Платежи, заказы, аллергии, отзывы |
| Cook | 7 | Выдачи, склад, заявки |
| Admin | 14+ | Статистика, отчёты, меню, пользователи |
| Notifications | 6 | Уведомления |
| Templates | 23 | Шаблоны меню |

---

## Команды

### Backend (server/)

```bash
npm run dev        # Запуск в режиме разработки
npm start          # Запуск в production
npm run db:migrate # Выполнить миграции
npm run db:seed    # Заполнить тестовыми данными
npm run db:reset   # Сброс БД + миграции + seed
```

### Frontend (client/)

```bash
npm run dev      # Запуск в режиме разработки
npm run build    # Сборка для production
npm run preview  # Предпросмотр сборки
npm run lint     # Проверка ESLint
```

---

## Документация

Полная документация проекта находится в файле [DOCUMENTATION.docx](./DOCUMENTATION.docx):

- Обоснование выбора технологий
- Структурная и функциональная схемы
- Блок-схемы алгоритмов
- Описание СУБД
- Схема базы данных

---


