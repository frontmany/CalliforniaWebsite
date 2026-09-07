// Catches the one mistake that has broken this stylesheet twice.
//
// Both times an edit left a comment with a closing */ and no opening /*. CSS
// does not complain: the orphaned prose is parsed as a selector, the parser
// discards everything until it finds its way out, and the rule that happened to
// sit next is silently gone. The first time it took the whole .ss block with it
// and the diagram on the home page stood frozen; the second time it took the
// same block again and the diagram lost its card.
//
// Nothing about it is visible in a diff. So it gets a check.
//
//   node tools/check-css.js
//
// Exits non-zero and names the line when something is wrong.
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "assets", "style.css");
const css = fs.readFileSync(FILE, "utf8");
const lines = css.split(/\r?\n/);

const problems = [];

// 1. Walk the file as the parser does: inside a comment or outside one, and
//    say where it goes wrong rather than only that it did.
let inComment = false, opened = 0, i = 0;
while (i < css.length) {
  if (!inComment && css.startsWith("/*", i)) { inComment = true; opened = i; i += 2; continue; }
  if (inComment && css.startsWith("*/", i)) { inComment = false; i += 2; continue; }
  // A */ with no /* before it. This is the failure being guarded against.
  if (!inComment && css.startsWith("*/", i)) {
    problems.push(`строка ${css.slice(0, i).split("\n").length}: закрывающий */ без открывающего /*`);
    i += 2;
    continue;
  }
  i++;
}
if (inComment) {
  problems.push(`строка ${css.slice(0, opened).split("\n").length}: комментарий /* не закрыт до конца файла`);
}

// 2. Braces, which the same kind of slip also breaks.
let depth = 0;
lines.forEach((line, n) => {
  const bare = line.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const ch of bare) {
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth < 0) { problems.push(`строка ${n + 1}: лишняя }`); depth = 0; }
    }
  }
});
if (depth > 0) problems.push(`не закрыто фигурных скобок: ${depth}`);

// 3. Selectors this site would lose a whole component without. A swallowed
//    block takes its rules with it, and this is the cheapest way to notice.
const REQUIRED = [
  ".ss {", ".ss-more {", ".ss-reveal {", ".ss-btn {",
  ".seal {", ".seal-card {", ".seal-wire {",
  ".wave {", ".wave span {",
  ".net {", ".net-node {", ".net-pulse {",
  ".burger {", ".burger-menu {",
  ".closer {", ".mock {", ".tiles {", ".hero-facts {"
];
for (const sel of REQUIRED) {
  if (!css.includes(sel)) problems.push(`потеряно правило: ${sel}`);
}

if (problems.length) {
  console.log("style.css, найдено проблем: " + problems.length);
  problems.forEach((p) => console.log("  " + p));
  process.exit(1);
}
console.log(`style.css в порядке: комментарии сбалансированы, скобки сходятся, все ${REQUIRED.length} ключевых правил на месте`);
