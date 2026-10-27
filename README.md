# CalliforniaWebsite

Сайт Callifornia, [callifornia.online](https://callifornia.online): главная, страница
загрузки, страница входа по ссылке на звонок, история версий, политика
конфиденциальности и соглашение. Чистые HTML, CSS и JS без сборки и фреймворков.
Клиент, который отсюда скачивают: [CalliforniaDesktop](https://github.com/frontmany/CalliforniaDesktop).

```
index.html, download.html, changelog.html, privacy.html, terms.html, thanks.html
join/index.html     куда приходит ссылка на звонок
assets/             стили, шрифты, картинки, main.js (загрузка), i18n.js (русский текст)
tools/              changelog.mjs (история версий), check-css.js
CNAME               домен для GitHub Pages, должен оставаться в git
```

## Запуск локально

Сборки нет: открыть `index.html` в браузере или раздать каталог, например `npx serve .`.
Перед отправкой:

```bash
node tools/check-css.js
node tools/changelog.mjs check
```

## Выкатка

Каждый push в `main` публикует страницы (`CNAME`, `*.html`, `assets/`, `join/`) на GitHub
Pages (`.github/workflows/deploy.yml`) после этих двух проверок. Поэтому в `main` попадает
только то, что готово показать людям.

## Документация

| Документ | О чём |
|---|---|
| [docs/design.md](docs/design.md) | язык оформления приложения на сайте, глифы, шрифты, персонаж и знак |
| [docs/pages.md](docs/pages.md) | загрузка (latest.json, платформы, согласие), страница входа по ссылке, политика и соглашение |
| [docs/operations.md](docs/operations.md) | история версий и её ворота для релиза клиента, выкатка, домен и DNS |
