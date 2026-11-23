/// <reference lib="webworker" />
// ASCII wave renderer. Runs off the main thread (OffscreenCanvas), so drawing never competes with scrolling or Lenis.
const CW = 12, CH = 18, FPS = 20;
const CHARS = ".:-=+*#";

let cv: OffscreenCanvas, c: OffscreenCanvasRenderingContext2D;
let dpr = 1, cols = 0, rows = 0, scrolled = 0, ink: [number, number, number] = [16, 18, 19];
let atlas: OffscreenCanvas[] = [], atlasInk = "", still = false, hidden = false, timer = 0;

function buildAtlas() {
  const [r, g, b] = ink;
  atlas = CHARS.split("").map((ch, i) => {
    const a = new OffscreenCanvas(CW * dpr, CH * dpr);
    const x = a.getContext("2d")!;
    x.scale(dpr, dpr);
    x.font = `${CH - 5}px Consolas, ui-monospace, monospace`;
    x.textBaseline = "top";
    const peak = i === CHARS.length - 1;
    x.fillStyle = peak ? (r < 128 ? "rgba(140,185,20,.55)" : "rgba(201,242,77,.4)") : `rgba(${r},${g},${b},${0.05 + (i + 1) * 0.022})`;
    x.fillText(ch, 1, 1);
    return a;
  });
  atlasInk = ink.join();
}

function resize(w: number, h: number) {
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  cols = Math.ceil(w / CW); rows = Math.ceil(h / CH);
}

function draw(t: number) {
  if (atlasInk !== ink.join()) buildAtlas();
  c.clearRect(0, 0, cv.width, cv.height);
  const sy = scrolled / CH * 0.35; // scroll shifts the wave
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const yy = y + sy;
      const v = (Math.sin(x * 0.14 + t * 0.9) + Math.sin(yy * 0.3 + t * 0.6) + Math.sin((x + yy) * 0.08 - t * 0.7) + 3) / 6;
      const i = Math.floor(v * 8);
      if (i > 0) c.drawImage(atlas[Math.min(7, i) - 1], x * CW * dpr, y * CH * dpr);
    }
  }
}

function start() {
  clearInterval(timer);
  if (still || hidden) return;
  timer = setInterval(() => draw(performance.now() / 1000), 1000 / FPS) as unknown as number;
}

addEventListener("message", (e: MessageEvent) => {
  const m = e.data;
  if (m.type === "init") {
    cv = m.canvas; c = cv.getContext("2d")!; dpr = m.dpr; ink = m.ink; still = m.still;
    resize(m.w, m.h); draw(0); start();
  } else if (m.type === "resize") { resize(m.w, m.h); draw(performance.now() / 1000); }
  else if (m.type === "scroll") { scrolled = m.y; if (still) draw(0); }
  else if (m.type === "ink") { ink = m.ink; if (still) draw(0); }
  else if (m.type === "visible") { hidden = !m.v; start(); }
});
