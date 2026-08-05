// Shared script for all pages: theme toggle, scroll-reveal, and (on the home
// page) the version/size line under the Download button.
//
// The installer itself is hosted on Yandex Object Storage at a stable,
// versionless path (…/stable/CallsSetup.exe) — the Download button's href
// points straight at it, so downloads work with no JS at all. Everything in
// this file is enhancement.

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  // --- Theme toggle (mirrors the app's light/dark ThemeToggle) --------------
  // The saved theme is applied by an inline <head> script before first paint;
  // this just wires the button.
  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var root = document.documentElement;
      var light = root.getAttribute("data-theme") === "light";
      if (light) {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", "light");
      }
      try {
        localStorage.setItem("calls-theme", light ? "dark" : "light");
      } catch (_e) {}
    });
  }

  // --- Scroll reveal --------------------------------------------------------
  var revealed = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealed.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    revealed.forEach(function (el) { observer.observe(el); });
  } else {
    revealed.forEach(function (el) { el.classList.add("revealed"); });
  }

  // --- Footer year ----------------------------------------------------------
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // --- Download meta (home page only) ---------------------------------------
  // CI publishes latest.json next to the installer: { version, size, sha256 }.
  // If the request fails (offline, CORS, storage down), the button still
  // works and we keep the generic label.
  var meta = document.getElementById("download-meta");
  if (!meta) return;

  // NOTE: must match the bucket (or CDN domain) the release workflow uploads to.
  var META_URL =
    "https://calls-download.storage.yandexcloud.net/stable/latest.json";

  fetch(META_URL, { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("storage returned " + res.status);
      return res.json();
    })
    .then(function (data) {
      var version = String(data.version || "").replace(/^v/, "");
      if (!version) return;
      var size = (data.size / (1024 * 1024)).toFixed(0) + " MB";
      meta.textContent = "v" + version + ", " + size + ", Windows 10/11 (64-bit)";
    })
    .catch(function () {
      meta.textContent = "Latest version ready to download";
    });
})();
