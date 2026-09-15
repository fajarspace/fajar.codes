import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { storageKeys } from "@/constants/site";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useQuery } from "@/hooks/useQuery";
import { useSeo } from "@/hooks/useSeo";
import { listNotes, listTags } from "@/services";
import { Container } from "@/components/common/Container";
import { SkeletonRows } from "@/components/common/Skeleton";
import { EmptyState, ErrorState } from "@/components/common/States";
import { NoteFilters } from "@/components/notes/NoteFilters";
import { NoteList, type NoteView } from "@/components/notes/NoteList";
import { RandomNoteButton } from "@/components/notes/RandomNoteButton";
import { Button } from "@/components/common/Button";

export default function NotesPage() {
  useSeo({
    title: "Notes",
    description:
      "Short and long notes on building software, shipping to real people, and the things that break along the way.",
    canonicalPath: "/notes",
  });

  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const activeTag = params.get("tag");
  const [view, setView] = useLocalStorage<NoteView>(
    storageKeys.notesView,
    "list",
  );

  const notes = useQuery("notes:public", () => listNotes());
  const tags = useQuery("tags", listTags);

  const usedTags = useMemo(() => {
    const used = new Set(
      (notes.data ?? []).flatMap((n) => n.tags.map((t) => t.id)),
    );
    return (tags.data ?? []).filter((t) => used.has(t.id));
  }, [notes.data, tags.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (notes.data ?? []).filter((note) => {
      if (activeTag && !note.tags.some((t) => t.slug === activeTag))
        return false;
      if (!q) return true;
      const haystack = [
        note.title,
        note.excerpt,
        ...note.tags.map((t) => t.name),
      ]
        .join(" ")
        .toLowerCase();
      return q.split(/\s+/).every((token) => haystack.includes(token));
    });
  }, [notes.data, query, activeTag]);

  const update = (patch: { q?: string; tag?: string | null }) => {
    const next = new URLSearchParams(params);
    if (patch.q !== undefined) {
      if (patch.q) next.set("q", patch.q);
      else next.delete("q");
    }
    if (patch.tag !== undefined) {
      if (patch.tag) next.set("tag", patch.tag);
      else next.delete("tag");
    }
    setParams(next, { replace: true });
  };

  return (
    <>
      <Container as="section" id="notes-index" className="pb-16 pt-14 sm:pt-20">
        <p className="label-caps">Notes</p>
        <h1 className="mt-6 max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight sm:text-6xl">
          Written down so I <mark>stop re-learning it</mark>.
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-fg-muted">
          <RandomNoteButton
            withIcon
            className="text-fg underline underline-offset-4"
          />
        </div>
      </Container>

      <Container as="section" className="pb-8">
        <NoteFilters
          query={query}
          onQueryChange={(q) => update({ q })}
          tags={usedTags}
          activeTag={activeTag}
          onTagChange={(tag) => update({ tag })}
          view={view}
          onViewChange={setView}
        />
        {notes.status === "error" ? (
          <ErrorState error={notes.error} onRetry={notes.refetch} />
        ) : notes.isLoading ? (
          <SkeletonRows rows={5} />
        ) : filtered.length > 0 ? (
          <NoteList notes={filtered} view={view} />
        ) : (notes.data?.length ?? 0) > 0 ? (
          <EmptyState
            title="No notes match."
            description="Try fewer words, or clear the tag filter."
            action={
              <Button size="sm" onClick={() => update({ q: "", tag: null })}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="Nothing published yet."
            description="Drafts exist. They are not ready."
          />
        )}
      </Container>
    </>
  );
}
