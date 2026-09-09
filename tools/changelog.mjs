// The changelog, checked and scaffolded.
//
// This page is not decoration. privacy.html promises that a change to what is
// held "is announced on this site and in the changelog before it takes
// effect", so an entry that never gets written is a promise that was made and
// not kept. It has already happened once: the last seen time started being
// recorded, the policy text was updated, and neither the date at the top of it
// nor this page moved, because nothing anywhere asked.
//
// So the writing stays human -- an entry here is prose in two languages and no
// generator is going to produce "Presence comes back, and the update loop lets
// go" out of a commit range. What is mechanised is everything around it: the
// skeleton, the key numbering, and the refusal to ship a version this page has
// never heard of.
//
//   node tools/changelog.mjs check                 every entry is complete in both languages
//   node tools/changelog.mjs check --version 0.2.8 ...and 0.2.8 in particular has one
//   node tools/changelog.mjs new 0.2.8 --date "10 September 2026"
//
// `check --version` is what CalliforniaApp's release workflow runs against a
// checkout of this repo, so a tag with no entry fails the release rather than
// being noticed a week later.
//
// Exits non-zero and names what is wrong.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = path.join(root, "changelog.html");
const i18nPath = path.join(root, "assets", "i18n.js");

// What `new` leaves behind for a person to replace. `check` refuses to pass
// while any of it survives, which is what stops a skeleton from shipping.
const TODO = "TODO";

const MONTHS_RU = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
];
const MONTHS_EN = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

/// v0.2.7 is cl.027, v0.1.1 is cl.011, v0.0.15 is cl.0015: the parts joined,
/// which is the convention every entry on the page already follows.
function keyFor(version) {
    return version.split(".").join("");
}

function ruDate(englishDate) {
    const match = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(englishDate.trim());
    if (!match) {
        return null;
    }
    const month = MONTHS_EN.indexOf(match[2]);
    return month < 0 ? null : `${match[1]} ${MONTHS_RU[month]} ${match[3]}`;
}

function read() {
    return {
        html: fs.readFileSync(htmlPath, "utf8"),
        i18n: fs.readFileSync(i18nPath, "utf8"),
    };
}

/// Every entry the page draws, in the order it draws them.
function parseArticles(html) {
    const articles = [];
    for (const block of html.match(/<article class="release">[\s\S]*?<\/article>/g) ?? []) {
        const version = /<p class="release-version">v([0-9]+(?:\.[0-9]+)*)<\/p>/.exec(block);
        const keys = new Map();
        for (const [, key, text] of block.matchAll(/data-i18n="(cl\.[0-9]+\.[a-z0-9]+)">([^<]*)</g)) {
            keys.set(key, text.trim());
        }
        articles.push({ version: version ? version[1] : null, keys, block });
    }
    return articles;
}

/// The Russian side. Values may sit on the same line as the key or the next
/// one, which is how the file is already written.
function parseRussian(i18n) {
    const found = new Map();
    for (const [, key, value] of i18n.matchAll(/"(cl\.[0-9]+\.[a-z0-9]+)":\s*"((?:[^"\\]|\\.)*)"/g)) {
        found.set(key, value.trim());
    }
    return found;
}

function compareVersions(a, b) {
    const left = a.split(".").map(Number);
    const right = b.split(".").map(Number);
    for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
        const diff = (left[i] ?? 0) - (right[i] ?? 0);
        if (diff !== 0) {
            return diff;
        }
    }
    return 0;
}

function check(requiredVersion) {
    const { html, i18n } = read();
    const articles = parseArticles(html);
    const russian = parseRussian(i18n);
    const problems = [];

    if (articles.length === 0) {
        problems.push("changelog.html has no <article class=\"release\"> at all");
    }

    const seenKeys = new Set();
    for (const article of articles) {
        const where = article.version ? `v${article.version}` : "an entry with no version";
        if (!article.version) {
            problems.push("an entry has no <p class=\"release-version\">");
            continue;
        }
        const prefix = `cl.${keyFor(article.version)}.`;
        if (article.keys.size === 0) {
            problems.push(`${where}: no data-i18n keys, so nothing of it is translatable`);
        }
        for (const [key, english] of article.keys) {
            seenKeys.add(key);
            if (!key.startsWith(prefix)) {
                problems.push(`${where}: key ${key} does not match the version, expected ${prefix}*`);
            }
            if (english.length === 0) {
                problems.push(`${where}: ${key} has no English text`);
            } else if (english.includes(TODO)) {
                problems.push(`${where}: ${key} is still the skeleton`);
            }
            const ru = russian.get(key);
            if (ru === undefined) {
                problems.push(`${where}: ${key} has no Russian in assets/i18n.js`);
            } else if (ru.length === 0) {
                problems.push(`${where}: ${key} has an empty Russian string`);
            } else if (ru.includes(TODO)) {
                problems.push(`${where}: ${key} is still the skeleton in Russian`);
            }
        }
        if (!article.keys.has(`${prefix}title`) || !article.keys.has(`${prefix}date`)) {
            problems.push(`${where}: an entry needs both a title and a date`);
        }
    }

    // A Russian string nobody draws is a string nobody maintains.
    for (const key of russian.keys()) {
        if (!seenKeys.has(key)) {
            problems.push(`${key} is translated but appears nowhere in changelog.html`);
        }
    }

    // Newest first, which is what the page's own subtitle promises.
    const versions = articles.map((a) => a.version).filter(Boolean);
    for (let i = 1; i < versions.length; i += 1) {
        if (compareVersions(versions[i - 1], versions[i]) <= 0) {
            problems.push(`v${versions[i - 1]} is listed above v${versions[i]}, newest goes first`);
        }
    }

    if (requiredVersion) {
        const article = articles.find((a) => a.version === requiredVersion);
        if (!article) {
            problems.push(
                `no entry for v${requiredVersion}. Write one before releasing it: ` +
                `node tools/changelog.mjs new ${requiredVersion} --date "<d Month yyyy>"`,
            );
        }
    }

    if (problems.length > 0) {
        for (const problem of problems) {
            console.error(`changelog: ${problem}`);
        }
        console.error(`changelog: ${problems.length} problem(s).`);
        process.exit(1);
    }
    const scope = requiredVersion ? `, v${requiredVersion} among them` : "";
    console.log(`changelog: clean (${articles.length} entries${scope})`);
}

function create(version, englishDate) {
    if (!/^[0-9]+(\.[0-9]+)+$/.test(version)) {
        console.error(`changelog: "${version}" is not a version`);
        process.exit(1);
    }
    const dateRu = ruDate(englishDate);
    if (!dateRu) {
        console.error(`changelog: --date must look like "10 September 2026", got "${englishDate}"`);
        process.exit(1);
    }

    const { html, i18n } = read();
    const key = keyFor(version);
    if (html.includes(`>v${version}<`)) {
        console.error(`changelog: v${version} already has an entry`);
        process.exit(1);
    }

    const article =
        `      <article class="release">\n` +
        `        <div class="release-meta">\n` +
        `          <p class="release-version">v${version}</p>\n` +
        `          <p class="release-date" data-i18n="cl.${key}.date">${englishDate}</p>\n` +
        `        </div>\n` +
        `        <div class="release-body">\n` +
        `          <h3 data-i18n="cl.${key}.title">${TODO} what this release is about, in one line</h3>\n` +
        `          <ul>\n` +
        `            <li data-i18n="cl.${key}.li1">${TODO} what a person notices, not what was refactored</li>\n` +
        `          </ul>\n` +
        `        </div>\n` +
        `      </article>\n\n`;

    const firstArticle = html.indexOf("      <article class=\"release\">");
    if (firstArticle < 0) {
        console.error("changelog: changelog.html has no entry to insert above");
        process.exit(1);
    }
    const newHtml = html.slice(0, firstArticle) + article + html.slice(firstArticle);

    const strings =
        `    "cl.${key}.date": "${dateRu}",\n` +
        `    "cl.${key}.title": "${TODO} о чём этот выпуск, одной строкой",\n` +
        `    "cl.${key}.li1": "${TODO} что замечает человек, а не что переписали",\n`;
    const firstKey = i18n.search(/^ {4}"cl\.[0-9]+\./m);
    if (firstKey < 0) {
        console.error("changelog: assets/i18n.js has no cl.* block to insert above");
        process.exit(1);
    }
    const newI18n = i18n.slice(0, firstKey) + strings + i18n.slice(firstKey);

    fs.writeFileSync(htmlPath, newHtml, "utf8");
    fs.writeFileSync(i18nPath, newI18n, "utf8");
    console.log(
        `changelog: scaffolded v${version}. Write the English in changelog.html and the\n` +
        `Russian in assets/i18n.js, then: node tools/changelog.mjs check`,
    );
}

const [command, ...rest] = process.argv.slice(2);
const flag = (name) => {
    const at = rest.indexOf(`--${name}`);
    return at >= 0 ? rest[at + 1] : "";
};

if (command === "check") {
    check(flag("version"));
} else if (command === "new") {
    const version = rest[0] && !rest[0].startsWith("--") ? rest[0] : "";
    if (!version || !flag("date")) {
        console.error('changelog: node tools/changelog.mjs new <version> --date "10 September 2026"');
        process.exit(1);
    }
    create(version, flag("date"));
} else {
    console.error("changelog: expected `check` or `new`. See the top of this file.");
    process.exit(1);
}
