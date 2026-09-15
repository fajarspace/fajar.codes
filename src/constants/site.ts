import { env } from "@/lib/env";

export const site = {
  name: "Fajar",
  wordmark: "fajar.codes",
  url: env.siteUrl,
  tagline:
    "Just Tech Spelunking... and occasionally breaking things along the way.",
  description:
    "A personal workspace on the web — projects, notes, experiments and whatever Fajar is currently building, learning or thinking about.",
  location: "West Java, Indonesia",
  timezoneLabel: "WIB · UTC+7",
  locale: "en",
  ogImage: "/og.png",
  author: {
    name: "Fajar Nugroho",
    email: "halo@fajar.codes",
  },
  socials: [
    {
      label: "GitHub",
      handle: "@fajarspace",
      href: "https://github.com/fajarspace",
    },
    {
      label: "Instagram",
      handle: "@fajaragngn",
      href: "https://instagram.com/fajaragngn",
    },
    {
      label: "LinkedIn",
      handle: "in/fajaragngn",
      href: "https://www.linkedin.com/in/fajaragngn",
    },
    {
      label: "Email",
      handle: "halo@fajar.codes",
      href: "mailto:halo@fajar.codes",
    },
  ],
} as const;

export const navigation = [
  // { label: 'Index', href: '/', index: '01' },
  { label: "Work", href: "/work", index: "02" },
  { label: "Notes", href: "/notes", index: "03" },
  { label: "Photos", href: "/photos", index: "04" },
] as const;

export const projectCategories = [
  { value: "all", label: "All" },
  { value: "web", label: "Web" },
  { value: "system", label: "System" },
  { value: "experiment", label: "Experiment" },
  { value: "research", label: "Research" },
] as const;

export const storage = {
  bucket: "media",
  folders: {
    avatar: "avatars",
    projectCover: "projects/covers",
    projectGallery: "projects/gallery",
    noteCover: "notes/covers",
    gallery: "gallery",
  },
} as const;

export const storageKeys = {
  theme: "fajar.theme",
  workView: "fajar.work-view",
  notesView: "fajar.notes-view",
} as const;
