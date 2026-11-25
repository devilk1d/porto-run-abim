import { unstable_cache } from "next/cache";
import { createPublicClient } from "./public";
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

export type AboutProfile = {
  photoUrl: string | null;
  photoAlt: string;
};

const fetchProjectsCached = unstable_cache(
  async (): Promise<Project[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*, project_shots(*)")
      .eq("status", "published")
      .eq("is_hidden", false)
      .order("order_index", { ascending: true });

    if (error || !data) throw error || new Error("Failed to fetch projects");

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
  },
  ["public-projects"],
  { revalidate: 3600, tags: ["portfolio-data"] }
);

export async function getProjects(): Promise<Project[]> {
  try {
    return await fetchProjectsCached();
  } catch {
    return defaultProjects;
  }
}

const fetchProjectTypesCached = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("project_types")
      .select("name")
      .order("name", { ascending: true });

    if (error || !data) throw error || new Error("Failed to fetch project types");
    return data.map((t) => t.name.trim().toLowerCase()).filter(Boolean);
  },
  ["public-project-types"],
  { revalidate: 3600, tags: ["portfolio-data"] }
);

export async function getProjectTypes(): Promise<string[]> {
  try {
    return await fetchProjectTypesCached();
  } catch {
    return [];
  }
}

const fetchCertificatesCached = unstable_cache(
  async (): Promise<Certificate[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("status", "published")
      .eq("is_hidden", false)
      .order("order_index", { ascending: true });

    if (error || !data) throw error || new Error("Failed to fetch certificates");

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
  },
  ["public-certificates"],
  { revalidate: 3600, tags: ["portfolio-data"] }
);

export async function getCertificates(): Promise<Certificate[]> {
  try {
    return await fetchCertificatesCached();
  } catch {
    return defaultCertificates;
  }
}

const fetchExperiencesCached = unstable_cache(
  async (): Promise<TimelineItem[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("status", "published")
      .eq("is_hidden", false)
      .order("order_index", { ascending: true });

    if (error || !data) throw error || new Error("Failed to fetch experiences");

    return data.map((e) => ({
      label: e.label,
      num: e.chapter_num,
      title: e.title,
      desc: e.description,
      tags: e.tags,
      is_branch: e.is_branch,
    }));
  },
  ["public-experiences"],
  { revalidate: 3600, tags: ["portfolio-data"] }
);

export async function getExperiences(): Promise<TimelineItem[]> {
  try {
    return await fetchExperiencesCached();
  } catch {
    return defaultTimeline;
  }
}

const fetchAboutChaptersCached = unstable_cache(
  async (): Promise<AboutChapter[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("about_chapters")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) throw error || new Error("Failed to fetch about chapters");

    return data.map((a) => ({
      k: a.chapter_key,
      p: a.paragraph,
      hl: a.highlights,
    }));
  },
  ["public-about-chapters"],
  { revalidate: 3600, tags: ["portfolio-data"] }
);

export async function getAboutChapters(): Promise<AboutChapter[]> {
  try {
    return await fetchAboutChaptersCached();
  } catch {
    return defaultAbout;
  }
}

const fetchAboutProfileCached = unstable_cache(
  async (): Promise<AboutProfile> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("about_profile")
      .select("photo_url, photo_alt")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { photoUrl: null, photoAlt: "Abim portrait" };

    return {
      photoUrl: data.photo_url || null,
      photoAlt: data.photo_alt || "Abim portrait",
    };
  },
  ["public-about-profile"],
  { revalidate: 3600, tags: ["portfolio-data"] }
);

export async function getAboutProfile(): Promise<AboutProfile> {
  try {
    return await fetchAboutProfileCached();
  } catch {
    return { photoUrl: null, photoAlt: "Abim portrait" };
  }
}
