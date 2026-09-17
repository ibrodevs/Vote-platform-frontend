# Пошаговая инструкция по деплою Frontend (Next.js) на Vercel

Фронтенд полностью настроен и готов к деплою на **Vercel** с автоматическим подключением к бэкенду на PythonAnywhere:
👉 **API Backend:** `https://voteplatformbackend.pythonanywhere.com/api/v1`

---

## Вариант 1. Деплой через панель Vercel (Рекомендуемый)

### Шаг 1. Вход на Vercel
1. Перейдите на сайт [Vercel](https://vercel.com/) и войдите через ваш аккаунт GitHub.
2. На главной странице Dashboard нажмите кнопку **«Add New…»** → **«Project»**.

### Шаг 2. Выбор репозитория
1. В списке ваших репозиториев найдите ваш проект (например, `Vote-platform` или `Vote-platform-frontend`) и нажмите **Import**.

### Шаг 3. Настройка проекта перед деплоем
На экране **Configure Project**:

1. **Project Name:** можно оставить по умолчанию или указать, например, `vote-platform`.
2. **Framework Preset:** автоматически определится как **Next.js**.
3. **Root Directory (ВАЖНО!):**
   - Если в вашем репозитории лежат обе папки (`frontend/` и `backend/`), нажмите **Edit** напротив `Root Directory` и выберите папку **`frontend`**.
   - Если вы загрузили в отдельный репозиторий только содержимое папки frontend, оставьте `./` (корень).
4. **Environment Variables (Переменные окружения):**
   Разверните блок **Environment Variables** и добавьте переменную:
   - **Key (Имя):** `NEXT_PUBLIC_API_URL`
   - **Value (Значение):** `https://voteplatformbackend.pythonanywhere.com/api/v1`
   - Нажмите кнопку **Add**.

*(Примечание: даже если вы пропустите добавление переменной, в коде уже прописан надежный fallback на `https://voteplatformbackend.pythonanywhere.com/api/v1`)*.

### Шаг 4. Деплой
1. Нажмите кнопку **«Deploy»**.
2. Vercel соберет проект за 1–2 минуты.
3. По завершении вы увидите праздничный экран поздравления с ссылкой на ваш сайт (вида `https://vote-platform-xxx.vercel.app`).

---

## Вариант 2. Деплой через Vercel CLI (через терминал)

Если у вас установлен Node.js и Vercel CLI:

```bash
# Перейдите в папку frontend
cd frontend

# Установите Vercel CLI (если еще не установлен)
npm install -g vercel

# Запустите деплой
vercel
# Ответьте на вопросы мастера настройки по умолчанию

# Деплой в продакшн
vercel --prod
```

---

## Что уже настроено в проекте:
- `.env.production` и `.env.local` содержат рабочий адрес бэкенда на PythonAnywhere.
- `lib/api.ts` автоматически нормализует пути запросов и адреса фотографий кандидатов (`getMediaUrl`).
- `next.config.ts` настроен с `remotePatterns` для безопасной загрузки картинок с `voteplatformbackend.pythonanywhere.com`.
- Все 13 страниц успешно компилируются в статические и динамические роуты без ошибок линтера и TypeScript.
