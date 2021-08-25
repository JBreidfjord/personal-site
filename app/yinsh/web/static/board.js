const canvas = document.getElementById("canvas");
const w = canvas.width;
const h = canvas.height;
const size = 0.06 * w; // ((w * 0.9) / 10) * (2 / 3)

class Hex {
  constructor(q, r, s = -q - r) {
    this.q = q;
    this.r = r;
    this.s = s;
  }
}

function draw() {
  document.getElementById("select-container").style.display = "none";
  document.getElementById("canvas-container").style.display = "block";
  if (canvas.getContext) {
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";

    ctx.beginPath();
    // Vertical
    ctx.moveTo(...get_coord(-5, 7));
    ctx.lineTo(...get_coord(-5, 13));
    ctx.moveTo(...get_coord(-4, 4));
    ctx.lineTo(...get_coord(-4, 16));
    ctx.moveTo(...get_coord(-3, 3));
    ctx.lineTo(...get_coord(-3, 17));
    ctx.moveTo(...get_coord(-2, 2));
    ctx.lineTo(...get_coord(-2, 18));
    ctx.moveTo(...get_coord(-1, 1));
    ctx.lineTo(...get_coord(-1, 19));
    ctx.moveTo(...get_coord(0, 2));
    ctx.lineTo(...get_coord(0, 18));
    ctx.moveTo(...get_coord(1, 1));
    ctx.lineTo(...get_coord(1, 19));
    ctx.moveTo(...get_coord(2, 2));
    ctx.lineTo(...get_coord(2, 18));
    ctx.moveTo(...get_coord(3, 3));
    ctx.lineTo(...get_coord(3, 17));
    ctx.moveTo(...get_coord(4, 4));
    ctx.lineTo(...get_coord(4, 16));
    ctx.moveTo(...get_coord(5, 7));
    ctx.lineTo(...get_coord(5, 13));
    // SE
    ctx.moveTo(...get_coord(1, 1));
    ctx.lineTo(...get_coord(4, 4));
    ctx.moveTo(...get_coord(-1, 1));
    ctx.lineTo(...get_coord(5, 7));
    ctx.moveTo(...get_coord(-2, 2));
    ctx.lineTo(...get_coord(5, 9));
    ctx.moveTo(...get_coord(-3, 3));
    ctx.lineTo(...get_coord(5, 11));
    ctx.moveTo(...get_coord(-4, 4));
    ctx.lineTo(...get_coord(5, 13));
    ctx.moveTo(...get_coord(-4, 6));
    ctx.lineTo(...get_coord(4, 14));
    ctx.moveTo(...get_coord(-5, 7));
    ctx.lineTo(...get_coord(4, 16));
    ctx.moveTo(...get_coord(-5, 9));
    ctx.lineTo(...get_coord(3, 17));
    ctx.moveTo(...get_coord(-5, 11));
    ctx.lineTo(...get_coord(2, 18));
    ctx.moveTo(...get_coord(-5, 13));
    ctx.lineTo(...get_coord(1, 19));
    ctx.moveTo(...get_coord(-4, 16));
    ctx.lineTo(...get_coord(-1, 19));
    // SW
    ctx.moveTo(...get_coord(-1, 1));
    ctx.lineTo(...get_coord(-4, 4));
    ctx.moveTo(...get_coord(1, 1));
    ctx.lineTo(...get_coord(-5, 7));
    ctx.moveTo(...get_coord(2, 2));
    ctx.lineTo(...get_coord(-5, 9));
    ctx.moveTo(...get_coord(3, 3));
    ctx.lineTo(...get_coord(-5, 11));
    ctx.moveTo(...get_coord(4, 4));
    ctx.lineTo(...get_coord(-5, 13));
    ctx.moveTo(...get_coord(4, 6));
    ctx.lineTo(...get_coord(-4, 14));
    ctx.moveTo(...get_coord(5, 7));
    ctx.lineTo(...get_coord(-4, 16));
    ctx.moveTo(...get_coord(5, 9));
    ctx.lineTo(...get_coord(-3, 17));
    ctx.moveTo(...get_coord(5, 11));
    ctx.lineTo(...get_coord(-2, 18));
    ctx.moveTo(...get_coord(5, 13));
    ctx.lineTo(...get_coord(-1, 19));
    ctx.moveTo(...get_coord(4, 16));
    ctx.lineTo(...get_coord(1, 19));
    ctx.stroke();

    drawCapturedRings();
  } else {
    document.getElementById("canvas-container").innerText =
      "Browser unsupported";
  }
}

function drawCapturedRings() {
  let ctx = canvas.getContext("2d");
  ctx.strokeStyle = "black";
  if (state) {
    if (state.color == "w") {
      ctx.fillStyle = "white";
      for (let i = 0; i < state.rings.white; i++) {
        let x = w * 0.05 + size * 0.75 * i;
        let y = h * 0.95;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
        ctx.moveTo(x + size * 0.6, y);
        ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
        ctx.fill("evenodd");
        ctx.stroke();
      }
      ctx.fillStyle = "black";
      for (let i = 0; i < state.rings.black; i++) {
        let x = w * 0.95 - size * 0.75 * i;
        let y = h * 0.05;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
        ctx.moveTo(x + size * 0.6, y);
        ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
        ctx.fill("evenodd");
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = "black";
      for (let i = 0; i < state.rings.black; i++) {
        let x = w * 0.05 + size * 0.75 * i;
        let y = h * 0.95;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
        ctx.moveTo(x + size * 0.6, y);
        ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
        ctx.fill("evenodd");
        ctx.stroke();
      }
      ctx.fillStyle = "white";
      for (let i = 0; i < state.rings.white; i++) {
        let x = w * 0.95 - size * 0.75 * i;
        let y = h * 0.05;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
        ctx.moveTo(x + size * 0.6, y);
        ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
        ctx.fill("evenodd");
        ctx.stroke();
      }
    }
  }
}

function drawRing(hex, color, transparency = null) {
  let ctx = canvas.getContext("2d");
  let pos = hex_to_pixel(hex);
  if (color) {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    if (transparency) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    }
  } else {
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    if (transparency) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    }
  }
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, size * 0.75, 0, Math.PI * 2);
  ctx.moveTo(pos.x + size * 0.6, pos.y);
  ctx.arc(pos.x, pos.y, size * 0.6, 0, Math.PI * 2);
  ctx.fill("evenodd");
  ctx.stroke();
}

function drawMarker(hex, color) {
  let ctx = canvas.getContext("2d");
  let pos = hex_to_pixel(hex);
  ctx.beginPath();
  if (color) {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
  } else {
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
  }
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, size * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function highlightMarkers(row, color) {
  let ctx = canvas.getContext("2d");
  row.forEach((hex) => {
    let pos = hex_to_pixel(hex);
    ctx.beginPath();
    if (color) {
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
    } else {
      ctx.fillStyle = "black";
      ctx.strokeStyle = "black";
    }
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

function highlightRings(hex, color) {
  let ctx = canvas.getContext("2d");
  let pos = hex_to_pixel(hex);
  if (color) {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
  } else {
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
  }
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, size * 0.85, 0, Math.PI * 2);
  ctx.moveTo(pos.x + size * 0.6, pos.y);
  ctx.arc(pos.x, pos.y, size * 0.6, 0, Math.PI * 2);
  ctx.fill("evenodd");
  ctx.stroke();
}

function get_coord(col, row) {
  let tw = (col + 5) / 10;
  let th = (row - 1) / 18;

  return [lerp(w * 0.05, w * 0.95, tw), lerp(h * 0.05, h * 0.95, th)];
}

function lerp(a, b, t) {
  return (a + (b - a) * t).toFixed(7);
}

function hex_round(hex) {
  let rq = Math.round(hex.q);
  let rr = Math.round(hex.r);
  let rs = Math.round(hex.s);

  let q_diff = Math.abs(rq - hex.q);
  let r_diff = Math.abs(rr - hex.r);
  let s_diff = Math.abs(rs - hex.s);

  if (q_diff > r_diff && q_diff > s_diff) {
    rq = -rr - rs;
  } else if (r_diff > s_diff) {
    rr = -rq - rs;
  } else {
    rs = -rq - rr;
  }

  return new Hex(rq, rr, rs);
}

function pixel_to_hex(x, y) {
  x = w / 2 - x;
  y = h / 2 - y;
  let q = ((2 / 3) * x) / size;
  let r = ((-1 / 3) * x + (Math.sqrt(3) / 3) * y) / size;
  return hex_round(new Hex(q, r));
}

function hex_to_pixel(hex) {
  let x = size * ((3 / 2) * hex.q);
  let y = size * ((Math.sqrt(3) / 2) * hex.q + Math.sqrt(3) * hex.r);
  x = w / 2 + x;
  y = h / 2 + y;
  return { x, y };
}

function getPosition(e) {
  let rect = e.target.getBoundingClientRect();
  let x = w - (e.clientX - rect.left); // Flip x coordinate by subtracting from width
  let y = h - (e.clientY - rect.top); // Flip y coordinate by subtracting from height
  return { x, y };
}

let gridIndex = {
  0: new Hex(0, 0),
  1: new Hex(-5, 1),
  2: new Hex(-5, 2),
  3: new Hex(-5, 3),
  4: new Hex(-5, 4),
  5: new Hex(-4, -1),
  6: new Hex(-4, 0),
  7: new Hex(-4, 1),
  8: new Hex(-4, 2),
  9: new Hex(-4, 3),
  10: new Hex(-4, 4),
  11: new Hex(-4, 5),
  12: new Hex(-3, -2),
  13: new Hex(-3, -1),
  14: new Hex(-3, 0),
  15: new Hex(-3, 1),
  16: new Hex(-3, 2),
  17: new Hex(-3, 3),
  18: new Hex(-3, 4),
  19: new Hex(-3, 5),
  20: new Hex(-2, -3),
  21: new Hex(-2, -2),
  22: new Hex(-2, -1),
  23: new Hex(-2, 0),
  24: new Hex(-2, 1),
  25: new Hex(-2, 2),
  26: new Hex(-2, 3),
  27: new Hex(-2, 4),
  28: new Hex(-2, 5),
  29: new Hex(-1, -4),
  30: new Hex(-1, -3),
  31: new Hex(-1, -2),
  32: new Hex(-1, -1),
  33: new Hex(-1, 0),
  34: new Hex(-1, 1),
  35: new Hex(-1, 2),
  36: new Hex(-1, 3),
  37: new Hex(-1, 4),
  38: new Hex(-1, 5),
  39: new Hex(0, -4),
  40: new Hex(0, -3),
  41: new Hex(0, -2),
  42: new Hex(0, -1),
  43: new Hex(0, 1),
  44: new Hex(0, 2),
  45: new Hex(0, 3),
  46: new Hex(0, 4),
  47: new Hex(1, -5),
  48: new Hex(1, -4),
  49: new Hex(1, -3),
  50: new Hex(1, -2),
  51: new Hex(1, -1),
  52: new Hex(1, 0),
  53: new Hex(1, 1),
  54: new Hex(1, 2),
  55: new Hex(1, 3),
  56: new Hex(1, 4),
  57: new Hex(2, -5),
  58: new Hex(2, -4),
  59: new Hex(2, -3),
  60: new Hex(2, -2),
  61: new Hex(2, -1),
  62: new Hex(2, 0),
  63: new Hex(2, 1),
  64: new Hex(2, 2),
  65: new Hex(2, 3),
  66: new Hex(3, -5),
  67: new Hex(3, -4),
  68: new Hex(3, -3),
  69: new Hex(3, -2),
  70: new Hex(3, -1),
  71: new Hex(3, 0),
  72: new Hex(3, 1),
  73: new Hex(3, 2),
  74: new Hex(4, -5),
  75: new Hex(4, -4),
  76: new Hex(4, -3),
  77: new Hex(4, -2),
  78: new Hex(4, -1),
  79: new Hex(4, 0),
  80: new Hex(4, 1),
  81: new Hex(5, -4),
  82: new Hex(5, -3),
  83: new Hex(5, -2),
  84: new Hex(5, -1),
};
let invGridIndex = Object.values(gridIndex);
