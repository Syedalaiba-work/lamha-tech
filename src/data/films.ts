/**
 * Studio films: original loops rendered in-house from the brand's sculptural modules
 * (art/blender/lamha_films.py → art/encode_films.py → public/media/films).
 *
 * These are LAMHA's own visual studies. They are never presented as client work.
 */
export type FilmId = "assembly" | "engineering" | "experience" | "growth" | "rnd" | "team";

export type Film = {
  id: FilmId;
  title: string;
  /** One line: what the film shows. */
  caption: string;
  /** What the study explores and how it relates to LAMHA's work. */
  idea: string;
  /** The capability it illustrates (a real service family or page). */
  relatesTo: { label: string; href: string };
  technique: string[];
  seconds: number;
  width: number;
  height: number;
  /** Background colour of the film's studio, so frames and pages can blend into it. */
  tone: string;
  dark: boolean;
};

export const films: Record<FilmId, Film> = {
  assembly: {
    id: "assembly",
    title: "Systems in motion",
    caption: "Thirty-six modules leave a scattered field, lock into one interlocked system, carry data through it and let go again.",
    idea: "The company in ten seconds: a field of disconnected parts (the problem) becomes a structure that works (the system), and the structure is what moves information.",
    relatesTo: { label: "How we work", href: "/about" },
    technique: ["Blender", "Cycles path tracing", "Procedural choreography"],
    seconds: 10,
    width: 1600,
    height: 900,
    tone: "#0d1f45",
    dark: true,
  },
  engineering: {
    id: "engineering",
    title: "Lattice sort",
    caption: "A wall of interlocking modules re-sorts itself, neighbours passing over and under each other, while data nodes run along the rows.",
    idea: "An odd–even transposition network made physical: every swap is local and simple, yet the whole system reorganises without stopping. That is how we approach re-architecting live software.",
    relatesTo: { label: "Technology Engineering", href: "/services#technology-engineering" },
    technique: ["Blender", "Sorting network", "Seamless loop"],
    seconds: 8,
    width: 1280,
    height: 720,
    tone: "#eef2f8",
    dark: false,
  },
  experience: {
    id: "experience",
    title: "Glass over form",
    caption: "Velvet, ceramic and enamel modules turn behind a pane of glass that bends their silhouettes as they pass.",
    idea: "Interface over system: what people touch is a clear surface, and what they feel is the structure behind it. Material, refraction and timing are design decisions.",
    relatesTo: { label: "Digital Experience", href: "/services#digital-experience" },
    technique: ["Blender", "Refraction", "Material study"],
    seconds: 8,
    width: 1280,
    height: 720,
    tone: "#e4ecf8",
    dark: false,
  },
  growth: {
    id: "growth",
    title: "Endless stair",
    caption: "Every step climbs one place while a new step forms at the bottom; light nodes ride the treads.",
    idea: "Optimisation as a loop rather than a launch: measure, improve, repeat, and the structure keeps rising without ever being rebuilt.",
    relatesTo: { label: "Growth & Optimization", href: "/services#growth-optimization" },
    technique: ["Blender", "Infinite loop construction", "Brand-blue studio"],
    seconds: 8,
    width: 1280,
    height: 720,
    tone: "#1766d8",
    dark: true,
  },
  rnd: {
    id: "rnd",
    title: "Exploded module",
    caption: "One large module opens into its stacked layers, turns, and closes again.",
    idea: "An exploded view: understanding something by taking it apart in order. It is how our own products and internal systems are engineered before anything is published.",
    relatesTo: { label: "Products & R&D", href: "/products" },
    technique: ["Blender", "Exploded view", "Single-key lighting"],
    seconds: 8,
    width: 1280,
    height: 720,
    tone: "#0a1836",
    dark: true,
  },
  team: {
    id: "team",
    title: "Ensemble",
    caption: "Modules in different finishes arrive from every direction and lock into one lattice.",
    idea: "Different people, one structure: each module keeps its finish, and the lattice only holds because each one turns to meet its neighbours.",
    relatesTo: { label: "Careers", href: "/careers" },
    technique: ["Blender", "Staggered assembly", "Soft studio"],
    seconds: 8,
    width: 1280,
    height: 720,
    tone: "#e9edf4",
    dark: false,
  },
};

export const filmList: Film[] = Object.values(films);

export const filmSrc = (id: FilmId) => ({
  mp4: `/media/films/${id}.mp4`,
  webm: `/media/films/${id}.webm`,
  /** 480p variants for phones (served through <source media>). */
  mp4Small: `/media/films/${id}-m.mp4`,
  webmSmall: `/media/films/${id}-m.webm`,
  poster: `/media/films/${id}.jpg`,
});
