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
      .eq("status", "published")
      .eq("is_hidden", false)
      .order("order_index", { ascending: true });

    if (error || !data) return defaultProjects;

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
      live: p.is_private ? undefined : (p.live_url || undefined),
      github: p.is_private ? undefined : (p.github_url || undefined),
      is_private: p.is_private ?? false,
      accent: p.accent_color || undefined,
      shots:
        p.project_shots && p.project_shots.length > 0
          ? p.project_shots
              .sort((a, b) => a.order_index - b.order_index)
              .map((s) => ({ src: s.src, alt: s.alt }))
          : p.image_url
          ? [{ src: p.image_url, alt: p.title }]
          : undefined,
    }));
  } catch {
    return defaultProjects;
  }
}

export async function getProjectTypes(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("project_types")
      .select("name")
      .order("name", { ascending: true });

    if (error || !data) return [];
    return data.map((t) => t.name.trim().toLowerCase()).filter(Boolean);
  } catch {
    return [];
  }
}

export async function getCertificates(): Promise<Certificate[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("status", "published")
      .eq("is_hidden", false)
      .order("order_index", { ascending: true });

    if (error || !data) return defaultCertificates;

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
      .eq("status", "published")
      .eq("is_hidden", false)
      .order("order_index", { ascending: true });

    if (error || !data) return defaultTimeline;

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

export type AboutProfile = {
  photoUrl: string | null;
  photoAlt: string;
};

export async function getAboutProfile(): Promise<AboutProfile> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("about_profile")
      .select("photo_url, photo_alt")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { photoUrl: null, photoAlt: "Abim portrait" };
    }

    return {
      photoUrl: data.photo_url || null,
      photoAlt: data.photo_alt || "Abim portrait",
    };
  } catch {
    return { photoUrl: null, photoAlt: "Abim portrait" };
  }
}
