# Pico Park Portfolio

A lightweight, game-like portfolio inspired by Pico Park. Grab the key, open a door, and reveal each resume section.

## How to run
Open `index.html` in any modern browser.

## Controls
- Move: `WASD` or Arrow keys
- Open section panel: `E` when near the sign

## Where to edit your content
Update the section text in:
- `js/content.js`

## File map
- `index.html` — layout + overlays
- `styles.css` — visuals + typography
- `js/game.js` — game loop + interactions
- `js/content.js` — resume/project/education/about data

## Notes
- The intro overlay guides the player to grab the key.
- Doors only open when the key is collected.
- Each section room has a "Back" door to return to the hub.
