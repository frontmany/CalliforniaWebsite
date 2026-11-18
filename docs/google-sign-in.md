# Google sign-in on the website

The website has no Google sign-in form, script, font or OAuth callback. Desktop
opens the system browser. The account FAQ and release notes describe the optional
method without asserting that a particular production OAuth client is enabled.

## Documents for Desktop 0.5.4

The English and Russian privacy policy and terms are effective from
**18 November 2026**, with policy acknowledgement version **`2026-11-18`**.
The Desktop installer must use that value for `PolicyVersion`, including its
silent-install acknowledgement. Publish these documents before enabling Google
in production. Site publication itself does not enable Google or change backend
configuration.

The policy describes the Google identifier, profile data, explicit connection of
an existing account, connection retention and short-lived sign-in attempts. It
distinguishes Google's processing from Callifornia's infrastructure and removes
the former unconditional claim that nothing is transferred to another country.
Google confirms identity; Callifornia owns its sessions, device confirmation and
conversation encryption. Google does not receive conversation keys or media.

## Sources checked

- Desktop `637e60e7` / `6b061d4b` and `CalliforniaDesktop/docs/google-auth.md`.
- `CalliforniaBackend/docs/google-auth.md`, migration `039_google_identity.sql`,
  and `Auth/src/service/google.rs`, `Auth/src/store/google.rs`,
  `Auth/src/google.rs`.
- [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect),
  [desktop OAuth](https://developers.google.com/identity/protocols/oauth2/native-app)
  and [Google's privacy policy](https://policies.google.com/privacy), including
  its data-transfers section. Checked on 18 November 2026.
