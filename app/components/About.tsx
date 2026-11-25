"use client";
import { memo, useRef, useState } from "react";
import { m, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { about } from "../data";
import PixelPhoto from "./PixelPhoto";

// Barcode as vector bars (not a CSS gradient), so it stays crisp when the card is tilted.
const BARS: [number, number][] = [[0, 2], [4, 1], [7, 3], [12, 1], [15, 2], [19, 3], [24, 1], [27, 2], [31, 1], [34, 3], [39, 2], [43, 1], [46, 3], [51, 1], [54, 2], [58, 3]];
function Barcode() {
  return (
    <svg className="idcard-code" viewBox="0 0 62 24" width="80" height="31" shapeRendering="geometricPrecision">
      {BARS.map(([x, w]) => <rect key={x} x={x} y="0" width={w} height="24" />)}
    </svg>
  );
}
// Words that belong to a highlighted phrase (marker pen), matched ignoring trailing punctuation.
const bare = (w: string) => w.replace(/[,.:]+$/, "");

type AboutItem = { k: string; p: string; hl: string[] };

// One chapter: its words light up as the paragraph scrolls from the lower part of the screen to the middle.
const Chapter = memo(function Chapter({ item, words, hlFlags }: { item: AboutItem; words: string[]; hlFlags: boolean[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 68%"] });
  const [lit, setLit] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.round(Math.min(1, Math.max(0, v)) * words.length);
    setLit((prev) => (prev === next ? prev : next));
  });
  const n = reduce ? words.length : lit;
  return (
    <div className="chap-item">
      <p className={`mono small chap-k${n > 0 ? " on" : ""}`} aria-hidden="true">## {item.k}</p>
      <div ref={ref} className="about-p">
        <span className="sr-only">{item.p}</span>
        <span aria-hidden="true">{words.map((w, j) => <span key={j} className={`w${j < n ? " on" : ""}${hlFlags[j] ? " hl" : ""}`}>{w} </span>)}</span>
      </div>
    </div>
  );
});

// Normal page flow: the ID card stays put (sticky) while the four chapters scroll past on the right, each one reading itself in
// as it crosses the screen. The photo sharpens as the section comes into view.
export default function About({
  items = about,
  photoUrl = null,
  photoAlt = "Abim portrait",
}: {
  items?: AboutItem[];
  photoUrl?: string | null;
  photoAlt?: string;
}) {
  const outer = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [amount, setAmount] = useState(0);
  const { scrollYProgress: arrive } = useScroll({ target: outer, offset: ["start 70%", "start 15%"] });
  useMotionValueEvent(arrive, "change", (v) => {
    const next = Math.round(Math.min(1, Math.max(0, v)) * 20) / 20;
    setAmount((prev) => (prev === next ? prev : next));
  });
  const { scrollYProgress: read } = useScroll({ target: body, offset: ["start 60%", "end 60%"] });

  const list = items && items.length > 0 ? items : about;
  const wordsList = list.map((b) => b.p.split(" "));
  const hlList = list.map((b, i) => {
    const flags = wordsList[i].map(() => false);
    b.hl.forEach((ph) => {
      const pw = ph.split(" ").map(bare);
      const at = wordsList[i].findIndex((_, j) => pw.every((w, k) => bare(wordsList[i][j + k] ?? "") === w));
      if (at >= 0) pw.forEach((_, k) => (flags[at + k] = true));
    });
    return flags;
  });

  return (
    <section ref={outer} id="about" tabIndex={-1} className="about-pin">
      <div className="about wrap">
        <figure className="idcard">
          <span className="idcard-strap" aria-hidden="true" />
          <span className="idcard-hole" aria-hidden="true" />
          <figcaption className="idcard-head mono small"><span>abim.run · developer</span><span>MY / ID</span></figcaption>
          <div className="idcard-photo">
            <PixelPhoto src={photoUrl} amount={amount} alt={photoAlt} />
            <i className="cross tl" /><i className="cross tr" /><i className="cross bl" /><i className="cross br" />
          </div>
          <p className="idcard-name">Abim</p>
          <p className="idcard-role mono">full-stack developer</p>
          <div className="idcard-chips"><span className="chip accent">MSU · PNJ</span><span className="chip dark">next.js + python</span></div>
          <div className="idcard-bar mono small" aria-hidden="true"><Barcode /><span>UTC+8 · the human behind the commits</span></div>
        </figure>

        <div ref={body} className="about-body chap">
          <div className="row mono small"><span>[02] about</span><span>02 / 08</span></div>
          <span className="chap-rail" aria-hidden="true"><m.i style={{ scaleY: read }} /></span>
          {list.map((b, i) => <Chapter key={b.k} item={b} words={wordsList[i]} hlFlags={hlList[i]} />)}
        </div>
      </div>
    </section>
  );
}
