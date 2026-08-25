# Я и МАМА — сайт-визитка развивающих студий

Сайт педагога Монтессори (0–3 года) и логоритмики **Ирины Сергеевны Кичигиной**.

## Быстрый старт

```bash
npm install
npm run dev      # локальный просмотр src/ на http://localhost:3000
npm run build    # сборка в dist/ с минификацией и оптимизацией изображений
```

## Структура проекта

```
ya-i-mama/
├── src/
│   ├── index.html           # Главная (11 экранов)
│   ├── montessori.html      # Студия Монтессори
│   ├── logorhythmics.html   # Студия Логоритмика
│   ├── css/
│   │   ├── critical.css     # Критические стили (инлайн в HTML)
│   │   └── main.css         # Основные стили
│   ├── js/
│   │   └── app.js           # Интерактив: туман, курсор, карусель, FAQ
│   └── assets/images/       # WebP-изображения (AI-generated)
├── scripts/build.mjs        # Сборка: WebP + JPEG, минификация
├── dist/                    # Результат сборки (деплой)
├── .github/workflows/       # GitHub Actions → GitHub Pages
├── CNAME                    # ya-i-mama.ru
└── README.md
```

## Деплой на GitHub Pages

1. Создайте репозиторий на GitHub и запушьте проект:
   ```bash
   git add .
   git commit -m "Initial commit: сайт Я и МАМА"
   git remote add origin https://github.com/YOUR_USERNAME/ya-i-mama.git
   git push -u origin main
   ```

2. В настройках репозитория: **Settings → Pages → Source: GitHub Actions**

3. При каждом push в `main` workflow автоматически собирает и публикует `dist/`

4. **HTTPS** включается автоматически на GitHub Pages

### Свой домен

Файл `CNAME` содержит `ya-i-mama.ru`. Настройте DNS:
- `A` записи на IP GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- или `CNAME` на `YOUR_USERNAME.github.io`

## Что настроить перед публикацией

| Элемент | Где изменить |
|---------|--------------|
| Телефон, адрес, MAX | `src/index.html` → секция `#contact` |
| Карта Яндекс | iframe `data-src` в `#contact` |
| Виджеты отзывов 2ГИС / Яндекс | `src/index.html` → `#reviews`, замените ID организации |
| Соцсети | footer в HTML-файлах |
| Цены программ | `#programs` в `index.html` |

## Производительность

- **WebP + JPEG fallback** через `<picture>` (генерируется при сборке)
- **Lazy loading** — `loading="lazy"` + Intersection Observer для iframe
- **Critical CSS** инлайн в `<head>`
- **Шрифты** — preload + `font-display: swap`
- **Минификация** HTML/CSS/JS при сборке
- **Brotli/gzip** — на стороне GitHub Pages CDN

Цель: загрузка < 3 сек на 4G при оптимизированных изображениях.

## Доступность

- Контраст текста ≥ 4.5:1
- Навигация с клавиатуры (Tab, Escape для модалок)
- ARIA-метки для форм, карусели, FAQ
- Alt-тексты для всех изображений
- `prefers-reduced-motion` — отключение анимаций

## Лицензия

© 2026 Ирина Сергеевна Кичигина. Все права защищены.

Разработка сайта: Дмитрий.
