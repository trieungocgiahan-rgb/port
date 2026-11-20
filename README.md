# Common Room prototype

A clickable demo that walks a partner through every feature in about 5 minutes.
All data is fake. There's no login, no payment, no backend and no AI.

## Run it

```bash
npm install
npm run dev            # local dev server
npm run build          # static site in dist/
npm run build:single   # everything in one HTML file: dist-single/index.html
```

`dist-single/index.html` opens straight from disk or any static host, so it's the easiest file to send around.

## Demo path

Landing → Get started → Quiz (7 questions) → Building your plan → My Plan → a tool → Community → Find a mentor → Matches → Mentor profile → Book → Done

Screens switch by URL hash (`#plan`, `#tools`, `#tool-deadlines`, `#tool-css`, `#community`, `#mentors`, `#matches`, `#mentor-minh`, `#packages`, `#profile-check`), so any screen can be linked directly.
Demo state (quiz answers, ticked tasks, bookings, posts) stays in the browser. "Restart demo" in the top banner clears it.

## Where things live

| What | File |
| --- | --- |
| All fake data: student, quiz, tasks, deadlines, packages, mentors, posts, schools, tools, CSS Profile steps | `src/data.json` |
| Colors, type, layout | `src/styles.css` (tokens at the top) |
| Screens | `src/screens/` |
| Plan, matching and package logic | `src/lib.jsx` |

### Swap the name
Change `brand.name` in `src/data.json` and the `<title>` in `index.html`.

### Swap the accent color
Change `--accent` (and `--accent-soft`) at the top of `src/styles.css`.

## Not built (on purpose)
Login, real payments, a real AI or backend, and anything for mentors to manage their side.
