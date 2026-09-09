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
  step, the friends list with live presence and a key notice, the safety
  number card, the updater), drawn with the app's own glyph paths from
  `Icons.qml`. There is deliberately **no picture of a call in progress**: a
  grid of stand-in avatars said nothing the copy does not.

  Each one is copied from a named QML file, so when a screen changes the
  mockup has one place to be checked against: `screens/HomeScreen.qml` for the
  join field, `components/PeopleScreen.qml` for the roster row (one initial on
  the avatar, and one line under the name holding the handle, the status and
  the key chip), `components/SafetyNumberDialog.qml` for the two halves of the
  number, thirty digits each in six groups of five.
- **Every glyph is `Icons.qml`, path for path.** Not "in the style of" and not
  a feather-set lookalike: the literal `d` attribute, at the app's own 24 box
  and 1.75 stroke with round caps and joins. That set is drawn for this
  product and it is the difference between a page that looks like the app and
  a page that looks like every other landing page. There is exactly one
  exception, the download arrow, because nothing inside the app is ever
  downloaded by hand and so the app never had to draw one; it is drawn to the
  same spec.

  Two of them are worth not re-deciding. The tile about letting a computer in
  wears `shieldCheck`, which is what `PairingDialog.qml` puts on that exact
  moment. "Nothing to sell" wears `eyeOff`, since the shield family was
  already spoken for and an eye with a line through it is nearer the claim.

  The glyph chips (`.tile-glyph`, `.panel-icon`) are the app's too:
  `PairingDialog.qml` and `CrashConsentDialog.qml` both set a glyph on a
  rounded square of `accentSoft`, with the glyph at half the box. The site
  draws the same thing at 34px instead of 56px.

- **The header controls** are `components/SegmentedToggle.qml`, the control
  the app uses for a setting with two or three options: one track, cells of
  one width, and a thumb that slides to the chosen one. There is exactly one
  of them, for language, because **the theme is not a choice here**. It is
  whatever `prefers-color-scheme` says, answered in the stylesheet, so the
  site carries no theme switch, no stored preference, no attribute on `<html>`
  and no script deciding any of it before first paint. A visitor who wants the
  light one asks their operating system, which is where they set it for
  everything else.

Two rules the app's UI follows and this site follows with it: no `·`
character, and no dashes or colons in visitor-facing copy.

## The two documents, and the box in front of the download

[`privacy.html`](privacy.html) and [`terms.html`](terms.html) are the published
policy and the published agreement. They are written against **152-FZ**, the
operator is **a private individual reachable by email** rather than a company,
the stated minimum age is **16**, and both carry an "in force from" date at the
top that is the version people are agreeing to.

`CalliforniaBackend/PRIVACY.md` is not a second policy. It is the engineering
note the service-side facts are checked against, and it points here. When one
changes, check the other.

**Downloading is [`download.html`](download.html) and nowhere else.** The home
page's hero button is a plain link to it, `Download` sits in the header bar of
every page in the accent, and the closing card that used to carry a second copy
of the whole apparatus is gone. One control, one acceptance, one place to keep
in step.

The picker on that page is the split button unchanged, because it was not the
thing that needed changing. What did was the acceptance: it had been a 17px box
and a line of grey type hanging off the bottom of the button, shaped like small
print and read as small print. It is a step now, above the button, in a panel
of its own at reading size, and the whole panel is the hit target.

**The box before the download is a record, not a lock.** It writes the policy
date into `localStorage` under `callifornia-accepted`, and until it is ticked
every download control keeps its real destination in `data-href` and wears no
`href` at all, so a click cannot navigate. That stops the ordinary visitor and
it stops them honestly, but the installer is a public URL on object storage and
anybody who wants it around the box can have it. Do not let anyone tell you the
gate is access control; it is proof the two documents were put in front of
somebody, and that is worth having on its own.

Raising `POLICY_VERSION` in [`assets/main.js`](assets/main.js) asks everybody
again. Raise it together with the date on both pages whenever a change actually
affects what somebody agreed to, and leave it alone for a typo.

### What is still missing before this is airtight

- **A named operator.** 152-FZ expects one identified well enough to be written
  to. An email address alone is thin for a public service. A surname and a
  postal address, or an IP registration, is what closes it.
- **A notification to Roskomnadzor** that personal data is being processed, if
  the service is to be run publicly rather than for a handful of accounts.
- **Account deletion in the app.** The policy promises deletion on request and
  says plainly that there is no button yet, which is honest but is a promise a
  person has to keep by hand. `Auth` has no delete route at all today.
- **Crash report retention.** Everything else on the retention table sweeps
  itself. Crash reports do not, and the table says so rather than inventing a
  number.

## Fonts

IBM Plex is served from [`assets/fonts/`](assets/fonts) and declared in
[`assets/fonts.css`](assets/fonts.css), rather than linked from Google Fonts.
This is a privacy decision, not a performance one: a stylesheet link to
`fonts.googleapis.com` makes the browser fetch the CSS and then the files, and
the address of everyone who opens a page here reaches a third party outside
Russia before a word is rendered. The privacy policy says that does not happen,
which is only true while these files sit next to the pages.

Eighteen files, 486 KB on disk, latin, latin-ext and cyrillic for the six
weights the site uses. A visitor fetches only the subsets their text needs,
which is about 120 KB in English and 95 KB in Russian. IBM Plex is under the
SIL Open Font License 1.1 and [`assets/fonts/OFL.txt`](assets/fonts/OFL.txt)
travels with the files, so it must stay in git.

To add a weight, fetch Google's stylesheet with a modern browser user agent,
keep the `latin`, `latin-ext` and `cyrillic` faces, download each `woff2` next
to the others and add its `@font-face` to `fonts.css` with the `unicode-range`
Google gave it. The ranges are what make the subsetting work; dropping them
makes every browser fetch every file.

## The character

`assets/mascot-*.webp` are the app's Home hero art
(`CalliforniaApp/resources/images/doggy*.png`, one character in eight poses,
drawn at random by `HeroArt.qml`). The site spends one pose per place, chosen
for what that page is saying:

| File | Pose | Where |
|------|------|-------|
| `mascot-wave.webp` | winking, one paw up | home hero |
| `mascot-sit.webp` | sitting, holding a bone | nothing, currently |
| `mascot-cheer.webp` | star eyes, both paws up | nothing, currently |
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
`stable/latest.json` (`{version, size, sha256, platforms}`, written by the
same workflow) from that bucket to render the "v0.2.1, 83 MB, Windows 10/11
(64 bit)" line under the button. The bucket allows anonymous `GET`/`HEAD` from any origin (CORS), so
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

Since 0.2.0 the link also carries the room's key in its fragment (`#k=<43
chars of base64url>`), which the page reads and passes through to the
protocol link. A fragment is the one part of a URL a browser never sends to a
server, so the key reaches the app without reaching GitHub Pages or anybody's
access log. Dropping it would leave every shared link opening a room the
recipient cannot read, which is why the broken-link copy now says to take the
*whole* link rather than offering to type an id by hand.

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
badge. macOS is the only disabled "Soon" row — no build exists yet; wire it
up once `CalliforniaApp`'s release pipeline produces one (see
`CalliforniaApp/RELEASING.md`).

**Every row shows its own file's size or none at all.** In that entry, `size`
and `sha256` are the `.deb`'s, which is where the site has always read them,
and the `.rpm` carries `rpmSize` / `rpmSha256` beside them. Until 2026-09-04
nothing measured the `.rpm` at all, so its row simply had no figure; the merge
step in `release.yml` now weighs both packages, and `ci/linux/local-build`
writes both into `linux-facts.txt` for a release run by hand.

A release published before that carries no `rpmSize`, and the row keeps its
blank rather than borrowing the `.deb`'s number. The two packages are built
separately and are not the same size, and a figure next to the wrong file is
worse than no figure. **The `.rpm` row therefore stays empty until the first
release cut after this change.**

## Local preview

No build step — just open [`index.html`](index.html) in a browser, or serve
the folder locally, e.g.:

```bash
npx serve .
```

## The changelog

An entry is prose in two languages: English in `changelog.html`, Russian in
`assets/i18n.js` under `cl.<version without dots>.*`. Nothing generates that
text and nothing should try. What is mechanised is everything around it:

```bash
node tools/changelog.mjs new 0.2.8 --date "10 September 2026"   # skeleton in both files
node tools/changelog.mjs check                                  # both languages, order, no leftovers
```

`check` runs on every deploy, and CalliforniaApp's release workflow runs
`check --version <tag>` against a checkout of this repo before it builds
anything. So a version with no entry cannot ship. That gate exists because
`privacy.html` promises that a change to what is held is announced here before
it takes effect, and the one time nothing was watching, it was not.

## Deploy

Push to `main`. GitHub Actions (`deploy.yml`) publishes the repo root to
GitHub Pages, after `tools/check-css.js` and `tools/changelog.mjs check` pass.
First-time setup: in the repo's **Settings → Pages**, set **Source** to
**GitHub Actions**.

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
