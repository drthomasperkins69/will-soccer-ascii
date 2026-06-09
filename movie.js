/* William Perkins — Goal of the Season (Ambrose Treacy 9/10C)
   Cinematic ASCII frame compositor: title sequence, establishing shot,
   live action with broadcast HUD, close-up strike cut, instant replay,
   celebration and rolling credits. Builds ~100 frames, loops forever. */

(function (root) {
  "use strict";

  var W = 78, H = 20;
  var BAR = 8;            // crossbar row
  var GX = 60, GR = 76;   // goal posts (columns)
  var GROUND = 15;        // ground row
  var PT = GROUND - 3;    // player sprite top row
  var BALLY = GROUND - 1;

  var LEGS = ["/ \\", " |\\", "/| ", " |\\"]; // run cycle
  var TORSO = "/9\\";
  var DEF = [" O ", "/X\\", "/ \\"];
  var DEF_LUNGE = [" O ", "/X\\", "< \\"];
  var KEEP = [" O ", "(K)", "/ \\"];
  var KEEP_DIVE = ["O___", " \\ \\"];
  var CELEB_A = ["\\O/", " 9 ", "/ \\"];
  var CELEB_B = ["\\O/", " 9 ", "| |"];
  var KNEE_SLIDE = ["\\O/", " 9\\", "==>"];
  var MATE = [" o ", "/A\\", "/ \\"];
  var MATE2 = [" o ", "/A\\", " |\\"];

  var DX = 38; // defender x
  var KX = 56; // keeper x

  // 5-row FIGlet letters for the goal moment.
  var FIG = {
    "G": ["  ____ ", " / ___|", "| |  _ ", "| |_| |", " \\____|"],
    "O": ["  ___  ", " / _ \\ ", "| | | |", "| |_| |", " \\___/ "],
    "A": ["    _    ", "   / \\   ", "  / _ \\  ", " / ___ \\ ", "/_/   \\_\\"],
    "L": [" _     ", "| |    ", "| |    ", "| |___ ", "|_____|"],
    "!": [" _ ", "| |", "| |", "|_|", "(_)"]
  };

  function figText(word) {
    var rows = ["", "", "", "", ""];
    for (var i = 0; i < word.length; i++) {
      var glyph = FIG[word.charAt(i)];
      for (var r = 0; r < 5; r++) rows[r] += (i ? " " : "") + glyph[r];
    }
    return rows;
  }

  // ---------- grid helpers ----------

  function blankGrid() {
    var g = [], x, y;
    for (y = 0; y < H; y++) {
      var row = [];
      for (x = 0; x < W; x++) row.push(" ");
      g.push(row);
    }
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

  function hline(g, y, ch) {
    for (var x = 0; x < W; x++) g[y][x] = ch;
  }

  function textAt(g, x, y, s, opaque) {
    for (var i = 0; i < s.length && x + i < W; i++) {
      if (opaque || s.charAt(i) !== " ") g[y][x + i] = s.charAt(i);
    }
  }

  function centerText(g, y, s, opaque) {
    textAt(g, Math.max(0, Math.floor((W - s.length) / 2)), y, s, opaque);
  }

  // ---------- scenery ----------

  var ADS = "==[ GO WILL! ]==[ AMBROSE TREACY 9/10C ]==[ TOP BINS ]==[ PERKINS #9 ]====";

  function stands(g, phase, celebrating) {
    hline(g, 0, "=");
    for (var x = 0; x < W; x++) {
      if (celebrating) {
        g[1][x] = "\\o/ ".charAt((x + phase) % 4);
        g[2][x] = "\\o/ ".charAt((x + phase + 2) % 4);
      } else {
        g[1][x] = ((x + phase) % 3 === 0) ? "o" : " ";
        g[2][x] = ((x + phase + 1) % 3 === 0) ? "o" : " ";
      }
    }
    textAt(g, 0, 3, ADS.substring(0, W), true);
  }

  function pitch(g) {
    var x, y;
    for (x = GX; x <= GR; x++) g[BAR][x] = "_";
    for (y = BAR + 1; y < GROUND; y++) {
      g[y][GX] = "|";
      g[y][GR] = "|";
      for (x = GX + 1; x < GR; x++) g[y][x] = ((x + y) % 2) ? "#" : " ";
    }
    for (x = 0; x < W; x++) g[GROUND][x] = "_";
  }

  function sceneGrid(phase, celebrating) {
    var g = blankGrid();
    stands(g, phase, celebrating);
    pitch(g);
    return g;
  }

  function hud(g, clock, score, ticker) {
    hline(g, 17, "-");
    var bar = " LIVE  *  AMBROSE TREACY 9/10C  " + score + "  *  " + clock + "  ";
    if (ticker) bar += "*  " + ticker;
    textAt(g, 0, 18, bar.substring(0, W), true);
  }

  function caption(g, s) {
    textAt(g, 2, H - 1, (">> " + s).substring(0, W - 2), true);
  }

  function letterbox(g) {
    hline(g, 0, "=");
    hline(g, H - 1, "=");
  }

  function player(g, px, legIdx) {
    put(g, px, PT, [" O ", TORSO, LEGS[legIdx % LEGS.length]]);
  }

  function confetti(g, f, lo, hi) {
    for (var i = 0; i < 22; i++) {
      var x = (i * 37 + f * 29) % (hi - lo) + lo;
      var y = (i * 31 + f * 17) % 11 + 4;
      var ch = (i % 3 === 0) ? "." : "*";
      if (g[y][x] === " ") g[y][x] = ch;
    }
  }

  function clockStr(totalSec) {
    var m = Math.floor(totalSec / 60), s = totalSec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  // ---------- the movie ----------

  function buildFrames() {
    var frames = [];

    function snap(g, delay, flash) {
      var rows = [];
      for (var y = 0; y < H; y++) rows.push(g[y].join(""));
      frames.push({ text: rows.join("\n"), delay: delay, flash: !!flash });
    }

    var g, i, f, px, t;

    // ===== SCENE 1: title sequence =====
    g = blankGrid(); letterbox(g);
    snap(g, 350);

    g = blankGrid(); letterbox(g);
    centerText(g, 8, "A M B R O S E   T R E A C Y   S P O R T S");
    centerText(g, 10, "p r e s e n t s");
    snap(g, 1000);

    g = blankGrid(); letterbox(g);
    centerText(g, 7, "W I L L I A M   P E R K I N S");
    centerText(g, 9, "i n");
    snap(g, 900);

    g = blankGrid(); letterbox(g);
    centerText(g, 6, "*       *       *       *       *");
    centerText(g, 8, "G O A L   O F   T H E   S E A S O N");
    centerText(g, 10, "*       *       *       *       *");
    snap(g, 1000);

    g = blankGrid(); letterbox(g);
    centerText(g, 6, "*       *       *       *       *");
    centerText(g, 8, "G O A L   O F   T H E   S E A S O N");
    centerText(g, 10, "*       *       *       *       *");
    centerText(g, 13, "an Ambrose Treacy 9/10C production");
    snap(g, 900);

    // ===== SCENE 2: establishing shot — the stadium =====
    for (f = 0; f < 4; f++) {
      g = blankGrid();
      stands(g, f, false);
      // floodlight towers
      put(g, 3, 5, ["\\=|=/", "  |  ", "  |  ", "  |  "]);
      put(g, W - 8, 5, ["\\=|=/", "  |  ", "  |  ", "  |  "]);
      // left goal, right goal, halfway line
      textAt(g, 3, 10, "______");
      for (i = 11; i < 15; i++) { setCh(g, 3, i, "|"); setCh(g, 8, i, "|"); }
      textAt(g, W - 9, 10, "______");
      for (i = 11; i < 15; i++) { setCh(g, W - 9, i, "|"); setCh(g, W - 4, i, "|"); }
      for (i = 11; i < 15; i++) setCh(g, 39, i, ":");
      setCh(g, 36, 13, "("); setCh(g, 42, 13, ")");
      // scattered players
      [[18, "i"], [26, "i"], [33, "9"], [47, "i"], [54, "i"], [66, "i"]].forEach(function (p) {
        setCh(g, p[0], 14, p[1]);
      });
      hline(g, GROUND, "_");
      hud(g, clockStr(4180 + f), "0 - 0", "NEXT GOAL WINS");
      caption(g, "Saturday morning. Scores level. One minute left...");
      snap(g, 450);
    }

    // ===== SCENE 3: the run from midfield =====
    t = 4185;
    for (i = 0; i < 13; i++) {
      px = 2 + i * 2;
      g = sceneGrid(i, false);
      put(g, DX, PT, DEF);
      put(g, KX, PT, KEEP);
      player(g, px, i);
      setCh(g, px + 4 + (i % 2), BALLY - (i % 3 === 0 ? 1 : 0), "o");
      if (i > 1) setCh(g, px - 2, GROUND - 1, "."); // dust
      hud(g, clockStr(t + i), "0 - 0", "NEXT GOAL WINS");
      caption(g, i < 5 ? "Perkins collects it deep in his own half..."
            : i < 9 ? "He's off and running! The crowd rises..."
            : "One defender to beat...");
      snap(g, 110);
    }

    // ===== SCENE 4: the stepover =====
    t += 13;
    g = sceneGrid(1, false);
    put(g, DX, PT, DEF_LUNGE);
    put(g, KX, PT, KEEP);
    player(g, 32, 1);
    setCh(g, 37, BALLY, "o");
    hud(g, clockStr(t), "0 - 0", "NEXT GOAL WINS");
    caption(g, "The last man lunges in...");
    snap(g, 170);

    g = sceneGrid(2, false);
    put(g, DX, PT, DEF_LUNGE);
    put(g, KX, PT, KEEP);
    player(g, 35, 2);
    setCh(g, 41, BALLY - 1, "o");
    hud(g, clockStr(t + 1), "0 - 0", "NEXT GOAL WINS");
    caption(g, "STEPOVER!! Oh, that is outrageous!!");
    snap(g, 190);

    g = sceneGrid(3, false);
    put(g, DX, GROUND - 1, ["_X<"]);
    setCh(g, DX + 3, GROUND - 2, "*"); // dizzy star
    put(g, KX, PT, KEEP);
    player(g, 41, 0);
    setCh(g, 46, BALLY, "o");
    hud(g, clockStr(t + 2), "0 - 0", "NEXT GOAL WINS");
    caption(g, "He's left him for DEAD!");
    snap(g, 170);

    // ===== SCENE 5: surge + wind-up =====
    t += 3;
    for (i = 0; i < 3; i++) {
      px = 43 + i * 2;
      g = sceneGrid(i, false);
      put(g, DX, GROUND - 1, ["_X<"]);
      put(g, KX, PT, KEEP);
      player(g, px, i + 1);
      setCh(g, px + 4 + (i % 2), BALLY - (i % 2 ? 1 : 0), "o");
      hud(g, clockStr(t + i), "0 - 0", "NEXT GOAL WINS");
      caption(g, "Into the box! The keeper narrows the angle...");
      snap(g, 120);
    }
    t += 3;
    for (i = 0; i < 2; i++) {
      g = sceneGrid(3 + i, false);
      put(g, DX, GROUND - 1, ["_X<"]);
      put(g, KX, PT, KEEP);
      put(g, 49, PT, ["\\O ", " 9\\", "/ <"]);
      setCh(g, 54, BALLY, "o");
      hud(g, "69:59", "0 - 0", "NEXT GOAL WINS");
      caption(g, "He shapes to shoot... the whole ground holds its breath...");
      snap(g, i === 0 ? 280 : 180);
    }

    // ===== SCENE 6: close-up cut — the strike =====
    g = blankGrid(); letterbox(g);
    centerText(g, 1, "[ CAMERA 2 : PITCHSIDE ]", true);
    put(g, 10, 7, [
      "      ____________",
      "     /            \\",
      "    /   WILL   9   \\_____",
      "   |                     \\",
      "   |_____________________/",
      "      U    U    U    U"
    ]);
    put(g, 50, 8, [
      "   _____ ",
      "  /  _  \\",
      " |  (_)  |",
      "  \\_____/"
    ]);
    centerText(g, 16, ". . . 6 9 : 5 9 . . .");
    snap(g, 320);

    g = blankGrid(); letterbox(g);
    centerText(g, 1, "[ CAMERA 2 : PITCHSIDE ]", true);
    put(g, 16, 7, [
      "      ____________",
      "     /            \\",
      "    /   WILL   9   \\_____",
      "   |                     \\",
      "   |_____________________/",
      "      U    U    U    U"
    ]);
    put(g, 48, 8, [
      "  \\  |  / ",
      " - _____ -",
      "  / ___ \\ ",
      " ( (___) )",
      "  \\_____/ ",
      " - -   - -"
    ]);
    centerText(g, 16, "T H W A C K !!");
    snap(g, 330, true);

    g = blankGrid(); letterbox(g);
    centerText(g, 1, "[ CAMERA 2 : PITCHSIDE ]", true);
    put(g, 16, 7, [
      "      ____________",
      "     /            \\",
      "    /   WILL   9   \\_____",
      "   |                     \\",
      "   |_____________________/",
      "      U    U    U    U"
    ]);
    textAt(g, 46, 9, "= = = =");
    textAt(g, 56, 8, "= = =");
    textAt(g, 66, 7, "= = o");
    centerText(g, 16, "it's away...");
    snap(g, 240);

    // ===== SCENE 7: ball flight, keeper beaten =====
    var path = [[55, 13], [59, 12], [64, 11], [68, 10], [72, 9]];
    for (f = 0; f < path.length; f++) {
      g = sceneGrid(f, false);
      put(g, DX, GROUND - 1, ["_X<"]);
      put(g, 49, PT, [" O ", TORSO, "/ /"]);
      if (f < 2) put(g, KX, PT, KEEP);
      else put(g, 53, GROUND - 2, KEEP_DIVE);
      for (i = Math.max(0, f - 2); i < f; i++) setCh(g, path[i][0], path[i][1], ".");
      setCh(g, path[f][0], path[f][1], "o");
      hud(g, "70:00", "0 - 0", "...");
      caption(g, f < 2 ? "It's flying..." : "The keeper dives... HE CAN'T REACH IT...");
      snap(g, 75);
    }

    // net ripple
    for (f = 0; f < 2; f++) {
      g = sceneGrid(f, false);
      put(g, DX, GROUND - 1, ["_X<"]);
      put(g, 49, PT, [" O ", TORSO, "/ \\"]);
      put(g, 53, GROUND - 2, KEEP_DIVE);
      setCh(g, 73, 9, "O");
      setCh(g, 72, 9, f === 0 ? "(" : ")");
      setCh(g, 74, 9, f === 0 ? ")" : "(");
      setCh(g, 73, 8, f === 0 ? ")" : "(");
      setCh(g, 73, 10, f === 0 ? "(" : ")");
      hud(g, "70:00", "0 - 0", "...");
      caption(g, "TOP BINS!!!!");
      snap(g, 150, f === 0);
    }

    // ===== SCENE 8: eruption — FIGlet GOAL! =====
    var goalRows = figText("GOAL!");
    for (f = 0; f < 6; f++) {
      g = sceneGrid(f * 2, true);
      put(g, DX, GROUND - 1, ["_X<"]);
      put(g, 53, GROUND - 2, KEEP_DIVE);
      setCh(g, 73, 9, "o");
      confetti(g, f, 3, 56);
      for (i = 0; i < 5; i++) centerText(g, 5 + i, goalRows[i], true);
      put(g, 30, PT - (f % 2), f % 2 === 0 ? CELEB_A : CELEB_B);
      hud(g, "70:00", "1 - 0", "GOAL!! W. PERKINS 70'");
      caption(g, "WILLIAM PERKINNNNS!!! WHAT A HIT, SON, WHAT A HIT!!!");
      snap(g, 240, f % 2 === 0);
    }

    // ===== SCENE 9: instant replay =====
    // wipe in
    g = blankGrid();
    for (var y2 = 0; y2 < H; y2++) for (var x2 = 0; x2 < W; x2 += 2) g[y2][x2] = ">";
    centerText(g, 9, "  INSTANT REPLAY  ", true);
    snap(g, 200);

    for (i = 0; i < 2; i++) {
      g = sceneGrid(0, false);
      textAt(g, 2, 4, "<< REPLAY", true);
      textAt(g, W - 12, 4, "REPLAY >>", true);
      put(g, DX, GROUND - 1, ["_X<"]);
      put(g, KX, PT, KEEP);
      put(g, 49, PT, ["\\O ", " 9\\", "/ <"]);
      setCh(g, 54, BALLY, "o");
      hline(g, 17, "-");
      textAt(g, 0, 18, " REPLAY  *  watch the body shape... textbook. ", true);
      caption(g, "in slow motion now...");
      snap(g, i === 0 ? 420 : 320);
    }

    g = sceneGrid(1, false);
    textAt(g, 2, 4, "<< REPLAY", true);
    textAt(g, W - 12, 4, "REPLAY >>", true);
    put(g, DX, GROUND - 1, ["_X<"]);
    put(g, KX, PT, KEEP);
    put(g, 49, PT, [" O ", TORSO, "/ /"]);
    textAt(g, 53, BALLY, "===o");
    hline(g, 17, "-");
    textAt(g, 0, 18, " REPLAY  *  pure technique from the number 9 ", true);
    caption(g, "...LACES. Never in doubt.");
    snap(g, 400, true);

    for (f = 1; f < path.length; f++) {
      g = sceneGrid(f, false);
      textAt(g, 2, 4, "<< REPLAY", true);
      textAt(g, W - 12, 4, "REPLAY >>", true);
      put(g, DX, GROUND - 1, ["_X<"]);
      put(g, 49, PT, [" O ", TORSO, "/ \\"]);
      if (f < 2) put(g, KX, PT, KEEP);
      else put(g, 53, GROUND - 2, KEEP_DIVE);
      for (i = 0; i < f; i++) setCh(g, path[i][0], path[i][1], ".");
      setCh(g, path[f][0], path[f][1], "o");
      hline(g, 17, "-");
      textAt(g, 0, 18, " REPLAY  *  look where that finishes. unstoppable. ", true);
      caption(g, "frame by frame... top corner all the way...");
      snap(g, 260);
    }

    // wipe out
    g = blankGrid();
    for (var y3 = 0; y3 < H; y3++) for (var x3 = 1; x3 < W; x3 += 2) g[y3][x3] = "<";
    centerText(g, 9, "  BACK TO LIVE  ", true);
    snap(g, 200);

    // ===== SCENE 10: knee slide, mobbed by teammates =====
    for (f = 0; f < 8; f++) {
      px = 26 + f * 2;
      g = sceneGrid(f, true);
      setCh(g, 73, 9, "o");
      put(g, px, PT, KNEE_SLIDE);
      setCh(g, px - 2, GROUND - 1, ".");
      setCh(g, px - 4, GROUND - 1, ".");
      put(g, px - 10, PT, f % 2 ? MATE : MATE2);
      put(g, px - 16, PT, f % 2 ? MATE2 : MATE);
      if (f > 3) put(g, px - 22, PT, f % 2 ? MATE : MATE2);
      confetti(g, f, 3, 56);
      hud(g, "70:0" + Math.min(9, f), "1 - 0", "GOAL!! W. PERKINS 70'");
      caption(g, f < 4 ? "THE KNEE SLIDE!! The whole team is chasing him!!"
                       : "Mobbed by the 9/10C boys!! Scenes!!");
      snap(g, 160);
    }

    // ===== SCENE 11: full time =====
    g = sceneGrid(0, true);
    put(g, 40, PT, CELEB_A);
    put(g, 36, PT, MATE);
    put(g, 44, PT, MATE2);
    confetti(g, 9, 3, 56);
    hud(g, "70:30", "1 - 0", "FULL TIME");
    caption(g, "PHWEEEET! PHWEEEET! That's it! It's all over!");
    snap(g, 900, true);

    g = blankGrid();
    var bw = 54, x0 = Math.floor((W - bw) / 2);
    for (i = 0; i < bw; i++) { g[3][x0 + i] = "#"; g[15][x0 + i] = "#"; }
    for (i = 4; i < 15; i++) { g[i][x0] = "#"; g[i][x0 + bw - 1] = "#"; }
    centerText(g, 5, "F U L L   T I M E");
    centerText(g, 7, "AMBROSE TREACY 9/10C   1  -  0");
    centerText(g, 9, "GOAL:  WILLIAM PERKINS (#9)  70'");
    centerText(g, 11, "ASSIST:  HIMSELF. RAN THE LENGTH.");
    centerText(g, 13, "MAN OF THE MATCH:  W I L L");
    snap(g, 2300);

    // ===== SCENE 12: rolling credits =====
    var credits = [
      "*  GOAL OF THE SEASON  *",
      "",
      "starring",
      "WILLIAM PERKINS  #9",
      "",
      "featuring",
      "AMBROSE TREACY COLLEGE 9/10C",
      "",
      "defenders destroyed ......... 1",
      "keepers beaten .............. 1",
      "top bins .................... CONFIRMED",
      "",
      "a 2026 ATC production"
    ];
    for (f = 0; f < credits.length + 6; f++) {
      g = blankGrid(); letterbox(g);
      for (i = 0; i < credits.length; i++) {
        var y = 16 + i - f;
        if (y >= 2 && y <= 17) centerText(g, y, credits[i]);
      }
      snap(g, 300);
    }

    g = blankGrid(); letterbox(g);
    centerText(g, 8, "T H E   E N D");
    centerText(g, 11, "( . . . or is it? )");
    snap(g, 1300);

    return frames;
  }

  var api = { buildFrames: buildFrames, W: W, H: H };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
    if (typeof require !== "undefined" && require.main === module) {
      process.stdout.write(JSON.stringify(buildFrames()));
    }
  } else {
    root.WillMovie = api;
  }
})(typeof window !== "undefined" ? window : this);
