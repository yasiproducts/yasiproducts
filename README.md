# Yasi Products — Way Bill & Invoice Management

A client-side only app (no backend/server needed) for creating and managing
way bills and invoices. All data is stored in the browser's `localStorage`.

## Structure
```
yasi-products/
├── index.html
├── css/styles.css
└── js/
    ├── data.js   (countries, currencies, vacuum item list)
    ├── logo.js   (embedded company logo)
    └── app.js    (application logic)
```

## Running locally
Just open `index.html` in a browser — no build step or server required.

## Default login
- Username: `admin`
- Password: `yasi2026`

Change these any time from the sidebar → **Change Login Details** once logged in.

## Hosting on GitHub Pages
1. Push these files to a GitHub repository (see steps below).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Pick the `main` branch and `/ (root)` folder, then **Save**.
5. GitHub gives you a URL like `https://<username>.github.io/<repo-name>/` —
   that's your live site, usually ready within a minute or two.
