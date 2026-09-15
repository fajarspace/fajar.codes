import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, RefreshCw } from "lucide-react";
import { site } from "@/constants/site";
import { facts } from "@/constants/facts";
import { useQuery } from "@/hooks/useQuery";
import { useSeo } from "@/hooks/useSeo";
import {
  getPublicProfile,
  listNotes,
  listNowItems,
  listProjects,
} from "@/services";
import type { NowItem, Profile } from "@/types/content";
import { labels } from "@/utils/format";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal, RevealLines } from "@/components/common/Reveal";
import {
  Skeleton,
  SkeletonRows,
  SkeletonText,
} from "@/components/common/Skeleton";
import { EmptyState, ErrorState } from "@/components/common/States";
import { SmartImage } from "@/components/common/SmartImage";
import { ProjectList } from "@/components/project/ProjectList";
import { NoteList } from "@/components/notes/NoteList";

export default function HomePage() {
  useSeo({
    description: site.description,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: site.author.name,
      url: site.url,
      email: site.author.email,
      jobTitle: "Software engineer",
      address: {
        "@type": "PostalAddress",
        addressLocality: "West Java",
        addressCountry: "ID",
      },
      sameAs: site.socials
        .filter((s) => !s.href.startsWith("mailto:"))
        .map((s) => s.href),
    },
  });

  const profile = useQuery("profile", getPublicProfile);
  const now = useQuery("now:active", () => listNowItems({ activeOnly: true }));
  const featured = useQuery("projects:featured", () =>
    listProjects({ featuredOnly: true, limit: 4 }),
  );
  const notes = useQuery("notes:latest", () => listNotes({ limit: 3 }));

  return (
    <>
      {/* 01 — Hero */}
      <section
        id="index"
        className="container-editorial grid gap-10 pb-16 pt-14 sm:pt-20 md:grid-cols-12 md:items-center lg:pt-20"
      >
        <RevealLines
          as="h1"
          text="Tech Spelunking."
          className="font-serif text-4xl leading-[1.05] tracking-tight sm:text-6xl md:col-span-8 lg:text-7xl"
        />
        <Reveal
          delay={0.2}
          className="size-40 sm:size-48 md:col-span-4 md:ml-auto lg:size-56"
        >
          <SmartImage
            src={profile.data?.avatarUrl ?? "/images/avatar.svg"}
            alt={
              profile.data ? `Portrait of ${profile.data.fullName}` : "Portrait"
            }
            ratio="1 / 1"
            wrapperClassName="rounded-full"
            priority
          />
        </Reveal>
      </section>

      {/* 02 — Now */}
      <Container as="section" id="now" className="pb-20">
        <SectionHeading
          label="Now"
          aside={<span>Updated when things change</span>}
        />
        {now.status === "error" ? (
          <ErrorState error={now.error} onRetry={now.refetch} />
        ) : now.isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-3/4" />
                <SkeletonText lines={2} />
              </div>
            ))}
          </div>
        ) : now.data && now.data.length > 0 ? (
          <NowGrid items={now.data} />
        ) : (
          <EmptyState
            title="Nothing on the desk right now."
            description="Which probably means something is being built quietly."
          />
        )}
      </Container>

      {/* 03 — Work */}
      <Container as="section" id="work" className="pb-20">
        <SectionHeading
          label="Selected work"
          title={
            <>
              A few things that <em>shipped</em>.
            </>
          }
          aside={
            <Link
              to="/work"
              className="link-underline inline-flex items-center gap-1"
            >
              All projects <ArrowRight className="size-3" />
            </Link>
          }
        />
        {featured.status === "error" ? (
          <ErrorState error={featured.error} onRetry={featured.refetch} />
        ) : featured.isLoading ? (
          <SkeletonRows rows={4} />
        ) : featured.data && featured.data.length > 0 ? (
          <ProjectList projects={featured.data} />
        ) : (
          <EmptyState
            title="No projects yet."
            description="They are on the way."
          />
        )}
      </Container>

      {/* 04 — Notes */}
      <Container as="section" id="notes" className="pb-20">
        <SectionHeading
          label="Latest notes"
          aside={
            <Link
              to="/notes"
              className="link-underline inline-flex items-center gap-1"
            >
              All notes <ArrowRight className="size-3" />
            </Link>
          }
        />
        {notes.status === "error" ? (
          <ErrorState error={notes.error} onRetry={notes.refetch} />
        ) : notes.isLoading ? (
          <SkeletonRows rows={3} />
        ) : notes.data && notes.data.length > 0 ? (
          <NoteList notes={notes.data} />
        ) : (
          <EmptyState
            title="Nothing written yet."
            description="The notebook is open, though."
          />
        )}
      </Container>

      {/* 05 — Facts */}
      <Container as="section" id="facts" className="pb-20">
        <SectionHeading label="Random thoughts" />
        <RandomFacts />
      </Container>

      {/* 06 — Contact */}
      <Container as="section" id="contact" className="pb-8">
        <SectionHeading label="Contact" />
        <ContactBlock profile={profile.data} />
      </Container>
    </>
  );
}

/* ------------------------------------------------------------------------ */

function NowGrid({ items }: { items: NowItem[] }) {
  return (
    <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => {
        const inner = (
          <>
            <p className="label-caps">{labels.nowType[item.type]}</p>
            <p className="mt-2 font-serif text-2xl leading-tight">
              {item.title}
              {item.url ? (
                <ArrowUpRight className="ml-1 inline size-4 align-baseline text-fg-muted" />
              ) : null}
            </p>
            {item.description ? (
              <p className="mt-2 text-sm text-fg-muted">{item.description}</p>
            ) : null}
          </>
        );
        return (
          <Reveal as="li" key={item.id} delay={i * 0.05}>
            {item.url ? (
              item.url.startsWith("/") ? (
                <Link to={item.url} className="group block">
                  {inner}
                </Link>
              ) : (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group block"
                >
                  {inner}
                </a>
              )
            ) : (
              <div>{inner}</div>
            )}
          </Reveal>
        );
      })}
    </ul>
  );
}

function pickThree(seed: number): string[] {
  const shuffled = [...facts];
  let random = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    random = (random * 9301 + 49297) % 233280;
    const j = Math.floor((random / 233280) * (i + 1));
    const a = shuffled[i];
    const b = shuffled[j];
    if (a !== undefined && b !== undefined) {
      shuffled[i] = b;
      shuffled[j] = a;
    }
  }
  return shuffled.slice(0, 3);
}

function RandomFacts() {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000));
  const picked = useMemo(() => pickThree(seed), [seed]);
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
      <ul className="space-y-4">
        {picked.map((fact) => (
          <li
            key={fact}
            className="flex gap-4 font-serif text-xl leading-snug sm:text-2xl"
          >
            <span
              className="mt-2 size-1.5 shrink-0 rounded-full bg-fg"
              aria-hidden
            />
            <span>{fact}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setSeed((s) => s + 1)}
        className="inline-flex items-center gap-2 text-xs text-fg-muted hover:text-fg"
      >
        <RefreshCw className="size-3.5" /> Three more
      </button>
    </div>
  );
}

function ContactBlock({ profile }: { profile: Profile | undefined }) {
  const email = profile?.email ?? site.author.email;
  return (
    <div className="max-w-3xl">
      <p className="font-serif text-3xl leading-tight sm:text-5xl">
        Have something small and useful in mind?{" "}
        <mark>
          <em>Write to me.</em>
        </mark>
      </p>
      <a
        href={`mailto:${email}`}
        className="mt-6 inline-flex items-center gap-2 border-b border-fg pb-1 text-lg transition-colors hover:border-accent"
      >
        {email}
        <ArrowUpRight className="size-4" />
      </a>
    </div>
  );
}
