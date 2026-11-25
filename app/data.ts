// All copy comes from FigCraft page "C1 — Option C · Prototype + Components".

export const GITHUB = "https://github.com/devilk1d/";
export const LINKEDIN = "https://www.linkedin.com/in/ibnuabimanyu/";
export const EMAIL = "abimanyu123em@gmail.com";

export const about = [
  { k: "01 / WHO", p: "I'm Abim — a full-stack developer working across web, mobile and machine learning. I study at Management and Science University in Kuala Lumpur, and I'm originally from Indonesia.", hl: ["full-stack developer", "web, mobile and machine learning", "Indonesia"] },
  { k: "02 / HOW", p: "I learn by building. Every project starts with a real question and ends with something running: a dashboard, an API, or a model someone can actually use.", hl: ["I learn by building.", "something running"] },
  { k: "03 / RANGE", p: "F1 lap-time prediction, churn analytics, an IoT sensor dashboard and this site. Different problems, same habit — make it work, then make it clear.", hl: ["F1 lap-time prediction", "churn analytics", "IoT sensor dashboard", "make it work, then make it clear"] },
  { k: "04 / STACK", p: "Mostly TypeScript, Next.js and React on the web, Python for data and ML, and SQL underneath everything. I care about clean interfaces and code that holds up.", hl: ["TypeScript, Next.js and React", "Python", "SQL", "clean interfaces"] },
];

export type TimelineItem = {
  label: string;
  num: string;
  title: string;
  desc: string;
  tags: string[];
  is_branch?: boolean;
};

export const timeline: TimelineItem[] = [
  { label: "NOW", num: "chapter 04", title: "Student at Management and Science University", desc: "Kuala Lumpur, Malaysia — open to internships and collaborations.", tags: ["web", "ml", "mobile"], is_branch: false },
  { label: "THESIS", num: "chapter 03", title: "Formula 1 lap-time prediction with LSTM & GRU", desc: "Turned into Next Lap, a live dashboard at nextlap.live.", tags: ["python", "next.js", "lstm/gru"], is_branch: true },
  { label: "RESEARCH", num: "chapter 02", title: "ARKA — customer churn prediction", desc: "Stacking ensemble, SHAP explanations and NLP, written up as a paper.", tags: ["lightgbm", "shap", "nlp"], is_branch: true },
  { label: "BUILD", num: "chapter 01", title: "IoT monitoring system — final project", desc: "Sensors to backend to a live web dashboard, end to end.", tags: ["hardware", "firmware", "web"], is_branch: false },
];

export const stack = [
  { k: "01 — WEB", items: ["HTML & CSS", "TypeScript", "JavaScript", "React", "Next.js", "Tailwind CSS"], cap: "where it renders" },
  { k: "02 — BACKEND & DATABASE", items: ["PHP", "Laravel", "Node.js", "MySQL", "PostgreSQL", "Supabase"], cap: "where it lives" },
  { k: "03 — DATA & MACHINE LEARNING", items: ["Python", "pandas", "NumPy", "scikit-learn", "LightGBM", "Optuna", "SHAP", "LSTM / GRU", "K-Means", "NLP"], cap: "where it learns" },
  { k: "04 — MOBILE", items: ["Flutter", "Dart"], cap: "where it fits in a pocket" },
  { k: "05 — LANGUAGES & TOOLS", items: ["Java", "C", "C++", "Git & GitHub", "Vercel", "Figma"], cap: "how it ships" },
];

export const stackMarquee = ["TYPESCRIPT", "NEXT.JS", "REACT", "PYTHON", "SQL", "POSTGRESQL", "SUPABASE", "NODE.JS", "SCIKIT-LEARN", "LIGHTGBM"];
export const outputsMarquee = ["Web apps", "APIs", "Dashboards", "ML models", "Data pipelines", "Mobile apps", "IoT systems"];
export const availableMarquee = ["OPEN TO INTERNSHIPS", "OPEN TO COLLABORATIONS", "OPEN TO REMOTE WORK", "AVAILABLE FOR FREELANCE"];

export const principles = [
  { title: "It runs, or it isn't done.", body: "Every project ends with something deployed and usable — not a prototype that stalls in a folder." },
  { title: "Full stack, one standard.", body: "Database, API and interface built by the same hands, so the seams between them don't show." },
  { title: "Explainable by default.", body: "From SHAP values to commit messages, I make the reasoning visible so others can trust it and build on it." },
  { title: "Built for real users.", body: "Dashboards, models and tools designed around the person who has to use them every day." },
];

export type Project = {
  slug: string; title: string; label: string; tagline: string; desc: string;
  role: string; type: string; stack: string; fig: string;
  context: string; built: string;
  live?: string; // only set where a live site exists
  github?: string; // project-specific repository URL
  is_private?: boolean; // true for private/internal systems with no public links
  shots?: { src: string; alt: string }[]; // up to three app screenshots, fanned in the card (placeholder figure otherwise)
  accent?: string; // background of the screenshot area
};

export const projects: Project[] = [
  {
    slug: "nextlap", live: "https://nextlap.live", accent: "#F2701C",
    title: "Next Lap", label: "WEB · THESIS", fig: "fig.01 — next lap",
    tagline: "F1 lap times, predicted and visualised.",
    desc: "Pick a race and driver, see predicted vs actual lap times, and compare how the LSTM and GRU models behave across a stint.",
    role: "full-stack, solo", type: "web app · thesis", stack: "next.js · python · lstm/gru",
    context: "Started as my undergraduate thesis: “Formula 1 Driver Lap Time Prediction Using LSTM and GRU”. The question was simple — can a sequence model predict the next lap before it happens?",
    built: "A web dashboard that lets you pick a race and driver, see predicted vs actual lap times, and compare how the LSTM and GRU models behave across a stint, including pit stops.",
  },
  {
    slug: "arka", title: "ARKA", label: "DATA · RESEARCH", fig: "fig.02 — arka",
    tagline: "Who's about to leave, and why.",
    desc: "A churn pipeline with a LightGBM stacking ensemble, SHAP explanations per customer and NLP on feedback, written up as a paper.",
    role: "pipeline, models, paper", type: "data · ml · paper", stack: "python · lightgbm · shap · nlp",
    context: "Subscription businesses lose customers quietly. The goal: flag who is likely to churn early enough to do something about it — and explain why.",
    built: "A churn pipeline with a LightGBM stacking ensemble tuned by Optuna, NLP on customer feedback, SHAP explanations per customer, K-Means segments and an LLM layer that drafts retention actions. Written up as an academic paper.",
  },
  {
    slug: "apex", title: "APEX", label: "RESEARCH · TOOL", fig: "fig.03 — apex",
    tagline: "The fastest way around a corner.",
    desc: "Takes track geometry and computes an optimised racing line: where to turn in, where to clip the apex, where to run wide.",
    role: "research, implementation", type: "research · tool", stack: "python · numpy · optimisation",
    context: "In racing, the line you take matters as much as the car. Given a track’s shape, what is the fastest path through it?",
    built: "A tool that takes track geometry and computes an optimised racing line — where to turn in, where to clip the apex, where to run wide on exit — and plots it over the circuit.",
  },
  {
    slug: "iot", title: "IoT Monitor", label: "HARDWARE · FINAL PROJECT", fig: "fig.04 — iot monitor",
    tagline: "Sensors in, dashboard out.",
    desc: "A microcontroller reads sensor values and streams them through a backend to a live web dashboard with history.",
    role: "hardware, firmware, web", type: "hardware · final project", stack: "microcontroller · sensors · web",
    context: "My final project: physical sensors are only useful if someone can see what they’re saying, in real time, from anywhere.",
    built: "A microcontroller reads sensor values and sends them to a backend, which streams them to a live web dashboard with current readings and history.",
  },
  {
    slug: "dm", title: "Data Mining", label: "DATA · COURSEWORK", fig: "fig.05 — data mining",
    tagline: "Patterns hiding in plain tables.",
    desc: "Case studies covering cleaning, exploratory analysis, clustering and classification, each written up with the reasoning.",
    role: "analysis, write-ups", type: "data · coursework", stack: "python · pandas · scikit-learn",
    context: "Coursework that went a bit further than required: real datasets, messy columns, and the question of what they actually say.",
    built: "A set of case studies covering cleaning, exploratory analysis, clustering and classification — each written up with the reasoning, not just the code.",
  },
  {
    slug: "site", title: "abim.run", label: "WEB · PERSONAL", fig: "fig.06 — abim.run",
    tagline: "The site you're scrolling right now.",
    desc: "Designed in FigCraft, built with Next.js and TypeScript, with smooth scroll, motion and an admin dashboard planned.",
    role: "design + development", type: "web · portfolio", stack: "next.js · typescript · gsap · lenis",
    context: "I wanted a portfolio that reads like a developer made it — no templates, motion that means something.",
    built: "Designed in FigCraft, built with Next.js and TypeScript. Smooth scroll with Lenis, transitions with GSAP, content from Supabase with an admin dashboard planned.",
  },
];

export const process = [
  { title: "Requirements", desc: "Understand the real problem and who it's for. Questions first, code later.", deliv: "brief · user stories" },
  { title: "Plan", desc: "Data model, API shape and scope, written down before anything gets built.", deliv: "schema · roadmap" },
  { title: "Design", desc: "Wireframes and UI in FigCraft, so we agree on what we're making before it's made.", deliv: "wireframes · ui kit" },
  { title: "Build", desc: "Typed, tested and reviewed, shipped in small increments you can actually click.", deliv: "repo · previews" },
  { title: "Ship & measure", desc: "Deploy, watch it in real use, and fix what real users run into.", deliv: "deploy · monitoring" },
];

// PLACEHOLDERS: replace with your real certificates (title, issuer, year, credential id, verify link).
// img: optional picture of the certificate (landscape works best), e.g. "/certs/python.webp" from public/certs. Without it the card draws a blank certificate.
export type Certificate = {
  title: string;
  issuer: string;
  year: string;
  id: string;
  url: string;
  img?: string;
  valid_until?: string | null;
  is_lifetime?: boolean;
};
export const certificates: Certificate[] = [
  { title: "Certificate title", issuer: "Issuing organisation", year: "2026", id: "CREDENTIAL-ID-0001", url: "#" },
  { title: "Certificate title", issuer: "Issuing organisation", year: "2025", id: "CREDENTIAL-ID-0002", url: "#" },
  { title: "Certificate title", issuer: "Issuing organisation", year: "2025", id: "CREDENTIAL-ID-0003", url: "#" },
];
