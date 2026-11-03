# InfluencerAct — Creator Network Landing Page

Landing page inviting creators to join the InfluencerAct network. Plain HTML, CSS and JavaScript — no build step or dependencies.

## Project structure

```
.
├── index.html                  # page markup
├── assets/
│   ├── css/styles.css          # all styles
│   ├── js/main.js              # animations + join-form validation/submission
│   └── images/
│       ├── logo.png            # logo + favicon
│       ├── brands/             # partner brand logos
│       └── sections/           # section photography
├── netlify.toml                # Netlify deploy config
└── README.md
```

## Run locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Deploy

Hosted on Netlify. `netlify.toml` publishes the repository root as-is.
The join form uses **Netlify Forms** (form name `contact`); submissions appear in the Netlify dashboard under **Forms**.
