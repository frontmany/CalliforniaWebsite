// Progressive enhancement: the Download button already points at the GitHub
// Releases page in the HTML (always works, even with JS/network failures).
// This upgrades it to the direct installer download + shows version/size,
// once the GitHub API confirms where it actually is.

(function () {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  const REPO = "frontmany/CallsApp";
  const ASSET_NAME = "CallsSetup.exe";
  const CACHE_KEY = "calls-latest-release-v1";
  const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min: keeps us well under the

  // unauthenticated GitHub API rate limit (60 req/hr/IP) under real traffic.

  const label = document.getElementById("download-label");
  const meta = document.getElementById("download-meta");
  const btn = document.getElementById("download-btn");

  function formatSize(bytes) {
    return (bytes / (1024 * 1024)).toFixed(0) + " MB";
  }

  function applyRelease(data) {
    const asset = (data.assets || []).find((a) => a.name === ASSET_NAME);
    if (!asset) {
      meta.textContent = "Latest release available on GitHub";
      return;
    }
    const version = (data.tag_name || "").replace(/^v/, "");
    btn.href = asset.browser_download_url;
    label.textContent = "Download for Windows";
    meta.textContent = `v${version} · ${formatSize(asset.size)} · Windows 10/11 (64-bit)`;
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const cached = JSON.parse(raw);
      if (Date.now() - cached.at > CACHE_TTL_MS) return null;
      return cached.data;
    } catch (_e) {
      return null;
    }
  }

  function writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
    } catch (_e) {
      /* storage unavailable (private mode etc.) -- fine, just skip caching */
    }
  }

  const cached = readCache();
  if (cached) {
    applyRelease(cached);
    return;
  }

  fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
    headers: { Accept: "application/vnd.github+json" },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
      return res.json();
    })
    .then((data) => {
      applyRelease(data);
      writeCache(data);
    })
    .catch(() => {
      // Leave the safe fallback (Releases page link) in place.
      meta.textContent = "Latest release available on GitHub";
    });
})();
