// Shared script for all pages: scroll-reveal, and (on the download page) the
// platform picker, its version line, and the box that has to be ticked before
// any of it is a live link. The theme is not here: it is
// whatever the operating system asks for, which the stylesheet answers on its
// own (see the top of style.css).
//
// The installer itself is hosted on Yandex Object Storage at a stable,
// versionless path (…/stable/CalliforniaSetup.exe) — the Download button's href
// points straight at it, so downloads work with no JS at all. Everything in
// this file is enhancement.

(function () {
  "use strict";

  // `html.js` is set by the inline head script on every page, early enough
  // that the language control is never absent from a painted frame.

  // The few strings this file writes at runtime come from the dictionary in
  // i18n.js. Should that file be missing, t() returns nothing and every write
  // below is skipped, leaving the English the markup already carries.
  var i18n = window.CalliforniaI18n;
  function t(key, vars) {
    return i18n ? i18n.t(key, vars) : null;
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
  // --- Accepting the terms before a download --------------------------------
  // A record, not a lock. The installer is a public URL on object storage and
  // anybody who wants it around this box can have it, so the honest thing is
  // to say that in the README rather than pretend otherwise here. What the box
  // does buy is the thing a record is for: the person saw the two documents,
  // said so, and the date of the version they said it about is kept.
  //
  // Stored as the version rather than a flag, so raising POLICY_VERSION asks
  // everybody again instead of carrying them silently into a new document.
  var POLICY_VERSION = "2026-08-25";
  var ACCEPT_KEY = "callifornia-accepted";
  var panel = document.querySelector("[data-accept-panel]");
  var box = document.querySelector("[data-accept]");
  var accepted = false;
  try {
    accepted = localStorage.getItem(ACCEPT_KEY) === POLICY_VERSION;
  } catch (_e) {}

  // Every download control keeps its real destination in `data-href` and only
  // wears an `href` once the box is ticked. One place decides, so nothing that
  // redraws a button later can hand the link back by accident.
  function gatedControls() {
    return document.querySelectorAll("[data-href]");
  }
  function setHref(el, url) {
    if (!el) return;
    el.setAttribute("data-href", url);
    if (accepted) {
      el.setAttribute("href", url);
    } else {
      el.removeAttribute("href");
    }
  }
  function applyGate() {
    Array.prototype.forEach.call(gatedControls(), function (el) {
      if (accepted) {
        el.setAttribute("href", el.getAttribute("data-href"));
        el.removeAttribute("aria-disabled");
      } else {
        el.removeAttribute("href");
        el.setAttribute("aria-disabled", "true");
      }
    });
    if (panel) panel.classList.toggle("accept--on", accepted);
    if (box) box.checked = accepted;
  }

  // A click on a control with no href does nothing at all, which reads as a
  // broken page. Say what is missing instead, and put the cursor on it.
  function nudge() {
    if (panel) {
      panel.classList.remove("accept--nudge");
      void panel.offsetWidth;             // restart the animation
      panel.classList.add("accept--nudge");
    }
    if (box) box.focus();
  }

  // The markup ships working hrefs so the page is useful before this file
  // runs, and every one of them has to come under the gate now, including the
  // two package rows that keep pointing at the releases page until
  // latest.json answers and render() gives them a real one.
  Array.prototype.forEach.call(
    document.querySelectorAll("#download-btn, .menu-row[data-target]"),
    function (el) {
      var href = el.getAttribute("href");
      if (href) el.setAttribute("data-href", href);
    });
  applyGate();

  if (box) {
    box.addEventListener("change", function () {
      accepted = box.checked;
      try {
        if (accepted) {
          localStorage.setItem(ACCEPT_KEY, POLICY_VERSION);
        } else {
          localStorage.removeItem(ACCEPT_KEY);
        }
      } catch (_e) {}
      applyGate();
    });
  }

  // The panel is the hit target, not only the 20px box inside it, so a click
  // anywhere that is not already a link or the label toggles the checkbox.
  if (panel && box) {
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a, label, input")) return;
      box.checked = !box.checked;
      box.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  document.addEventListener("click", function (event) {
    var el = event.target.closest && event.target.closest("[data-href]");
    if (el && !accepted) {
      event.preventDefault();
      nudge();
    }
  });

  var meta = document.getElementById("download-meta");
  if (!meta) return;

  var WIN_HREF = "https://callifornia-download.storage.yandexcloud.net/stable/CalliforniaSetup.exe";
  // Fallback while latest.json hasn't loaded (or failed): always has both
  // packages attached, unlike the bucket paths which have no versionless alias.
  var GITHUB_RELEASES_URL = "https://github.com/frontmany/CalliforniaApp/releases/latest";
  // NOTE: must match the bucket (or CDN domain) the release workflow uploads to.
  var META_URL = "https://callifornia-download.storage.yandexcloud.net/stable/latest.json";

  // One button, on this page. The home page's two calls to action are plain
  // links here and carry no platform in their label, because they hand over no
  // file and the detection they would have quoted is a guess.
  var downloadBtns = [document.getElementById("download-btn")];
  var downloadLabels = [document.getElementById("download-label")];
  // The split button's menu. Its rows ship with working hrefs (Windows on the
  // installer, Linux on the releases page), so the control is useful before
  // this file runs and if latest.json never answers.
  var details = document.getElementById("download-details");
  var menuRows = document.querySelectorAll(".menu-row[data-target]");

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
    var savedPlatform = localStorage.getItem("callifornia-platform");
    if (savedPlatform === "windows" || savedPlatform === "linux") state.platform = savedPlatform;
    var savedPkg = localStorage.getItem("callifornia-pkg");
    if (savedPkg === "deb" || savedPkg === "rpm") state.pkg = savedPkg;
  } catch (_e) {}
  if (!state.platform) state.platform = detectPlatform() === "linux" ? "linux" : "windows";
  if (!state.pkg) state.pkg = DEFAULT_PKG;

  var latestData = null;
  var fetchFailed = false;

  /// Which menu row the button currently stands for.
  function currentTarget() {
    return state.platform === "linux" ? state.pkg : "windows";
  }

  function megabytes(bytes) {
    return t("size.mb", { size: (bytes / (1024 * 1024)).toFixed(0) }) || "";
  }

  function renderMenu(linuxInfo) {
    var target = currentTarget();
    menuRows.forEach(function (row) {
      var key = row.getAttribute("data-target");
      row.classList.toggle("menu-row--on", key === target);

      if (key === "windows") {
        setHref(row, WIN_HREF);
      } else if (linuxInfo) {
        setHref(row, key === "rpm" ? linuxInfo.rpm : linuxInfo.deb);
      }

      var size = row.querySelector(".size");
      if (!size) return;
      // Each row's own figure or nothing. `size` in the linux entry is the
      // .deb's, for the site that has always read it there; the .rpm carries
      // its own, and a release from before that was published simply leaves
      // the row without one rather than borrowing a number from a different
      // file.
      if (key === "windows" && latestData && latestData.size) {
        size.textContent = megabytes(latestData.size);
      } else if (key === "deb" && linuxInfo && linuxInfo.size) {
        size.textContent = megabytes(linuxInfo.size);
      } else if (key === "rpm" && linuxInfo && linuxInfo.rpmSize) {
        size.textContent = megabytes(linuxInfo.rpmSize);
      }
    });
  }

  function render() {
    var isLinux = state.platform === "linux";
    var linuxInfo = latestData && latestData.platforms && latestData.platforms["linux-x64"];
    renderMenu(linuxInfo);
    var href = WIN_HREF;
    var label = t("download.windows");
    var metaText = t("meta.ready");

    if (isLinux) {
      label = t("download.linux", { pkg: state.pkg });
      if (linuxInfo) {
        href = state.pkg === "rpm" ? linuxInfo.rpm : linuxInfo.deb;
        var linuxVersion = String(linuxInfo.version || "").replace(/^v/, "");
        if (linuxVersion) {
          // Written out rather than built from a variable, so the three keys
          // are greppable from here and from the dictionary.
          if (state.pkg === "rpm" && linuxInfo.rpmSize) {
            metaText = t("meta.rpm", {
              version: linuxVersion,
              size: (linuxInfo.rpmSize / (1024 * 1024)).toFixed(0)
            });
          } else if (state.pkg === "rpm") {
            // A release published before the .rpm was measured. The link
            // works; only the figure is missing, and it stays missing rather
            // than showing the .deb's.
            metaText = t("meta.rpm.nosize", { version: linuxVersion });
          } else if (linuxInfo.size) {
            metaText = t("meta.deb", {
              version: linuxVersion,
              size: (linuxInfo.size / (1024 * 1024)).toFixed(0)
            });
          }
        }
      } else {
        // No versionless "latest" alias exists for the packages the way
        // stable/CalliforniaSetup.exe does for Windows, so while latest.json is
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

    downloadBtns.forEach(function (btn) { setHref(btn, href); });
    downloadLabels.forEach(function (el) { if (el && label) el.textContent = label; });
    if (metaText) meta.textContent = metaText;
  }

  // The button and the line under it are written here, not marked up, so they
  // have to be redrawn when the header switch changes the language.
  if (i18n) i18n.onChange(render);

  function setPlatform(platform) {
    state.platform = platform;
    try { localStorage.setItem("callifornia-platform", platform); } catch (_e) {}
    render();
  }
  function setPkg(pkg) {
    state.pkg = pkg;
    try { localStorage.setItem("callifornia-pkg", pkg); } catch (_e) {}
    render();
  }

  // Picking a row downloads that file (the row is a link, and the click is
  // left to do its job) and makes it the button, so the next visit starts
  // where this one ended.
  menuRows.forEach(function (row) {
    row.addEventListener("click", function () {
      var key = row.getAttribute("data-target");
      if (key === "windows") {
        setPlatform("windows");
      } else {
        setPkg(key);
        setPlatform("linux");
      }
      if (details) details.open = false;
    });
  });

  // A <details> closes on its own summary, and that is all it knows. The two
  // things anybody expects of an open menu are these.
  if (details) {
    document.addEventListener("click", function (event) {
      if (details.open && !details.contains(event.target)) details.open = false;
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && details.open) {
        details.open = false;
        var summary = details.querySelector("summary");
        if (summary) summary.focus();
      }
    });
  }

  render();
  // render() has now given every control a data-href; the gate decides whether
  // any of them wears it.
  applyGate();

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
