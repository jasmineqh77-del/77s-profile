# About + Contact windows

Date: 2026-09-01

Two existing windows. No new apps. Resume stays the empty PDF placeholder until a file is provided.

## About Me

### Job

A 10-second glance: who this person is. Internship write-ups stay in My Documents. `about.intro` stays in `whoami` only — do not render it here.

### Layout

Vertical stack, same reading order as today:

1. Pixel headline `About 77` (unchanged)
2. Childhood photo, hook, caption (unchanged: image, alt, copy, ⛰️)
3. A `fieldset` with legend `System`, containing a two-column spec table

Do not switch to a two-column photo/table layout. Reuse the existing fieldset + `.specTable` chrome (same family as the current Contact table).

### Spec rows

First row is the OS joke; the rest is factual. Replace the current `about.specs` with exactly:

| Label | Value |
| --- | --- |
| System | 77-OS Professional |
| Status | MSc student, CUHK |
| School | CUHK (Sep 2026 – Jun 2027) · Jiangsu Normal University (Sep 2022 – Jun 2026) |
| Major | MSc Mathematics (Big Data) · BSc Data Science and Big Data Technology |
| Location | Xuzhou, Jiangsu → Hong Kong |
| Currently | In Hong Kong for the new term, writing up past internships, building this site |

### Window size

Bump `about` `defaultSize` height so the photo story plus six rows fit without scrolling on a typical laptop. Keep width 560. Existing window-store clamping still applies on short screens; inner scroll is the fallback, not the target.

## Contact Me

### Job

The visitor writes 77 an email inside 77-OS. Channels without a real value (WeChat, GitHub, Xiaohongshu) are removed from this window until they exist.

### Layout

A compose form inside the existing Aero window. No nested fake title bar, no From field.

- Lead line: `Write a message and hit Send.` (replaces “Get in touch” / “Any channel works…”)
- **To:** `1697429486@qq.com`, not editable. The address is the `mailto` value already in `contacts`.
- **Copy address:** text button/link next to To. Copies the address with `navigator.clipboard.writeText`. On success, the control reads `Copied.` for 1.5s then reverts. If clipboard is unavailable, select the address text so the visitor can copy manually.
- **Subject:** prefilled `Hello from 77-OS`, editable.
- **Body:** empty, editable, large textarea.
- **Send:** primary button.

### Send

On Send:

1. Show a small in-window dialog (not a second OS window): body `Your message has been placed in the Outbox.` and a single `OK` button. Pointer-down outside the dialog does not dismiss it; only OK does (XP-style).
2. Open `mailto:` with the current To, Subject, and Body (`encodeURIComponent` on subject and body). Empty body is allowed.
3. After OK, the compose window stays open. Copy address remains available if `mailto` did nothing.

Do not POST anywhere. Do not add a mail backend.

### Data

`contacts` in `content/site.ts` keeps only the email entry for now. Drop the three `(coming soon)` rows from the array so they cannot leak back into the UI.

Contact no longer renders a generic spec table from that array; the compose form is the UI. The email value is still read from `contacts` (the single remaining entry), not duplicated as a magic string in the component.

### Window size

Increase `contact` `defaultSize` enough for To, Subject, a usable body, and Send without scrolling. Keep it narrower than About (around 480–520 wide).

## Out of scope

- `resume.pdf` and the Resume window
- About tabs, two-column General layout, rewriting hook/caption
- Rendering `about.intro` in About
- WeChat / GitHub / Xiaohongshu UI, QR codes, guest-book changes
- New apps, sounds, tray icons

## Files likely to change

- `content/site.ts` — `about.specs`, `contacts`
- `src/apps/About.tsx` — fieldset + table under the existing photo story
- `src/apps/Contact.tsx` — compose form + in-window Outbox dialog
- `src/apps/apps.module.css` and/or `src/apps/Contact.module.css` — compose fields
- `src/os/appMeta.ts` — default heights
