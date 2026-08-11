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

  // The few strings this file writes at runtime come from the dictionary in
  // i18n.js. Should that file be missing, t() returns nothing and every write
  // below is skipped, leaving the English the markup already carries.
  var i18n = window.CallsI18n;
  function t(key, vars) {
    return i18n ? i18n.t(key, vars) : null;
  }

  // --- Theme (mirrors the app's light/dark ThemeToggle) ---------------------
  // The starting theme is applied by an inline <head> script before first
  // paint (saved choice, else the OS setting); this wires the button and
  // keeps following the OS while the page stays open.
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
      // Clicking is what turns a preference into an explicit choice: from
      // here on this visitor stops following the OS, in either direction.
      try {
        localStorage.setItem("calls-theme", light ? "dark" : "light");
      } catch (_e) {}
    });
  }

  // Someone who flips their OS to light/dark with the page already open sees
  // it follow, exactly as a fresh load would have — unless they have picked a
  // theme here, which always wins.
  if (window.matchMedia) {
    var lightQuery = window.matchMedia("(prefers-color-scheme: light)");
    var onSystemThemeChange = function (event) {
      var saved = null;
      try {
        saved = localStorage.getItem("calls-theme");
      } catch (_e) {}
      if (saved) return;
      if (event.matches) {
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
    };
    if (lightQuery.addEventListener) {
      lightQuery.addEventListener("change", onSystemThemeChange);
    } else if (lightQuery.addListener) {
      lightQuery.addListener(onSystemThemeChange);  // Safari < 14
    }
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

  // --- Download meta + platform picker (home page only) ---------------------
  // CI publishes latest.json next to the installer:
  //   { version, size, sha256, platforms: { "linux-x64": { version, size,
  //     sha256, deb, rpm } } }
  // Top-level fields describe the Windows installer (see release.yml); Linux
  // package URLs live under platforms["linux-x64"]. If the request fails
  // (offline, CORS, storage down): Windows keeps its static href/label from
  // the HTML; Linux falls back to the GitHub Releases page (see
  // GITHUB_RELEASES_URL below), since there is no direct package link to
  // fall back to without this fetch.
  var meta = document.getElementById("download-meta");
  if (!meta) return;

  var WIN_HREF = "https://calls-download.storage.yandexcloud.net/stable/CallsSetup.exe";
  // Fallback while latest.json hasn't loaded (or failed): always has both
  // packages attached, unlike the bucket paths which have no versionless alias.
  var GITHUB_RELEASES_URL = "https://github.com/frontmany/CallsApp/releases/latest";
  // NOTE: must match the bucket (or CDN domain) the release workflow uploads to.
  var META_URL = "https://calls-download.storage.yandexcloud.net/stable/latest.json";

  var downloadBtns = [document.getElementById("download-btn"), document.getElementById("download-btn-2")];
  var downloadLabels = [document.getElementById("download-label"), document.getElementById("download-label-2")];
  var pkgRow = document.getElementById("pkg-row");
  var osButtons = document.querySelectorAll(".os-pill[data-os]");
  var pkgButtons = document.querySelectorAll(".pkg-pill[data-pkg]");

  // Browsers don't expose enough to tell Debian/Ubuntu from Fedora/RHEL, so
  // .deb is just the plurality guess — the pill row next to it is how anyone
  // on an rpm-based distro corrects it, and that choice is remembered below.
  var DEFAULT_PKG = "deb";

  function detectPlatform() {
    var ua = navigator.userAgent || "";
    // Android reports "Linux" in its UA too; it must not steal the Linux
    // pill (mobile visitors get the cta-mobile fallback regardless via CSS,
    // but the state here should still reflect reality).
    if (/Linux/.test(ua) && !/Android/.test(ua)) return "linux";
    if (/Mac OS X|Macintosh/.test(ua)) return "macos";
    return "windows";
  }

  var state = {
    platform: null,
    pkg: null,
  };
  try {
    var savedPlatform = localStorage.getItem("calls-platform");
    if (savedPlatform === "windows" || savedPlatform === "linux") state.platform = savedPlatform;
    var savedPkg = localStorage.getItem("calls-pkg");
    if (savedPkg === "deb" || savedPkg === "rpm") state.pkg = savedPkg;
  } catch (_e) {}
  if (!state.platform) state.platform = detectPlatform() === "linux" ? "linux" : "windows";
  if (!state.pkg) state.pkg = DEFAULT_PKG;

  var latestData = null;
  var fetchFailed = false;

  function render() {
    var isLinux = state.platform === "linux";

    osButtons.forEach(function (btn) {
      btn.classList.toggle("os-pill--active", btn.getAttribute("data-os") === state.platform);
    });
    if (pkgRow) pkgRow.hidden = !isLinux;
    pkgButtons.forEach(function (btn) {
      btn.classList.toggle("pkg-pill--active", btn.getAttribute("data-pkg") === state.pkg);
    });

    var linuxInfo = latestData && latestData.platforms && latestData.platforms["linux-x64"];
    var href = WIN_HREF;
    var label = t("download.windows");
    var metaText = t("meta.ready");

    if (isLinux) {
      label = t("download.linux", { pkg: state.pkg });
      if (linuxInfo) {
        href = state.pkg === "rpm" ? linuxInfo.rpm : linuxInfo.deb;
        var linuxVersion = String(linuxInfo.version || "").replace(/^v/, "");
        if (linuxVersion) {
          // Only the .deb's size/hash are recorded in latest.json today (the
          // merge step measures the file it just built) -- .rpm still gets a
          // real, working link, just without a "NN MB" figure next to it.
          if (state.pkg === "deb" && linuxInfo.size) {
            metaText = t("meta.deb", {
              version: linuxVersion,
              size: (linuxInfo.size / (1024 * 1024)).toFixed(0)
            });
          } else {
            metaText = t("meta.rpm", { version: linuxVersion });
          }
        }
      } else {
        // No versionless "latest" alias exists for the packages the way
        // stable/CallsSetup.exe does for Windows, so while latest.json is
        // still loading (or failed) there is no direct file URL to offer.
        // Point at the Releases page instead of leaving the label promising
        // "Linux" while the href silently downloads the Windows installer.
        href = GITHUB_RELEASES_URL;
        metaText = fetchFailed ? t("meta.ready") : t("meta.loading");
      }
    } else if (latestData) {
      var winVersion = String(latestData.version || "").replace(/^v/, "");
      if (winVersion) {
        metaText = t("meta.windows", {
          version: winVersion,
          size: (latestData.size / (1024 * 1024)).toFixed(0)
        });
      }
    }

    downloadBtns.forEach(function (btn) { if (btn) btn.href = href; });
    downloadLabels.forEach(function (el) { if (el && label) el.textContent = label; });
    if (metaText) meta.textContent = metaText;
  }

  // The button and the line under it are written here, not marked up, so they
  // have to be redrawn when the header switch changes the language.
  if (i18n) i18n.onChange(render);

  function setPlatform(platform) {
    state.platform = platform;
    try { localStorage.setItem("calls-platform", platform); } catch (_e) {}
    render();
  }
  function setPkg(pkg) {
    state.pkg = pkg;
    try { localStorage.setItem("calls-pkg", pkg); } catch (_e) {}
    render();
  }

  osButtons.forEach(function (btn) {
    btn.addEventListener("click", function () { setPlatform(btn.getAttribute("data-os")); });
  });
  pkgButtons.forEach(function (btn) {
    btn.addEventListener("click", function () { setPkg(btn.getAttribute("data-pkg")); });
  });

  render();

  fetch(META_URL, { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("storage returned " + res.status);
      return res.json();
    })
    .then(function (data) {
      latestData = data;
      render();
    })
    .catch(function () {
      fetchFailed = true;
      render();
    });
})();
