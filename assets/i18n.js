// English and Russian for every page, plus the header switch.
//
// English lives in the HTML, so a visitor with no JavaScript, and every
// crawler, still gets a complete page. Russian lives here and is painted over
// the markup at load. Switching back to English restores what the HTML said,
// which means English can never drift out of sync with a copy of itself.
//
// Marking up a page:
//
//   data-i18n="key"             replaces the element's text
//   data-i18n-html="key"        replaces its markup, for text holding a link
//   data-i18n-title="key"       and the same for title, aria-label, content,
//                               alt and placeholder
//
// Keys with no entry here simply stay English, so a page can be marked up
// ahead of its translation.

(function () {
  "use strict";

  var STORAGE_KEY = "calls-lang";
  var SUPPORTED = ["en", "ru"];

  var RU = {
    // --- Chrome shared by every page ---
    "nav.features": "Возможности",
    "nav.how": "Как это работает",
    "nav.faq": "Вопросы",
    "nav.changelog": "История версий",
    "aria.site": "Сайт",
    "aria.footer": "Низ страницы",
    "aria.theme": "Сменить тему",
    "aria.lang": "Сменить язык",
    "footer.changelog": "История версий",
    "footer.privacy": "Конфиденциальность",
    "footer.contact": "Написать нам",

    // --- Home ---
    "page.index.title": "Calls, простые видеозвонки для Windows и Linux",
    "page.index.desc":
      "Простое и быстрое настольное приложение для видеозвонков. Бесплатное и лёгкое, для Windows и Linux.",
    "hero.title": "Видеозвонки без лишних хлопот.",
    "hero.sub":
      "Простое и быстрое настольное приложение для видеозвонков. Бесплатное и лёгкое, для Windows и Linux.",

    "aria.platforms": "Доступные платформы",
    "os.beta": "Бета",
    "os.soon": "Скоро",
    "mobile.badge": "Скоро на телефонах",
    "mobile.text":
      "Calls пока работает на компьютерах с Windows и Linux. Откройте эту страницу на компьютере, чтобы скачать.",

    // Download button and the line under it, both redrawn from main.js.
    "download.windows": "Скачать для Windows",
    "download.linux": "Скачать для Linux (.{pkg})",
    "meta.ready": "Свежая версия готова к загрузке",
    "meta.loading": "Загружаем…",
    "meta.windows": "v{version}, {size} МБ, Windows 10/11 (64 бита)",
    "meta.deb": "v{version}, {size} МБ, Debian/Ubuntu (.deb)",
    "meta.rpm": "v{version}, Fedora/RHEL (.rpm)",

    // The drawing of the app in a call.
    "mock.settings": "Настройки",
    "mock.invite": "Пригласить",
    "mock.mute": "Выключить микрофон",
    "mock.camera": "Выключить камеру",
    "mock.share": "Показать экран",
    "mock.muted": "без звука",
    "mock.you": "Вы",
    "mock.leave": "Выйти",

    "features.eyebrow": "Возможности",
    "features.title": "Всё, что нужно звонку. И ничего сверх.",
    "features.sub":
      "Calls написан как настольное приложение вокруг одной мысли. Разговор должен начинаться за секунды, а не после настройки.",

    "f1.title": "Вход по короткому коду звонка",
    "f1.text":
      "У каждого звонка есть короткий код. Отправьте его в любом чате, и человек с приложением окажется в звонке через пару секунд. Ссылки не протухают, и никого не держат в ожидании, пока хозяин пустит.",
    "mock.join.title": "Войти в звонок",
    "mock.join.sub": "Введите код звонка, который вам дали",
    "mock.join.back": "Назад",
    "mock.join.label": "Код звонка",
    "mock.join.btn": "Войти",

    "f2.title": "Обновления, которые не мешают",
    "f2.text":
      "На Windows новые версии приходят в фоне и встают за один перезапуск, переустанавливать ничего не надо. На Linux приложение говорит, что версия готова, а дальше её ставит ваш пакетный менеджер. И там и там каждое обновление подписано.",
    "mock.update.title": "Загружаем обновление",
    "mock.update.note": "Только изменившиеся файлы",

    "f3.title": "Друзья в один клик",
    "f3.text":
      "Добавьте человека один раз и звоните когда угодно, не разыскивая нужную ссылку по чатам. Приглашения приходят прямо в приложение, а звонок другу начинается одним кликом.",
    "mock.friend.invite": "Позвать",
    "mock.friend.incall": "В звонке",
    "mock.friend.cancel": "Отменить",

    "how.eyebrow": "Как это работает",
    "how.title": "В звонке за три шага",
    "how.sub": "Без прав администратора, без лабиринта регистрации, без расширений браузера.",
    "how.1.title": "Скачайте и запустите",
    "how.1.text":
      "Возьмите установщик и запустите. Он ставится для одного пользователя, права администратора не нужны, и всё занимает секунды.",
    "how.2.title": "Войдите",
    "how.2.text":
      "Заведите аккаунт с именем и паролем. Это вся форма, никакой профиль заполнять не придётся.",
    "how.3.title": "Начните говорить",
    "how.3.text":
      "Начните звонок и отправьте его короткий код или позвоните другу напрямую. Показ экрана в одном клике.",

    "faq.eyebrow": "Вопросы",
    "faq.title": "Отвечаем",
    "faq.free.q": "Calls правда бесплатный?",
    "faq.free.a":
      "Да. Ни подписки, ни таймера пробного периода, ни возможностей за деньгами. Скачиваете, входите и звоните.",
    "faq.platforms.q": "Какие платформы поддерживаются?",
    "faq.platforms.a":
      "Windows 10 и 11 (64 бита) и Linux (.deb для Debian и Ubuntu, .rpm для Fedora и RHEL). Поддержка Linux совсем свежая, поэтому пока помечена как бета. macOS в планах, ядро приложения уже кроссплатформенное, так что дело в упаковке, а не в переписывании.",
    "faq.smartscreen.q": "Windows предупредил о неизвестном приложении. Почему?",
    "faq.smartscreen.a1":
      "Так осторожничает Microsoft SmartScreen с новыми издателями. Установщик пока не подписан платным сертификатом, поэтому Windows показывает общее предупреждение. Нажмите «Подробнее», затем «Выполнить в любом случае».",
    "faq.smartscreen.a2":
      "Подпись кода у нас в планах, и как только она появится, предупреждение исчезнет.",
    "faq.account.q": "Нужен ли аккаунт?",
    "faq.account.a":
      "Да, но самый простой. Аккаунт нужен, чтобы друзья находили вас по имени и звонили напрямую, а не пересылали код звонка каждый раз.",
    "faq.updates.q": "Как работают обновления?",
    "faq.updates.a":
      'На Windows приложение проверяет новые версии в фоне, скачивает только изменившиеся файлы и сверяет подпись каждого обновления перед установкой. Один перезапуск, и готово. На Linux обновления идут через подписанный репозиторий APT или YUM. Приложение говорит, что версия готова, а ставит её пакетный менеджер (одним кликом из приложения, если оно может спросить пароль, иначе обычным <code>apt upgrade</code> или <code>dnf upgrade</code>). Что изменилось, видно в <a href="changelog.html" style="color:var(--accent); text-decoration:none">истории версий</a>.',
    "faq.data.q": "Какие данные собирает Calls?",
    "faq.data.a":
      'Так мало, как получается. Данные аккаунта и то, без чего звонок не соединить. Звонки никогда не записываются, а отчёты о сбоях строго добровольные и выключены по умолчанию. Всё подробно в <a href="privacy.html" style="color:var(--accent); text-decoration:none">политике конфиденциальности</a>.',

    "cta.title": "Мы готовы, когда готовы вы.",
    "cta.sub": "Скачайте Calls и окажитесь в первом звонке меньше чем за минуту.",

    // --- Changelog ---
    "page.changelog.title": "История версий, Calls",
    "page.changelog.desc": "Что нового в Calls, заметки к каждому выпуску.",
    "changelog.title": "История версий",
    "changelog.sub":
      "Выпуски, о которых есть что рассказать, свежие сверху. Приложение ставит обновления само, а страница нужна, чтобы видеть, что и когда изменилось.",
    "cl.010.date": "9 августа 2026",
    "cl.010.title": "Чат, статусы и пространство с каждым другом",
    "cl.010.li1":
      "Чат внутри звонка, который хранится вместе со звонком и остаётся на месте, когда вы вернётесь",
    "cl.010.li2":
      "Живые статусы друзей, в том числе «ждёт вас», когда человек сидит в общем с вами пространстве",
    "cl.010.li3":
      "Личное пространство с каждым другом, которое открывается из его строки или с закреплённой плашки на главном экране",
    "cl.010.li4":
      "Заявки в друзья и изменения профиля приходят сами, обновлять ничего не надо",
    "cl.010.li5": "Настройки стали отдельным экраном",
    "cl.010.note":
      "Способ входа в звонок изменился, поэтому версии до 0.1.0 обновляются сами.",
    "cl.0015.date": "7 августа 2026",
    "cl.0015.title": "Честная камера",
    "cl.0015.li1":
      "Камера включается успешно, только когда она действительно открылась, поэтому отсутствующая или занятая камера теперь говорит об этом, а не зажигает кнопку впустую",
    "cl.0015.li2":
      "Кнопка камеры гаснет, когда камеры нет, и горячая клавиша подчиняется тому же правилу",
    "cl.0014.date": "7 августа 2026",
    "cl.0014.title": "Показ экрана на Wayland",
    "cl.0014.li1":
      "Показ на Wayland идёт через окно выбора вашего рабочего стола и PipeWire, а не притворяется работающим, пока остальные видят чёрный прямоугольник. На это ушло четыре попытки, с 0.0.9 по 0.0.13, и держится он начиная с этой версии.",
    "cl.0014.li2":
      "Окно выбора появляется каждый раз, когда вы начинаете показ, так что можно выбрать не то же окно, что в прошлый раз",
    "cl.0014.li3":
      "Сеанс, который вообще нельзя захватить, отказывает с сообщением, ещё до того как хоть один кадр уйдёт в звонок",
    "cl.0014.li4":
      "На Linux кнопка обновления больше не появляется за минуты до того, как пакет доедет до репозитория",
    "cl.008.date": "5 августа 2026",
    "cl.008.title": "Обновления пакетов рассказывают о себе",
    "cl.008.li1":
      "Обновление из приложения на Linux показывает ход, ошибку и просьбу перезапустить, а не выглядит так, будто десятки секунд ничего не происходит",
    "cl.008.li2":
      "Перезапуск ждёт, пока старый процесс завершится, поэтому зависшее закрытие больше не оставляет вас без окна",
    "cl.008.li3": "В хранилищах загрузок остаются только две свежие версии",
    "cl.007.date": "5 августа 2026",
    "cl.007.title": "Окно, иконка и тема на Linux",
    "cl.007.li1":
      "У окна на GNOME снова есть заголовок. В пакетах не хватало модуля оформления для Wayland, поэтому окно приходило голым и не двигалось.",
    "cl.007.li2": "Показывается иконка приложения, а не безликая шестерёнка",
    "cl.007.li3":
      "Тёмный рабочий стол больше не запускает Calls в светлой теме при первой установке",
    "cl.007.li4": "Подсказки ждут дольше, прежде чем появиться",
    "cl.005.date": "5 августа 2026",
    "cl.005.title": "Calls на Linux",
    "cl.005.li1": "Пакеты .deb и .rpm с подписанным репозиторием APT и YUM для обновлений",
    "cl.005.li2": "Микрофон через PulseAudio, камера через V4L2, показ экрана на X11",
    "cl.005.li3": "Обновления в один клик через ваш пакетный менеджер",
    "cl.005.li4": "Переделанный главный экран и переходы по разделам",
    "cl.005.li5": "Показ экрана на Wayland появился позже, в 0.0.9",
    "cl.002.date": "2 августа 2026",
    "cl.002.title": "Чистое удаление",
    "cl.002.li1":
      "Удаление уносит папку установки, ваши данные и оставшуюся запись автозапуска от обновлятора. Только для новых установок.",
    "cl.001.date": "2 августа 2026",
    "cl.001.tag": "Первый выпуск",
    "cl.001.title": "Здравствуй, мир",
    "cl.001.li1": "Групповые видеозвонки с короткими кодами, которые легко переслать",
    "cl.001.li2": "Список друзей, добавьте человека один раз и звоните одним кликом",
    "cl.001.li3": "Приглашения в приложении, видно кто позвал, и войти можно сразу",
    "cl.001.li4": "Показ экрана с выбором окна или всего экрана",
    "cl.001.li5": "Светлая и тёмная темы",
    "cl.001.li6": "Обновления в фоне, подписанные, только изменения, один перезапуск",
    "cl.001.li7":
      "Установщик для одного пользователя на Windows 10/11, права администратора не нужны",

    // --- Privacy ---
    "page.privacy.title": "Конфиденциальность, Calls",
    "page.privacy.desc": "Какие данные собирает Calls, каких не собирает и почему.",
    "privacy.title": "Конфиденциальность",
    "privacy.sub":
      "Обновлено 29 июля 2026 года. Если коротко, Calls собирает то, без чего не соединить ваши звонки, и почти ничего больше.",
    "privacy.collect.h": "Что мы собираем",
    "privacy.collect.1":
      "<strong>Данные аккаунта</strong>, то есть имя и пароль, с которыми вы зарегистрировались. Именно они позволяют друзьям найти вас и позвонить.",
    "privacy.collect.2":
      "<strong>Данные соединения</strong>, то есть техническая сигнализация, без которой не установить звонок между участниками (кто в какой звонок входит и что нужно сети, чтобы вас соединить).",
    "privacy.collect.3":
      "<strong>Сведения о версии</strong>, приложение сообщает свою версию нашим серверам, чтобы получать подходящие обновления.",
    "privacy.never.h": "Чего мы не собираем",
    "privacy.never.1":
      "<strong>Звонки не записываются.</strong> Звук, видео и показ экрана шифруются при передаче и не хранятся на наших серверах.",
    "privacy.never.2":
      "<strong>Ни рекламы, ни слежки.</strong> В приложении нет рекламных SDK, нет аналитики и нет передачи данных третьим лицам. Мы не продаём данные, продавать нечего.",
    "privacy.never.3":
      "<strong>Никакого сбора контактов.</strong> Calls не читает вашу адресную книгу, файлы и вообще ничего на вашей машине, кроме собственных настроек.",
    "privacy.crash.h": "Отчёты о сбоях, только по согласию",
    "privacy.crash.p":
      "Если приложение падает, оно может сохранить технический отчёт (минидамп со стеком вызовов, версию приложения, версию системы и хвост собственного журнала) и отправить его нам, чтобы мы починили ошибку. По умолчанию это <strong>выключено</strong>. Отчёты уходят, только если вы сами включите их, и служат исключительно для отладки.",
    "privacy.updates.h": "Обновления",
    "privacy.updates.p":
      "Приложение изредка спрашивает наш сервер обновлений, есть ли новая версия. В запросе идут версия и платформа, ровно чтобы ответить на этот вопрос, и ничего сверх. Сами обновления подписаны, и приложение сверяет подпись перед установкой.",
    "privacy.retention.h": "Хранение и удаление данных",
    "privacy.retention.p":
      "Данные аккаунта хранятся, пока существует аккаунт. Захотите удалить аккаунт вместе с данными, напишите нам по адресу ниже, и мы всё уберём.",
    "privacy.changes.h": "Изменения этой политики",
    "privacy.changes.p":
      'Если политика изменится заметно, мы отметим это в <a href="changelog.html">истории версий</a> и обновим дату вверху страницы.',
    "privacy.contact.h": "Связаться",
    "privacy.contact.p":
      'Вопросы о приватности и ваших данных пишите на <a href="mailto:fmtab2014@gmail.com">fmtab2014@gmail.com</a>.',

    // --- Join ---
    "page.join.title": "Вход в звонок, Calls",
    "page.join.desc": "Откройте этот звонок в настольном приложении Calls.",
    "join.valid.title": "Войдите в звонок",
    "join.valid.sub": "Нажмите кнопку ниже, чтобы открыть этот звонок в приложении Calls.",
    "join.valid.btn": "Открыть в Calls",
    "join.invalid.title": "Ссылка выглядит сломанной",
    "join.invalid.sub":
      "В ней нет кода звонка. Попросите новую ссылку у того, кто её прислал, или откройте Calls и введите код вручную.",
    "join.invalid.btn": "На главную страницу Calls",
    "join.mobile.title": "Только для компьютера",
    "join.mobile.sub":
      "Calls это настольное приложение, на телефонах и планшетах оно не работает. Откройте ссылку на компьютере, чтобы войти."
  };

  // Only the strings main.js writes at runtime need an English entry; every
  // other English string is the markup itself.
  var EN = {
    "aria.lang": "Switch language",
    "download.windows": "Download for Windows",
    "download.linux": "Download for Linux (.{pkg})",
    "meta.ready": "Latest version ready to download",
    "meta.loading": "Loading…",
    "meta.windows": "v{version}, {size} MB, Windows 10/11 (64 bit)",
    "meta.deb": "v{version}, {size} MB, Debian/Ubuntu (.deb)",
    "meta.rpm": "v{version}, Fedora/RHEL (.rpm)"
  };

  var DICTS = { en: EN, ru: RU };

  // Which language to show, given the browser's languages in order of
  // preference. The same rule the desktop app applies to the operating
  // system's list: compare on the language subtag alone, and let the first
  // language the site actually has win, so somebody who reads Ukrainian first
  // and Russian second gets Russian.
  function detectLanguage(tags) {
    for (var i = 0; i < tags.length; i++) {
      var subtag = String(tags[i]).toLowerCase().split(/[-_.@]/)[0];
      if (SUPPORTED.indexOf(subtag) !== -1) return subtag;
    }
    return "en";
  }

  function savedLanguage() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.indexOf(saved) !== -1 ? saved : null;
    } catch (_e) {
      return null;
    }
  }

  var browserTags = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || "en"];
  var lang = savedLanguage() || detectLanguage(browserTags);

  // The attributes a key can be written into, and how each is read back so the
  // English original can be restored on the way out.
  var TARGETS = [
    { attr: "data-i18n", get: function (el) { return el.textContent; },
      set: function (el, v) { el.textContent = v; } },
    { attr: "data-i18n-html", get: function (el) { return el.innerHTML; },
      set: function (el, v) { el.innerHTML = v; } }
  ];
  ["title", "aria-label", "content", "alt", "placeholder"].forEach(function (name) {
    TARGETS.push({
      attr: "data-i18n-" + name,
      get: function (el) { return el.getAttribute(name); },
      set: function (el, v) { el.setAttribute(name, v); }
    });
  });

  // The English the page shipped with, captured before anything overwrites it.
  var originals = [];
  function captureOriginals() {
    TARGETS.forEach(function (target) {
      var nodes = document.querySelectorAll("[" + target.attr + "]");
      Array.prototype.forEach.call(nodes, function (el) {
        originals.push({ el: el, target: target, key: el.getAttribute(target.attr),
                         value: target.get(el) });
      });
    });
  }

  function format(text, vars) {
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, function (whole, name) {
      return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : whole;
    });
  }

  function translate(key, vars) {
    var dict = DICTS[lang] || {};
    var text = Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : EN[key];
    return text === undefined ? key : format(text, vars);
  }

  function apply() {
    document.documentElement.setAttribute("lang", lang);
    var dict = DICTS[lang] || {};
    originals.forEach(function (item) {
      var translated = Object.prototype.hasOwnProperty.call(dict, item.key)
        ? dict[item.key]
        : item.value;   // no translation yet: the page keeps its English
      item.target.set(item.el, translated);
    });
    // The switch itself always names the language it would take you to, in
    // that language, so it reads the same whichever side you are on.
    var buttons = document.querySelectorAll("[data-lang-toggle]");
    Array.prototype.forEach.call(buttons, function (button) {
      button.textContent = lang === "ru" ? "EN" : "RU";
      button.setAttribute("aria-label", translate("aria.lang"));
    });
  }

  var listeners = [];

  function setLanguage(next) {
    if (SUPPORTED.indexOf(next) === -1 || next === lang) return;
    lang = next;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_e) {}
    apply();
    listeners.forEach(function (fn) { fn(lang); });
  }

  window.CallsI18n = {
    t: translate,
    setLanguage: setLanguage,
    language: function () { return lang; },
    onChange: function (fn) { listeners.push(fn); },
    // Exposed for the tests that pin the detection rule down.
    detectLanguage: detectLanguage
  };

  captureOriginals();
  apply();

  document.addEventListener("click", function (event) {
    var button = event.target.closest && event.target.closest("[data-lang-toggle]");
    if (button) setLanguage(lang === "ru" ? "en" : "ru");
  });
})();
