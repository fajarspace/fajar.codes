import { cn } from "@/utils/cn";

interface WordmarkProps {
  className?: string;
  /** Rendered after the mark, e.g. "/ admin". */
  suffix?: string;
}

/** Typographic wordmark: serif "fajar.codes", italic "codes", period set in the accent colour. */
export function Wordmark({ className, suffix }: WordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-2 font-serif text-[1.375rem] leading-none",
        className,
      )}
    >
      <span className="">
        fajar
        {/* <span className="text-[1.15em] text-accent" aria-hidden>
          .
        </span> */}
        {/* <span className="sr-only">.</span> */}
        <span className="italic font-bold">.codes</span>
      </span>
      {suffix ? (
        <span className="font-sans text-xs text-fg-muted">{suffix}</span>
      ) : null}
    </span>
  );
}
