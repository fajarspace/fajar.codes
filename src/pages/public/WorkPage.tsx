import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { storageKeys } from "@/constants/site";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useQuery } from "@/hooks/useQuery";
import { useSeo } from "@/hooks/useSeo";
import { listProjects } from "@/services";
import { Container } from "@/components/common/Container";
import { SkeletonRows } from "@/components/common/Skeleton";
import { EmptyState, ErrorState } from "@/components/common/States";
import {
  ProjectFilters,
  type CategoryFilter,
} from "@/components/project/ProjectFilters";
import { ProjectList } from "@/components/project/ProjectList";
import type { ProjectView } from "@/components/project/ProjectRow";

const validCategories: CategoryFilter[] = [
  "all",
  "web",
  "system",
  "experiment",
  "research",
];

export default function WorkPage() {
  useSeo({
    title: "Work",
    description:
      "Projects, systems, experiments and research — an index of things Fajar has built and shipped.",
    canonicalPath: "/work",
  });

  const [params, setParams] = useSearchParams();
  const raw = params.get("category");
  const category: CategoryFilter = validCategories.includes(
    raw as CategoryFilter,
  )
    ? (raw as CategoryFilter)
    : "all";
  const [view, setView] = useLocalStorage<ProjectView>(
    storageKeys.workView,
    "list",
  );

  const projects = useQuery("projects:public", () => listProjects());

  const counts = useMemo(() => {
    const base: Record<CategoryFilter, number> = {
      all: 0,
      web: 0,
      system: 0,
      experiment: 0,
      research: 0,
    };
    for (const p of projects.data ?? []) {
      base.all += 1;
      base[p.category] += 1;
    }
    return base;
  }, [projects.data]);

  const filtered = useMemo(
    () =>
      (projects.data ?? []).filter(
        (p) => category === "all" || p.category === category,
      ),
    [projects.data, category],
  );

  const setCategory = (next: CategoryFilter) => {
    setParams(next === "all" ? {} : { category: next }, { replace: true });
  };

  return (
    <>
      <Container as="section" id="work-index" className="pb-16 pt-14 sm:pt-20">
        <p className="label-caps">Work</p>
        <h1 className="mt-6 max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight sm:text-6xl">
          Things I have built, in the order I would{" "}
          <mark>show them to you</mark>.
        </h1>
      </Container>

      <Container as="section" className="pb-8">
        <ProjectFilters
          category={category}
          onCategoryChange={setCategory}
          view={view}
          onViewChange={setView}
          counts={counts}
        />
        {projects.status === "error" ? (
          <ErrorState error={projects.error} onRetry={projects.refetch} />
        ) : projects.isLoading ? (
          <SkeletonRows rows={6} />
        ) : filtered.length > 0 ? (
          <ProjectList projects={filtered} view={view} />
        ) : (
          <EmptyState
            title={
              category === "all"
                ? "Nothing here yet."
                : `No ${category} projects yet.`
            }
            description="Either it is still a draft, or it has not been built. Both are possible."
          />
        )}
      </Container>
    </>
  );
}
