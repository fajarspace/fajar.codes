import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { navigation, site } from "@/constants/site";
import { LocalClock } from "@/components/common/LocalClock";
import { RandomNoteButton } from "@/components/notes/RandomNoteButton";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-editorial grid gap-10 py-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-serif text-2xl leading-snug">
            Made with love, mostly at night, <em>with too much coffee..</em>
          </p>
          {/* <p className="mt-4 text-xs text-fg-muted">
            {site.location} · {site.timezoneLabel}
          </p> */}
        </div>

        <div className="md:col-span-3">
          <p className="label-caps mb-3">Pages</p>
          <ul className="space-y-1.5 text-sm">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="link-underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <RandomNoteButton className="link-underline text-sm" />
            </li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="label-caps mb-3">Elsewhere</p>
          <ul className="space-y-1.5 text-sm">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer noopener"
                  className="link-underline inline-flex items-center gap-1"
                >
                  {s.label}
                  <span className="text-fg-muted">{s.handle}</span>
                  <ArrowUpRight className="size-3 text-fg-muted" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <div className="container-editorial flex flex-col gap-2 py-4 text-2xs text-fg-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} fajar.codes. Built with 💛 in Indonesia.</p>
          <p className="flex items-center gap-3">
            <span className="hidden sm:inline">Local time</span>
            <LocalClock withDate />
          </p>
        </div>
      </div>
    </footer>
  );
}
