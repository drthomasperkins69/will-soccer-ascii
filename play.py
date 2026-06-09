#!/usr/bin/env python3
"""ASCII soccer movie - William Perkins scores for Ambrose Treacy 9/10C.

Plays frames.json (generated from movie.js, the single source of truth:
`node movie.js > frames.json`). Loops forever; Ctrl+C to stop.
"""

import json
import os
import sys
import time

CLEAR = "\033[2J\033[H"
HIDE_CURSOR = "\033[?25l"
SHOW_CURSOR = "\033[?25h"
FLASH_ON = "\033[1;97m"
RESET = "\033[0m"


def load_frames():
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frames.json")
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def main():
    frames = load_frames()
    sys.stdout.write(HIDE_CURSOR)
    sys.stdout.flush()
    try:
        while True:  # loop forever
            for frame in frames:
                sys.stdout.write(CLEAR)
                if frame.get("flash"):
                    sys.stdout.write(FLASH_ON + frame["text"] + RESET)
                else:
                    sys.stdout.write(frame["text"])
                sys.stdout.flush()
                time.sleep(frame["delay"] / 1000.0)
    except KeyboardInterrupt:
        pass
    finally:
        sys.stdout.write(SHOW_CURSOR + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    main()
