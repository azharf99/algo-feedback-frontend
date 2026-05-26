## 2026-05-25 - [Add autoComplete attributes to password fields]
**Vulnerability:** Missing autoComplete attributes on password input fields in forms handling user/student creation and profile editing. This could cause browsers or password managers to incorrectly auto-fill logged-in admin credentials.
**Learning:** React password input fields (specifically those used for account creation or setting new passwords) lack `autoComplete="new-password"`.
**Prevention:** Ensure password input fields that are not for login have `autoComplete="new-password"` explicitly set.
