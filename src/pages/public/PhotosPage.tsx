import { useState } from "react";
import { useQuery } from "@/hooks/useQuery";
import { useSeo } from "@/hooks/useSeo";
import { listPhotos } from "@/services";
import { Container } from "@/components/common/Container";
import { Skeleton } from "@/components/common/Skeleton";
import { EmptyState, ErrorState } from "@/components/common/States";
import { PhotoGrid } from "@/components/common/PhotoGrid";
import { Lightbox } from "@/components/common/Lightbox";

export default function PhotosPage() {
  useSeo({
    title: "Photos",
    description:
      "Photos from around the work — carts, trains, desks and the occasional rain on Sudirman.",
    canonicalPath: "/photos",
  });

  const photos = useQuery("gallery:public", () => listPhotos());
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <Container
        as="section"
        id="photos-index"
        className="pb-12 pt-14 sm:pt-20"
      >
        <p className="label-caps">Photos</p>
        <h1 className="mt-6 max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight sm:text-6xl">
          Only for a <mark>moment</mark>
        </h1>
      </Container>

      <Container as="section" className="pb-8">
        {photos.status === "error" ? (
          <ErrorState error={photos.error} onRetry={photos.refetch} />
        ) : photos.isLoading ? (
          <div
            className="columns-1 gap-6 sm:columns-2 lg:columns-3"
            aria-busy="true"
          >
            {["4 / 5", "16 / 10", "1 / 1", "16 / 11", "4 / 5", "16 / 10"].map(
              (ratio, i) => (
                <div key={i} className="mb-8 break-inside-avoid">
                  <Skeleton className="w-full" />
                  <div
                    className="skeleton w-full"
                    style={{ aspectRatio: ratio }}
                  />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                </div>
              ),
            )}
          </div>
        ) : photos.data && photos.data.length > 0 ? (
          <>
            <PhotoGrid photos={photos.data} onOpen={setOpen} />
            <Lightbox photos={photos.data} index={open} onChange={setOpen} />
          </>
        ) : (
          <EmptyState
            title="No photos yet."
            description="The camera roll is full; the gallery is not. Soon."
          />
        )}
      </Container>
    </>
  );
}
