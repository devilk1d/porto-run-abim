import { createClient } from "./server";
import {
  projects as defaultProjects,
  certificates as defaultCertificates,
  timeline as defaultTimeline,
  about as defaultAbout,
  type Project,
  type Certificate,
} from "../../app/data";

export type AboutChapter = {
  k: string;
  p: string;
  hl: string[];
};

export type TimelineItem = {
  label: string;
  num: string;
  title: string;
  desc: string;
  tags: string[];
  is_branch?: boolean;
};

export async function getProjects(): Promise<Project[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*, project_shots(*)")
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) return defaultProjects;

    return data.map((p) => ({
      slug: p.slug,
      title: p.title,
      label: p.label,
      tagline: p.tagline,
      desc: p.desc,
      role: p.role,
      type: p.type,
      stack: p.stack,
      fig: p.fig || `fig.01 — ${p.slug}`,
      context: p.context,
      built: p.built,
      live: p.live_url || undefined,
      accent: p.accent_color || undefined,
      shots:
        p.project_shots && p.project_shots.length > 0
          ? p.project_shots
              .sort((a, b) => a.order_index - b.order_index)
              .map((s) => ({ src: s.src, alt: s.alt }))
          : undefined,
    }));
  } catch {
    return defaultProjects;
  }
}

export async function getCertificates(): Promise<Certificate[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) return defaultCertificates;

    return data.map((c) => ({
      title: c.title,
      issuer: c.issuer,
      year: c.year,
      id: c.credential_id,
      url: c.credential_url,
      img: c.image_url || undefined,
      valid_until: c.valid_until,
      is_lifetime: c.is_lifetime,
    }));
  } catch {
    return defaultCertificates;
  }
}

export async function getExperiences(): Promise<TimelineItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) return defaultTimeline;

    return data.map((e) => ({
      label: e.label,
      num: e.chapter_num,
      title: e.title,
      desc: e.description,
      tags: e.tags,
      is_branch: e.is_branch,
    }));
  } catch {
    return defaultTimeline;
  }
}

export async function getAboutChapters(): Promise<AboutChapter[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("about_chapters")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) return defaultAbout;

    return data.map((a) => ({
      k: a.chapter_key,
      p: a.paragraph,
      hl: a.highlights,
    }));
  } catch {
    return defaultAbout;
  }
}
