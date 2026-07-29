# Calls — website

The download landing page for the [Calls](https://github.com/frontmany/CallsApp)
desktop client. Plain static HTML/CSS/JS (no build step, no framework) —
deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to
`main`.

## How the download button works

The **Download for Windows** button in [`index.html`](index.html) links
straight to the installer on Yandex Object Storage:
`https://calls-download.storage.yandexcloud.net/stable/CallsSetup.exe` — a
stable, versionless key that CallsApp's release workflow overwrites on every
release (it also keeps an immutable `CallsSetup-<version>.exe` archive copy).

[`assets/main.js`](assets/main.js) additionally fetches
`stable/latest.json` (`{version, size, sha256}`, written by the same
workflow) from that bucket to render the "vX.Y.Z · NN MB" line under the
button. The bucket allows anonymous `GET`/`HEAD` from any origin (CORS), so
the fetch works from the GitHub Pages origin. On fetch failure the line
falls back to static placeholder text.

This means **the site needs zero updates when CallsApp ships a new
release** — publishing a GitHub Release there is all that's needed; the
release workflow refreshes the bucket, and the site picks it up on the next
page load.

## Windows-only for now

macOS and Linux are shown as disabled "Soon" pills next to the Windows
download — intentionally not linked to anything yet, since neither build
exists. Wire them up once `CallsApp`'s `platform` field and release pipeline
actually produce them (see `CallsApp/RELEASING.md`).

## Local preview

No build step — just open [`index.html`](index.html) in a browser, or serve
the folder locally, e.g.:

```bash
npx serve .
```

## Deploy

Push to `main`. GitHub Actions (`deploy.yml`) publishes the repo root to
GitHub Pages. First-time setup: in the repo's **Settings → Pages**, set
**Source** to **GitHub Actions**.
