# William Perkins — Goal of the Season

A looping ASCII movie of **William Perkins (#9)** scoring for **Ambrose Treacy 9/10C**:
run cycle from midfield, a stepover past the defender, a strike into the top corner,
keeper diving the wrong way, net ripple, confetti, and a full-time scoreboard.

## Watch it on the web

Open `index.html` in any browser, or visit the Vercel deployment.
It auto-plays and loops forever — no typing required.

## Watch it in the terminal

```bash
python3 play.py
```

Loops forever; press `Ctrl+C` to stop. Best in a terminal at least 75 columns wide.

## How it works

`movie.js` is a tiny frame compositor: it draws the pitch, goal, and net once per
frame, then stamps sprites (runner poses, defender, keeper, ball with trail) at
animated coordinates — 37 frames, ~8.6s per loop. `play.py` is a line-for-line
Python port producing byte-identical frames for the terminal.
