import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../assets/main.js", import.meta.url), "utf8");
const windowsUrl = "https://callifornia-download.storage.yandexcloud.net/stable/CalliforniaSetup.exe";
const releasesUrl = "https://github.com/frontmany/CalliforniaDesktop/releases/latest";

function element(attributes = {}) {
  return {
    attributes: { ...attributes },
    events: {},
    classList: { toggle() {} },
    getAttribute(name) { return this.attributes[name] ?? null; },
    setAttribute(name, value) { this.attributes[name] = value; },
    querySelector() { return null; },
    addEventListener(name, handler) { this.events[name] = handler; },
  };
}

for (const platform of ["Windows", "Linux"]) {
  for (const offline of [true, false]) {
    const button = element({ href: windowsUrl });
    const rows = [
      element({ "data-target": "windows", href: windowsUrl }),
      element({ "data-target": "deb", href: releasesUrl }),
      element({ "data-target": "rpm", href: releasesUrl }),
    ];
    const storage = new Map([["callifornia-accepted", "2026-09-30"]]);
    const documentEvents = {};
    const page = {
      "download-btn": button,
      "download-label": element(),
      "download-meta": element(),
    };
    let metadataRequested = false;
    const timers = [];
    const context = {
      window: { setTimeout(fn) { timers.push(fn); }, location: {} },
      navigator: { userAgent: platform },
      document: {
        getElementById(id) { return page[id] ?? null; },
        querySelector() { return null; },
        querySelectorAll(selector) {
          if (selector === ".menu-row[data-target]") return rows;
          if (selector === "#download-btn, .menu-row[data-target]") return [button, ...rows];
          return [];
        },
        addEventListener(name, fn) { documentEvents[name] = fn; },
      },
      localStorage: {
        getItem(key) { return storage.get(key) ?? null; },
        setItem(key, value) { storage.set(key, value); },
        removeItem(key) { storage.delete(key); },
      },
      fetch() {
        metadataRequested = true;
        return offline ? Promise.reject(new Error("offline")) : Promise.resolve({
          ok: true,
          json: async () => ({ version: "1.0.0", size: 1234, platforms: {
            "linux-x64": { version: "1.0.0", deb: "https://example.com/app.deb", rpm: "https://example.com/app.rpm" },
          } }),
        });
      },
    };
    vm.runInNewContext(source, context);
    await new Promise(resolve => setImmediate(resolve));
    assert.ok(metadataRequested, "initialization must reach the metadata request");
    assert.ok(!storage.has("callifornia-accepted"));
    assert.equal(button.getAttribute("href"), platform === "Windows" ? windowsUrl
      : offline ? releasesUrl : "https://example.com/app.deb");
    for (const row of rows) assert.ok(row.getAttribute("href"));
    rows[2].events.click();
    assert.equal(button.getAttribute("href"), offline ? releasesUrl : "https://example.com/app.rpm");
    documentEvents.click({ target: { closest: () => rows[0] },
      preventDefault() { assert.fail("downloads must not require browser consent"); } });
    assert.equal(timers.length, 1);
    timers[0]();
    assert.equal(context.window.location.href, "thanks.html");
  }
}
console.log("download: 4 platform/network scenarios passed");
