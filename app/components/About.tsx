"use client";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent } from "motion/react";
import { about } from "../data";
import { usePinned, scrollToProgress, usePinProgress } from "./scroll";
import PixelPhoto from "./PixelPhoto";

const N = about.length;

// Barcode as vector bars (not a CSS gradient), so it stays crisp when the card is tilted.
const BARS: [number, number][] = [[0, 2], [4, 1], [7, 3], [12, 1], [15, 2], [19, 3], [24, 1], [27, 2], [31, 1], [34, 3], [39, 2], [43, 1], [46, 3], [51, 1], [54, 2], [58, 3]];
function Barcode() {
  return (
    <svg className="idcard-code" viewBox="0 0 62 24" width="80" height="31" shapeRendering="geometricPrecision">
      {BARS.map(([x, w]) => <rect key={x} x={x} y="0" width={w} height="24" />)}
    </svg>
  );
}
const WORDS = about.map((b) => b.p.split(" "));

// Pinned: the section holds still while scroll reveals blocks 01 → 04 word by word (and the ID-card photo sharpens), then the page moves on.
// Not pinned (small screens / reduced motion): normal flow, all text shown, photo sharp.
export default function About() {
  const outer = useRef<HTMLElement>(null);
  const pinned = usePinned();
  const scrollYProgress = usePinProgress(outer);
  const [p, setP] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", setP);

  const s = pinned ? p * N : N; // 0 … N, how many blocks are revealed
  const active = Math.min(N - 1, Math.floor(s));
  const amount = Math.min(1, s / 1.2); // sharp once the first block and a bit of the second are read

  return (
    <section ref={outer} id="about" tabIndex={-1} className={`about-pin${pinned ? " is-pinned" : ""}`} style={pinned ? { height: `${N * 75 + 100}vh` } : undefined}>
      <div className="pin-sticky">
        <div className="about wrap">
          <figure className="idcard">
            <span className="idcard-strap" aria-hidden="true" />
            <span className="idcard-hole" aria-hidden="true" />
            <figcaption className="idcard-head mono small"><span>abim.run · developer</span><span>KUALA LUMPUR</span></figcaption>
            <div className="idcard-photo">
              <PixelPhoto amount={amount} alt="Abim with friends at a night event, holding a laptop" />
              <i className="cross tl" /><i className="cross tr" /><i className="cross bl" /><i className="cross br" />
            </div>
            <p className="idcard-name">Abim</p>
            <p className="idcard-role mono">full-stack developer</p>
            <div className="idcard-chips"><span className="chip accent">MSU · KL</span><span className="chip dark">next.js + python</span></div>
            <div className="idcard-bar mono small" aria-hidden="true"><Barcode /><span>UTC+8 · the human behind the commits</span></div>
          </figure>

          <div className="about-body">
            <div className="row mono small"><span>[02] about</span><span>02 / 08</span></div>
            <div className="editor">
              <div className="editor-bar mono small"><i /><i /><i /><span>README.md</span>{pinned && <b>{Math.round(Math.min(1, p) * 100)}%</b>}</div>
              {pinned && <motion.i className="editor-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />}
              <div className="editor-body">
                {about.map((b, i) => {
                  const local = Math.min(1, Math.max(0, s - i));
                  const lit = Math.round(local * WORDS[i].length);
                  return (
                    <div key={b.k} className={`about-block${i === active ? " on" : ""}${local >= 1 ? " done" : ""}`}>
                      <span className="ln mono" aria-hidden="true">{String(i * 3 + 1).padStart(2, "0")}</span>
                      <div>
                        <p className="mono small">
                          <button type="button" className="about-k" tabIndex={pinned ? 0 : -1} onClick={() => outer.current && scrollToProgress(outer.current, (i + 0.98) / N)}>
                            <span aria-hidden="true">## </span>{b.k}
                          </button>
                        </p>
                        <p className="about-p">
                          <span className="sr-only">{b.p}</span>
                          <span aria-hidden="true">{WORDS[i].map((w, j) => <span key={j} className={j < lit ? "w on" : "w"}>{w} </span>)}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {pinned && <p className="pin-hint mono small" aria-hidden="true">{p < 0.98 ? `scroll to read · ${Math.min(N, Math.floor(s) + 1)} / ${N}` : "↓ continue"}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
