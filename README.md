# Callifornia — website

The download landing page for the [Callifornia](https://github.com/frontmany/CalliforniaApp)
desktop client. Plain static HTML/CSS/JS (no build step, no framework) —
deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to
`main`.

## The look

The page is the app's own design language, not a separate brand:

- **Palette, type and radii** are `CalliforniaApp/resources/qml/Theme.qml`
  one to one, in both themes. `assets/style.css` keeps them as tokens with the
  same names.
- **The backdrop** (`.backdrop`) is `components/ScreenBackdrop.qml` ported to
  CSS: an accent wash bleeding in from above, a dimmer one from the
  bottom-right corner, and DotGrid's 22px dot grain over both. The washes carry
  the app's squared falloff, which is what keeps a disc that big from showing a
  rim.
- **The hero composition** is `screens/HomeScreen.qml` — mono eyebrow,
  oversized headline with negative tracking, muted line, actions, and the
  character bleeding in from the right.
- **The mockups** inside the feature rows are pieces of real screens (the join
  step, a roster with live presence, the updater), drawn with the app's own
  glyph paths from `Icons.qml`. There is deliberately **no picture of a call in
  progress**: a grid of stand-in avatars said nothing the copy does not.

Two rules the app's UI follows and this site follows with it: no `·`
character, and no dashes or colons in visitor-facing copy.

## The character

`assets/mascot-*.webp` are the app's Home hero art
(`CalliforniaApp/resources/images/doggy*.png`, one character in eight poses,
drawn at random by `HeroArt.qml`). The site spends one pose per place, chosen
for what that page is saying:

| File | Pose | Where |
|------|------|-------|
| `mascot-wave.webp` | winking, one paw up | home hero |
| `mascot-cheer.webp` | star eyes, both paws up | bottom call to action |
| `mascot-hi.webp` | paws up, delighted | join page, valid link |
| `mascot-oops.webp` | gasp, paws on cheeks | join page, broken link and mobile |

To add or replace one, take the source PNG from the app, trim its transparent
margin, scale the long edge to what the page draws it at (about 700px for the
hero, 460px for the smaller spots) and save it as WebP at quality ~88. The
renders are ~1 MB each and 3 to 4 times larger than they are ever displayed, so
shipping them untouched is the one thing worth not doing.

`assets/logo-mark.webp` is the same idea for the app mark: `logo.png` is 89 KB
and every page draws it at 28px, so the pages load the small copy and the full
PNG stays for `og:image`, which wants the large one.

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
`callifornia://join/<id>` protocol link that CalliforniaApp's installer
registers, and since the handoff can't be detected, the button that repeats it
by hand stays on screen either way.

It has no download block on purpose: the home page already owns that job, and
duplicating it doubled the maintenance surface for a case (no Callifornia
installed) that is rare for somebody who was just sent a link. The page has
three states (valid link, broken link, opened on a phone) and each brings its
own pose of the character, so it says which one it is before a word of it is
read.

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
