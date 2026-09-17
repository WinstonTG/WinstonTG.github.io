# Winston Gilbert — Personal Website

An interactive, responsive portfolio built as a collection of isometric rooms. Each room represents part of Winston’s practice:

- **Systems lab** — agents, memory, world models, and AI-native computing
- **Listening room** — DJing, electronic music, discovery, and creative tools
- **Reading room** — philosophy, writing, ethics, mind, meaning, and aesthetics
- **The long room** — strength, endurance, the outdoors, and long-horizon work

The site uses plain HTML, CSS, inline SVG, and JavaScript. There is no build step or runtime dependency. The room illustrations are drawn directly in `index.html`, which keeps GitHub Pages deployment simple and avoids loading a 3D engine.

## Run locally

From this directory, start any static file server:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Structure

- `index.html` — page content and the four isometric SVG room scenes
- `styles.css` — layout, visual system, responsive behavior, and animation
- `script.js` — room navigation, keyboard controls, touch swipes, pointer depth, mobile navigation, and reveal behavior
- `favicon.svg` — site icon

## Interaction and accessibility

- Select a room with the directory tabs or previous/next controls.
- Use arrow keys, Home, and End while focused on a room tab.
- Swipe horizontally across the room explorer on touch devices.
- Pointer movement adds restrained depth on fine-pointer devices.
- Motion is minimized when `prefers-reduced-motion` is enabled.
- All room scenes include accessible SVG titles and descriptions.

## Publish

Commit and push changes to `main`. GitHub Pages serves this repository at <https://winstontg.github.io/>.
