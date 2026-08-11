# Callifornia — website

The download landing page for the [Callifornia](https://github.com/frontmany/CalliforniaApp)
desktop client. Plain static HTML/CSS/JS (no build step, no framework) —
deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to
`main`.

## How the download button works

The **Download for Windows** button in [`index.html`](index.html) links
straight to the installer on Yandex Object Storage:
`https://callifornia-download.storage.yandexcloud.net/stable/CalliforniaSetup.exe` — a
stable, versionless key that CalliforniaApp's release workflow overwrites on every
release (it also keeps an immutable `CalliforniaSetup-<version>.exe` archive copy).

[`assets/main.js`](assets/main.js) additionally fetches
`stable/latest.json` (`{version, size, sha256}`, written by the same
workflow) from that bucket to render the "vX.Y.Z · NN MB" line under the
button. The bucket allows anonymous `GET`/`HEAD` from any origin (CORS), so
the fetch works from the GitHub Pages origin. On fetch failure the line
falls back to static placeholder text.

This means **the site needs zero updates when CalliforniaApp ships a new
release** — publishing a GitHub Release there is all that's needed; the
release workflow refreshes the bucket, and the site picks it up on the next
page load.

## The join page (`join/`)

[`join/index.html`](join/index.html) is where a shared invite link lands:
`…/join/?id=<call-id>`. It bounces the visitor into the desktop app via the
`callifornia://join/<id>` protocol link that CalliforniaApp's installer registers, and
offers the installer to anyone who doesn't have the app yet (the handoff
can't be detected, so the download block is always shown).

The **query form is deliberate**. GitHub Pages has no server-side routing, so
`/join/?id=x` resolves to a real file and answers `200` — a `/join/<id>` path
would 404, which also costs the link preview in chat clients. The page still
accepts a path-style id in case the site ever gains rewrites.

The id is validated against `^[a-z0-9-]{1,64}$` (same rule as
`isPlausibleId()` in CalliforniaApp) before being used, and is only ever written to
the DOM via `textContent` — it arrives from whoever authored the link, so it
is never interpolated into markup.

CalliforniaApp builds these links from `CLIENT_MEETING_LINK_BASE` (see its
`CMakeLists.txt` and `release.yml`). **If this page ever moves — a custom
domain, a rename — that constant has to move with it**, otherwise already
shipped clients keep handing out links to the old URL.

## Platforms

Windows and Linux are both real downloads: the Windows pill points at
`stable/CalliforniaSetup.exe`, the Linux pill at the `.deb` / `.rpm` URLs that
`assets/main.js` reads out of `stable/latest.json`'s `platforms["linux-x64"]`
entry (written by CalliforniaApp's `release-linux` job). Linux carries a "Beta"
badge. macOS is the only disabled "Soon" pill — no build exists yet; wire it
up once `CalliforniaApp`'s release pipeline produces one (see
`CalliforniaApp/RELEASING.md`).

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

## Custom domain

The site is served from the apex `callifornia.online`. The
[`CNAME`](CNAME) file in the repo root is what tells Pages so — it is part of
the published artifact, so it must stay in git; editing the domain in
**Settings → Pages** without updating this file would be undone by the next
deploy.

DNS at the registrar:

| Name | Type | Value |
|------|------|-------|
| `@` | `A` | `185.199.108.153` |
| `@` | `A` | `185.199.109.153` |
| `@` | `A` | `185.199.110.153` |
| `@` | `A` | `185.199.111.153` |
| `www` | `CNAME` | `frontmany.github.io.` |

(The four A records are GitHub Pages' apex addresses; add the `AAAA` set from
GitHub's docs as well if the registrar supports IPv6.) Once the records
resolve, tick **Enforce HTTPS** in Settings → Pages — Let's Encrypt issues the
certificate automatically, usually within the hour.

`api.callifornia.online` is the backend gateway and is **not** part of Pages:
it is an `A` record pointing at the CalliforniaBackend host. The two never
collide because Pages only claims the apex and `www`.
