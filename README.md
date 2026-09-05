# Winston Gilbert — Personal Website

A lightweight, responsive portfolio focused on AI systems, agent infrastructure, research interests, and selected technical projects. It uses plain HTML, CSS, and JavaScript, so there is no build step or dependency installation.

## Run locally

From this directory, start any static file server:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Customize

The main content lives in `index.html`:

- Update professional positioning in the hero and Thesis sections.
- Maintain Dreamcatcher, AdvisorAI, and RSVP Nano in Selected Work.
- Add new roles to the Experience timeline.
- Update research interests in the Focus section.
- Add contact links in the Contact section when they are ready for public use.
- Change the colors and spacing in the `:root` variables at the top of `styles.css`.

## Publish

Commit and push changes to the `main` branch. For a repository named `WinstonTG.github.io`, GitHub Pages serves the site at <https://winstontg.github.io/>.
