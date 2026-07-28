# Calls — website

The download landing page for the [Calls](https://github.com/frontmany/CallsApp)
desktop client. Plain static HTML/CSS/JS (no build step, no framework) —
deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to
`main`.

## How the download button works

The **Download for Windows** button in [`index.html`](index.html) starts out
pointing at [CallsApp's Releases page](https://github.com/frontmany/CallsApp/releases/latest)
— that link always works, even with JavaScript or the GitHub API unavailable.

[`assets/main.js`](assets/main.js) then progressively upgrades it: it calls
the GitHub API for `frontmany/CallsApp`'s latest release, finds the
`CallsSetup.exe` asset, and rewrites the button to link directly at that file
plus show its version and size. The result is cached in `localStorage` for 10
minutes to stay well under GitHub's unauthenticated API rate limit
(60 req/hour/IP) under real traffic.

This means **the site needs zero updates when CallsApp ships a new
release** — publishing a GitHub Release there is all that's needed; the site
picks it up automatically the next time someone loads the page.

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
