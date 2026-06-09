#!/usr/bin/env python3
"""ASCII soccer movie - William Perkins scores for Ambrose Treacy 9/10C.

Python port of movie.js. Loops forever; Ctrl+C to stop.
"""

import sys
import time

W, H = 72, 14
BAR = 3            # crossbar row
GX, GR = 55, 69    # goal posts (columns)
GROUND = 11        # ground row
PT = GROUND - 3    # player sprite top row
BALLY = GROUND - 1

LEGS = ["/ \\", " |\\", "/| ", " |\\"]  # run cycle
TORSO = "/9\\"
DEF = [" O ", "/X\\", "/ \\"]
DEF_LUNGE = [" O ", "/X\\", "< \\"]
KEEP = [" O ", "(K)", "/ \\"]
CELEB_A = ["\\O/", " 9 ", "/ \\"]
CELEB_B = ["\\O/", " 9 ", "| |"]

DX = 24  # defender x
KX = 52  # keeper x

CLEAR = "\033[2J\033[H"
HIDE_CURSOR = "\033[?25l"
SHOW_CURSOR = "\033[?25h"
BOLD = "\033[1m"
RESET = "\033[0m"


def new_grid(bare=False):
    g = [[" "] * W for _ in range(H)]
    if bare:
        return g
    for x in range(W):
        g[0][x] = " " if x % 7 in (3, 4) else "~"
    for x in range(GX, GR + 1):
        g[BAR][x] = "_"
    for y in range(BAR + 1, GROUND):
        g[y][GX] = "|"
        g[y][GR] = "|"
        for x in range(GX + 1, GR):
            g[y][x] = "#" if (x + y) % 2 else " "
    for x in range(W):
        g[GROUND][x] = "_"
    return g


def put(g, x, y, sprite):
    for dy, row in enumerate(sprite):
        for dx, ch in enumerate(row):
            if ch == " ":
                continue
            yy, xx = y + dy, x + dx
            if 0 <= yy < H and 0 <= xx < W:
                g[yy][xx] = ch


def set_ch(g, x, y, ch):
    if 0 <= y < H and 0 <= x < W:
        g[y][x] = ch


def caption(g, s):
    t = ">> " + s
    for i, ch in enumerate(t):
        if 2 + i >= W:
            break
        g[H - 1][2 + i] = ch


def center_text(g, y, s):
    x = max(0, (W - len(s)) // 2)
    for i, ch in enumerate(s):
        if x + i >= W:
            break
        g[y][x + i] = ch


def player(g, px, leg_idx):
    put(g, px, PT, [" O ", TORSO, LEGS[leg_idx % len(LEGS)]])


def confetti(g, f):
    for i in range(16):
        x = (i * 53 + f * 29) % 50 + 3
        y = (i * 31 + f * 17) % 7 + 1
        ch = "." if i % 3 == 0 else "*"
        if g[y][x] in (" ", "~"):
            g[y][x] = ch


def build_frames():
    frames = []

    def snap(g, delay_ms, flash=False):
        frames.append(("\n".join("".join(r) for r in g), delay_ms / 1000.0, flash))

    # --- Title / kickoff (loop seam) ---
    g = new_grid()
    center_text(g, 5, "W I L L I A M   P E R K I N S")
    center_text(g, 7, "-- GOAL OF THE SEASON --")
    put(g, KX, PT, KEEP)
    caption(g, "Ambrose Treacy 9/10C ... kickoff!")
    snap(g, 900)

    # --- Phase 1: Will runs the ball up from midfield ---
    for i in range(9):
        px = 2 + i * 2
        g = new_grid()
        put(g, DX, PT, DEF)
        put(g, KX, PT, KEEP)
        player(g, px, i)
        set_ch(g, px + 4 + (i % 2), BALLY - (1 if i % 3 == 0 else 0), "o")
        caption(g, "Will picks it up at midfield and drives forward...")
        snap(g, 110)

    # --- Phase 2: beats the defender with a stepover ---
    g = new_grid()
    put(g, DX, PT, DEF_LUNGE)
    put(g, KX, PT, KEEP)
    player(g, 20, 1)
    set_ch(g, 23, BALLY, "o")
    caption(g, "The defender steps up to challenge...")
    snap(g, 150)

    g = new_grid()
    put(g, DX, PT, DEF_LUNGE)
    put(g, KX, PT, KEEP)
    player(g, 22, 2)
    set_ch(g, 27, BALLY - 1, "o")
    caption(g, "STEPOVER! Oh, that's filthy!")
    snap(g, 170)

    g = new_grid()
    put(g, DX, GROUND - 1, ["_O<"])  # defender on the floor
    put(g, KX, PT, KEEP)
    player(g, 27, 0)
    set_ch(g, 32, BALLY, "o")
    caption(g, "He's left him for dead!")
    snap(g, 150)

    # --- Phase 3: surge into the box ---
    for i in range(4):
        px = 29 + i * 2
        g = new_grid()
        put(g, DX, GROUND - 1, ["_O<"])
        put(g, KX, PT, KEEP)
        player(g, px, i + 1)
        set_ch(g, px + 4 + (i % 2), BALLY - (1 if i % 3 == 0 else 0), "o")
        caption(g, "Will surges into the box...")
        snap(g, 110)

    # --- Phase 4: wind-up ---
    for i in range(2):
        g = new_grid()
        put(g, DX, GROUND - 1, ["_O<"])
        put(g, KX, PT, KEEP)
        put(g, 36, PT, ["\\O ", " 9\\", "/ <"])
        set_ch(g, 41, BALLY, "o")
        caption(g, "He shapes to shoot... the keeper sets himself...")
        snap(g, 240 if i == 0 else 150)

    # --- Phase 5: STRIKE ---
    g = new_grid()
    put(g, DX, GROUND - 1, ["_O<"])
    put(g, KX, PT, KEEP)
    put(g, 36, PT, [" O ", TORSO, "/ /"])
    for x in (40, 41, 42):
        set_ch(g, x, BALLY, "=")
    set_ch(g, 43, BALLY, "o")
    caption(g, "STRIKE!!")
    snap(g, 110)

    # --- Phase 6: ball flight, keeper dives the wrong way ---
    path = [(46, 9), (50, 8), (54, 7), (57, 6), (60, 5)]
    for f, (bx, by) in enumerate(path):
        g = new_grid()
        put(g, DX, GROUND - 1, ["_O<"])
        put(g, 36, PT, [" O ", TORSO, "/ \\"])
        if f < 2:
            put(g, KX, PT, KEEP)
        else:
            put(g, 47, PT + 1, ["O__", " \\\\"])  # keeper diving low
        for i in range(max(0, f - 2), f):
            set_ch(g, path[i][0], path[i][1], ".")
        set_ch(g, bx, by, "o")
        caption(g, "It's flying..." if f < 2 else "The keeper dives... the wrong way!!")
        snap(g, 70)

    # --- Phase 7: top bins, net ripples ---
    for f in range(2):
        g = new_grid()
        put(g, DX, GROUND - 1, ["_O<"])
        put(g, 36, PT, [" O ", TORSO, "/ \\"])
        put(g, 47, PT + 1, ["O__", " \\\\"])
        set_ch(g, 61, 5, "O")
        set_ch(g, 60, 5, "(" if f == 0 else ")")
        set_ch(g, 62, 5, ")" if f == 0 else "(")
        set_ch(g, 61, 4, ")" if f == 0 else "(")
        set_ch(g, 61, 6, "(" if f == 0 else ")")
        caption(g, "TOP BINS!!!")
        snap(g, 140, f == 0)

    # --- Phase 8: GOAL banner + celebration ---
    for f in range(6):
        g = new_grid()
        put(g, DX, GROUND - 1, ["_O<"])
        put(g, 47, PT + 1, ["O__", " \\\\"])
        set_ch(g, 61, 5, "o")
        confetti(g, f)
        center_text(g, 5, "G  O  O  O  A  A  L  L  !  !  !")
        put(g, 38, PT - (f % 2), CELEB_A if f % 2 == 0 else CELEB_B)
        caption(g, "GOOOAAALLLL!!! WILLIAM PERKINS!!!")
        snap(g, 220, f % 2 == 0)
    for f in range(6, 9):
        g = new_grid()
        put(g, KX, PT, KEEP)
        set_ch(g, 61, 5, "o")
        confetti(g, f)
        put(g, 38, PT - (f % 2), CELEB_A if f % 2 == 0 else CELEB_B)
        caption(g, "Ambrose Treacy 9/10C  1 - 0  --  what a hit, Will!")
        snap(g, 210)

    # --- Phase 9: full-time scoreboard ---
    g = new_grid(bare=True)
    bw = 50
    x0 = (W - bw) // 2
    for bx in range(bw):
        g[2][x0 + bx] = "#"
        g[12][x0 + bx] = "#"
    for by in range(3, 12):
        g[by][x0] = "#"
        g[by][x0 + bw - 1] = "#"
    center_text(g, 4, "A M B R O S E   T R E A C Y   9 / 1 0 C")
    center_text(g, 6, "F U L L   T I M E :   1 - 0")
    center_text(g, 8, "GOAL:  WILLIAM PERKINS  (#9)")
    center_text(g, 10, "MAN OF THE MATCH:  WILL")
    caption(g, "replaying...")
    snap(g, 2600)

    return frames


def main():
    frames = build_frames()
    sys.stdout.write(HIDE_CURSOR)
    sys.stdout.flush()
    try:
        while True:  # loop forever
            for text, delay, flash in frames:
                sys.stdout.write(CLEAR)
                if flash:
                    sys.stdout.write(BOLD + text + RESET)
                else:
                    sys.stdout.write(text)
                sys.stdout.flush()
                time.sleep(delay)
    except KeyboardInterrupt:
        pass
    finally:
        sys.stdout.write(SHOW_CURSOR + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    main()
