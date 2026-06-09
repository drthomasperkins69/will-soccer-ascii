/* William Perkins — Goal of the Season (Ambrose Treacy 9/10C)
   Frame compositor: builds a smooth run-dribble-shoot-score loop. */

(function (root) {
  "use strict";

  var W = 72, H = 14;
  var BAR = 3;          // crossbar row
  var GX = 55, GR = 69; // goal posts (columns)
  var GROUND = 11;      // ground row
  var PT = GROUND - 3;  // player sprite top row
  var BALLY = GROUND - 1;

  // Sprites are 3 rows tall, drawn with transparent spaces.
  var LEGS = ["/ \\", " |\\", "/| ", " |\\"]; // run cycle
  var TORSO = "/9\\";
  var DEF = [" O ", "/X\\", "/ \\"];
  var DEF_LUNGE = [" O ", "/X\\", "< \\"];
  var KEEP = [" O ", "(K)", "/ \\"];
  var CELEB_A = ["\\O/", " 9 ", "/ \\"];
  var CELEB_B = ["\\O/", " 9 ", "| |"];

  var DX = 24; // defender x
  var KX = 52; // keeper x

  function newGrid(bare) {
    var g = [], x, y;
    for (y = 0; y < H; y++) {
      var row = [];
      for (x = 0; x < W; x++) row.push(" ");
      g.push(row);
    }
    if (bare) return g;
    for (x = 0; x < W; x++) g[0][x] = (x % 7 === 3 || x % 7 === 4) ? " " : "~";
    for (x = GX; x <= GR; x++) g[BAR][x] = "_";
    for (y = BAR + 1; y < GROUND; y++) {
      g[y][GX] = "|";
      g[y][GR] = "|";
      for (x = GX + 1; x < GR; x++) g[y][x] = ((x + y) % 2) ? "#" : " ";
    }
    for (x = 0; x < W; x++) g[GROUND][x] = "_";
    return g;
  }

  function put(g, x, y, sprite) {
    for (var dy = 0; dy < sprite.length; dy++) {
      var row = sprite[dy];
      for (var dx = 0; dx < row.length; dx++) {
        var ch = row.charAt(dx);
        if (ch === " ") continue;
        var yy = y + dy, xx = x + dx;
        if (yy >= 0 && yy < H && xx >= 0 && xx < W) g[yy][xx] = ch;
      }
    }
  }

  function setCh(g, x, y, ch) {
    if (y >= 0 && y < H && x >= 0 && x < W) g[y][x] = ch;
  }

  function caption(g, s) {
    var t = ">> " + s;
    for (var i = 0; i < t.length && 2 + i < W; i++) g[H - 1][2 + i] = t.charAt(i);
  }

  function centerText(g, y, s) {
    var x = Math.max(0, Math.floor((W - s.length) / 2));
    for (var i = 0; i < s.length && x + i < W; i++) g[y][x + i] = s.charAt(i);
  }

  function player(g, px, legIdx) {
    put(g, px, PT, [" O ", TORSO, LEGS[legIdx % LEGS.length]]);
  }

  function confetti(g, f) {
    for (var i = 0; i < 16; i++) {
      var x = (i * 53 + f * 29) % 50 + 3;
      var y = (i * 31 + f * 17) % 7 + 1;
      var ch = (i % 3 === 0) ? "." : "*";
      if (g[y][x] === " " || g[y][x] === "~") g[y][x] = ch;
    }
  }

  function buildFrames() {
    var frames = [];

    function snap(g, delay, flash) {
      var rows = [], y;
      for (y = 0; y < H; y++) rows.push(g[y].join(""));
      frames.push({ text: rows.join("\n"), delay: delay, flash: !!flash });
    }

    var g, i, f, px;

    // --- Title / kickoff (loop seam) ---
    g = newGrid(false);
    centerText(g, 5, "W I L L I A M   P E R K I N S");
    centerText(g, 7, "-- GOAL OF THE SEASON --");
    put(g, KX, PT, KEEP);
    caption(g, "Ambrose Treacy 9/10C ... kickoff!");
    snap(g, 900);

    // --- Phase 1: Will runs the ball up from midfield ---
    for (i = 0; i < 9; i++) {
      px = 2 + i * 2;
      g = newGrid(false);
      put(g, DX, PT, DEF);
      put(g, KX, PT, KEEP);
      player(g, px, i);
      setCh(g, px + 4 + (i % 2), BALLY - (i % 3 === 0 ? 1 : 0), "o");
      caption(g, "Will picks it up at midfield and drives forward...");
      snap(g, 110);
    }

    // --- Phase 2: beats the defender with a stepover ---
    g = newGrid(false);
    put(g, DX, PT, DEF_LUNGE);
    put(g, KX, PT, KEEP);
    player(g, 20, 1);
    setCh(g, 24 - 1, BALLY, "o"); // ball just ahead, defender lunging at it
    caption(g, "The defender steps up to challenge...");
    snap(g, 150);

    g = newGrid(false);
    put(g, DX, PT, DEF_LUNGE);
    put(g, KX, PT, KEEP);
    player(g, 22, 2);
    setCh(g, 27, BALLY - 1, "o"); // ball flicked past him
    caption(g, "STEPOVER! Oh, that's filthy!");
    snap(g, 170);

    g = newGrid(false);
    put(g, DX, GROUND - 1, ["_O<"]); // defender on the floor
    put(g, KX, PT, KEEP);
    player(g, 27, 0);
    setCh(g, 32, BALLY, "o");
    caption(g, "He's left him for dead!");
    snap(g, 150);

    // --- Phase 3: surge into the box ---
    for (i = 0; i < 4; i++) {
      px = 29 + i * 2;
      g = newGrid(false);
      put(g, DX, GROUND - 1, ["_O<"]);
      put(g, KX, PT, KEEP);
      player(g, px, i + 1);
      setCh(g, px + 4 + (i % 2), BALLY - (i % 3 === 0 ? 1 : 0), "o");
      caption(g, "Will surges into the box...");
      snap(g, 110);
    }

    // --- Phase 4: wind-up ---
    for (i = 0; i < 2; i++) {
      g = newGrid(false);
      put(g, DX, GROUND - 1, ["_O<"]);
      put(g, KX, PT, KEEP);
      put(g, 36, PT, ["\\O ", " 9\\", "/ <"]);
      setCh(g, 41, BALLY, "o");
      caption(g, "He shapes to shoot... the keeper sets himself...");
      snap(g, i === 0 ? 240 : 150);
    }

    // --- Phase 5: STRIKE ---
    g = newGrid(false);
    put(g, DX, GROUND - 1, ["_O<"]);
    put(g, KX, PT, KEEP);
    put(g, 36, PT, [" O ", TORSO, "/ /"]);
    setCh(g, 40, BALLY, "=");
    setCh(g, 41, BALLY, "=");
    setCh(g, 42, BALLY, "=");
    setCh(g, 43, BALLY, "o");
    caption(g, "STRIKE!!");
    snap(g, 110);

    // --- Phase 6: ball flight, keeper dives the wrong way ---
    var path = [[46, 9], [50, 8], [54, 7], [57, 6], [60, 5]];
    for (f = 0; f < path.length; f++) {
      g = newGrid(false);
      put(g, DX, GROUND - 1, ["_O<"]);
      put(g, 36, PT, [" O ", TORSO, "/ \\"]);
      if (f < 2) {
        put(g, KX, PT, KEEP);
      } else {
        put(g, 47, PT + 1, ["O__", " \\\\"]); // keeper diving low
      }
      for (i = Math.max(0, f - 2); i < f; i++) setCh(g, path[i][0], path[i][1], ".");
      setCh(g, path[f][0], path[f][1], "o");
      caption(g, f < 2 ? "It's flying..." : "The keeper dives... the wrong way!!");
      snap(g, 70);
    }

    // --- Phase 7: top bins, net ripples ---
    for (f = 0; f < 2; f++) {
      g = newGrid(false);
      put(g, DX, GROUND - 1, ["_O<"]);
      put(g, 36, PT, [" O ", TORSO, "/ \\"]);
      put(g, 47, PT + 1, ["O__", " \\\\"]);
      setCh(g, 61, 5, "O");
      setCh(g, 60, 5, f === 0 ? "(" : ")");
      setCh(g, 62, 5, f === 0 ? ")" : "(");
      setCh(g, 61, 4, f === 0 ? ")" : "(");
      setCh(g, 61, 6, f === 0 ? "(" : ")");
      caption(g, "TOP BINS!!!");
      snap(g, 140, f === 0);
    }

    // --- Phase 8: GOAL banner + celebration ---
    for (f = 0; f < 6; f++) {
      g = newGrid(false);
      put(g, DX, GROUND - 1, ["_O<"]);
      put(g, 47, PT + 1, ["O__", " \\\\"]);
      setCh(g, 61, 5, "o");
      confetti(g, f);
      centerText(g, 5, "G  O  O  O  A  A  L  L  !  !  !");
      put(g, 38, PT - (f % 2), f % 2 === 0 ? CELEB_A : CELEB_B);
      caption(g, "GOOOAAALLLL!!! WILLIAM PERKINS!!!");
      snap(g, 220, f % 2 === 0);
    }
    for (f = 6; f < 9; f++) {
      g = newGrid(false);
      put(g, KX, PT, KEEP);
      setCh(g, 61, 5, "o");
      confetti(g, f);
      put(g, 38, PT - (f % 2), f % 2 === 0 ? CELEB_A : CELEB_B);
      caption(g, "Ambrose Treacy 9/10C  1 - 0  --  what a hit, Will!");
      snap(g, 210);
    }

    // --- Phase 9: full-time scoreboard ---
    g = newGrid(true);
    var bw = 50, x0 = Math.floor((W - bw) / 2), bx;
    for (bx = 0; bx < bw; bx++) { g[2][x0 + bx] = "#"; g[12][x0 + bx] = "#"; }
    for (var by = 3; by < 12; by++) { g[by][x0] = "#"; g[by][x0 + bw - 1] = "#"; }
    centerText(g, 4, "A M B R O S E   T R E A C Y   9 / 1 0 C");
    centerText(g, 6, "F U L L   T I M E :   1 - 0");
    centerText(g, 8, "GOAL:  WILLIAM PERKINS  (#9)");
    centerText(g, 10, "MAN OF THE MATCH:  WILL");
    caption(g, "replaying...");
    snap(g, 2600);

    return frames;
  }

  var api = { buildFrames: buildFrames, W: W, H: H };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.WillMovie = api;
})(typeof window !== "undefined" ? window : this);
