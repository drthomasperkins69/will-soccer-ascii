# William Perkins — Goal of the Season

A cinematic, looping ASCII movie of **William Perkins (#9)** scoring for
**Ambrose Treacy 9/10C** — 85 frames, ~26 seconds per loop:

- Opening title sequence ("Ambrose Treacy Sports presents...")
- Stadium establishing shot with floodlights and a ticking match clock
- Broadcast HUD with live score, clock, and news ticker
- The run from midfield with a real leg cycle, crowd shimmer, and ad boards
- A stepover that leaves the last defender seeing stars
- Close-up camera cut of the boot striking the ball ("THWACK!!")
- Ball flight to the top corner, keeper diving the wrong way, net ripple
- Giant FIGlet **GOAL!** letters, flashing, with confetti
- Slow-motion instant replay with wipe transitions
- Knee-slide celebration, mobbed by teammates
- Full-time scoreboard and rolling credits

## Watch it on the web

Open `index.html` in any browser, or visit the Vercel deployment.
It auto-plays and loops forever — no typing required.

## Watch it in the terminal

```bash
python3 play.py
```

Loops forever; press `Ctrl+C` to stop. Best in a terminal at least 75 columns wide.

## How it works

`movie.js` is the single source of truth: a frame compositor that redraws the
scene each frame (stands, ad boards, pitch, goal, HUD) and stamps sprites
(runner poses, defender, keeper, ball with trail, teammates) at animated
coordinates. `index.html` runs it directly in the browser. For the terminal,
`frames.json` is pre-rendered with `node movie.js > frames.json` and `play.py`
plays it back.
