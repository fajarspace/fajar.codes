/**
 * Sample content used when Supabase is not configured (local preview / demo mode).
 * The SQL seed in supabase/seed.sql contains the same data.
 */
import type { GalleryPhoto, Note, NowItem, Profile, ProjectImage, ProjectWithImages, Tag } from '@/types/content'

const at = (date: string) => `${date}T09:00:00+07:00`

export const sampleProfile: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  fullName: 'Fajar Nugroho',
  username: 'fajar',
  headline: 'Builds useful things for the web.',
  bio: 'Software engineer in Jakarta. Currently independent, working with small businesses on tools they actually use — and occasionally on things nobody asked for.',
  avatarUrl: '/images/avatar.svg',
  location: 'Jakarta, Indonesia',
  availabilityStatus: 'available',
  currentActivity: 'Ambient — generative audio in the browser',
  email: 'hello@fajar.codes',
  role: 'admin',
  updatedAt: at('2026-09-01'),
}

export const sampleTags: Tag[] = [
  { id: 't-offline', name: 'Offline', slug: 'offline' },
  { id: 't-product', name: 'Product', slug: 'product' },
  { id: 't-engineering', name: 'Engineering', slug: 'engineering' },
  { id: 't-supabase', name: 'Supabase', slug: 'supabase' },
  { id: 't-postgres', name: 'Postgres', slug: 'postgres' },
  { id: 't-security', name: 'Security', slug: 'security' },
  { id: 't-field-notes', name: 'Field notes', slug: 'field-notes' },
  { id: 't-opinion', name: 'Opinion', slug: 'opinion' },
  { id: 't-reading', name: 'Reading', slug: 'reading' },
  { id: 't-writing', name: 'Writing', slug: 'writing' },
]

const tag = (slug: string): Tag => {
  const found = sampleTags.find((t) => t.slug === slug)
  if (!found) throw new Error(`Unknown sample tag: ${slug}`)
  return found
}

const image = (projectId: string, index: number, imageUrl: string, caption: string): ProjectImage => ({
  id: `${projectId}-img-${index}`,
  projectId,
  imageUrl,
  caption,
  sortOrder: index,
})

export const sampleProjects: ProjectWithImages[] = [
  {
    id: 'p-ledger',
    title: 'Ledger',
    slug: 'ledger',
    shortDescription: 'Double-entry bookkeeping for freelancers who invoice in three currencies and understand none of them.',
    category: 'web',
    year: 2025,
    role: 'Design, engineering',
    techStack: ['React', 'TypeScript', 'Supabase', 'Postgres', 'Tailwind CSS'],
    coverUrl: '/images/covers/ledger.svg',
    liveUrl: 'https://ledger.fajar.codes',
    repositoryUrl: 'https://github.com/fajarnugroho/ledger',
    status: 'live',
    featured: true,
    sortOrder: 1,
    createdAt: at('2025-02-10'),
    updatedAt: at('2025-08-22'),
    images: [
      image('p-ledger', 1, '/images/covers/ledger.svg', 'The journal view. Every entry balances, or it does not save.'),
      image('p-ledger', 2, '/images/covers/ledger-2.svg', 'Multi-currency accounts with rates pinned at the time of the transaction.'),
    ],
    content: `## Background

I have been freelancing on and off since 2019 and every year, around March, I open a spreadsheet and try to reconstruct what happened. Clients pay in IDR, USD and occasionally SGD. Some pay late. Some pay in two parts. The spreadsheet has a tab called "actually correct" which is not.

Accounting software exists, obviously. But everything I tried was built for companies with an accountant, and I am a person with a text editor.

## The problem

Three things kept going wrong:

1. **Currency.** Recording a USD invoice in IDR at today's rate makes last year's numbers move every time you open the file.
2. **Partial payments.** An invoice is not paid or unpaid. It is 60% paid, then 100% paid, then refunded 10%.
3. **Trust.** A spreadsheet lets you type anything. I needed something that refused to save an entry that did not balance.

Double-entry bookkeeping solves all three. It is a 500-year-old data structure and it is very, very good.

## Process

I started with the schema and did not touch the UI for three weeks.

\`\`\`sql
create table entries (
  id          uuid primary key default gen_random_uuid(),
  journal_id  uuid not null references journals(id),
  account_id  uuid not null references accounts(id),
  amount      numeric(18, 4) not null,   -- signed, in account currency
  base_amount numeric(18, 4) not null,   -- signed, in base currency (IDR)
  rate        numeric(18, 8) not null    -- pinned at entry time
);

-- A journal must sum to zero in base currency.
create or replace function assert_balanced() returns trigger as $$
begin
  if (select coalesce(sum(base_amount), 0) from entries where journal_id = new.journal_id) <> 0 then
    raise exception 'journal % does not balance', new.journal_id;
  end if;
  return new;
end $$ language plpgsql;
\`\`\`

The constraint lives in Postgres, not in React. The UI can be wrong; the ledger cannot.

The interface came later and is deliberately plain: a journal, a list of accounts, a monthly view. No charts on the home screen. Charts are a separate page you go to on purpose.

## Result

- Every March since has taken about forty minutes instead of a weekend.
- Eleven friends use it. Two of them have asked for features. I said no to one.
- The balance trigger has fired 214 times in production. Each one was a bug in my UI that would otherwise have been a bug in my taxes.

It is a small tool that does one thing. I would like more of my software to feel like this.`,
  },
  {
    id: 'p-warung-pos',
    title: 'Warung POS',
    slug: 'warung-pos',
    shortDescription: 'Offline-first point of sale for street food vendors. Runs on an Rp 800.000 Android and a very bad signal.',
    category: 'system',
    year: 2024,
    role: 'Product, engineering',
    techStack: ['React Native', 'SQLite', 'Go', 'Postgres', 'WebSockets'],
    coverUrl: '/images/covers/warung-pos.svg',
    liveUrl: 'https://warung.fajar.codes',
    repositoryUrl: null,
    status: 'live',
    featured: true,
    sortOrder: 2,
    createdAt: at('2024-03-02'),
    updatedAt: at('2025-01-15'),
    images: [
      image('p-warung-pos', 1, '/images/covers/warung-pos.svg', 'The order screen. Big buttons, because hands are wet and busy.'),
      image('p-warung-pos', 2, '/images/covers/warung-pos-2.svg', 'End-of-day summary, sent to WhatsApp automatically.'),
    ],
    content: `## Background

Bu Ratna sells nasi uduk outside my old office. She keeps her sales in a notebook, does her sums at 9pm, and once a month argues with her supplier about how much rice she bought. She asked me, as a joke, whether "the computer" could do this.

I took the joke seriously and spent the next eight months on it.

## The problem

Every POS app assumes three things that are false at a street cart:

- **Connectivity.** The signal drops every time a bus goes past.
- **Attention.** The person using it is also frying something.
- **Hardware.** It is an old phone with a cracked screen and 12% battery.

So the constraints wrote themselves: works fully offline, every action is one tap, and it must not drain the battery.

## Process

The app is a thin React Native shell over a local SQLite database. Every sale is written locally first and synced later — "later" being whenever the phone finds a signal, which is handled by a small Go service that accepts batches and resolves conflicts by last-write-wins per line item (not per order, which matters when two people share one phone).

> The hardest feature was the one that looked easiest: a big "Bayar" button that does the right thing even if you tap it twice.

Idempotency keys on every mutation. Retry with backoff. A sync indicator that is honest about what has and has not left the device.

I spent two afternoons a week at the cart for the first month. Most of what I learned is in [a separate note](/notes/what-shipping-a-pos-to-street-vendors-taught-me).

## Result

Bu Ratna's end-of-day sums now take four minutes. The supplier argument is over — there is a report. Nine other vendors on the same street use it; I did not market it to them, they just saw the phone.

It is the most-used thing I have ever built, and it has no landing page.`,
  },
  {
    id: 'p-kelas',
    title: 'Kelas',
    slug: 'kelas',
    shortDescription: 'A small learning-management system for tutoring centres that refuse to use Google Classroom.',
    category: 'system',
    year: 2023,
    role: 'Engineering',
    techStack: ['Next.js', 'TypeScript', 'Prisma', 'Postgres', 'Cloudflare R2'],
    coverUrl: '/images/covers/kelas.svg',
    liveUrl: 'https://kelas.fajar.codes',
    repositoryUrl: 'https://github.com/fajarnugroho/kelas',
    status: 'live',
    featured: true,
    sortOrder: 3,
    createdAt: at('2023-05-18'),
    updatedAt: at('2024-06-30'),
    images: [image('p-kelas', 1, '/images/covers/kelas.svg', 'Assignment view for a class of 14.')],
    content: `## Background

A friend runs a bimbel — a small after-school tutoring centre — with about 120 students and four teachers. They tried Google Classroom. Parents could not log in. They tried WhatsApp groups. Nobody could find anything. They went back to paper.

## The problem

The centre needed roughly five things: a schedule, a place to put homework, a way to mark it, attendance, and a monthly report for parents. Not a platform. Five things.

## Process

Kelas is deliberately unambitious. One Next.js app, one Postgres database, files on R2. Login is a six-digit code sent by WhatsApp because that is the one app everybody already has open.

The interesting work was in the reports: parents get a single-page PDF each month that reads like a letter, not a dashboard. Teachers write one sentence per student; the system does the rest.

\`\`\`ts
// The whole "grading" model. Anything more than this was rejected by the teachers.
type Mark = 'done' | 'partial' | 'missing'
\`\`\`

## Result

Still running, mostly untouched, two years later. It has survived three teacher changes and one very determined student who tried to submit homework by email. The centre has grown to 180 students. Paper is gone.`,
  },
  {
    id: 'p-rasa',
    title: 'Rasa',
    slug: 'rasa',
    shortDescription: 'A corpus of 12,000 Indonesian recipes and a search engine that knows "pedas" is a spectrum.',
    category: 'research',
    year: 2024,
    role: 'Research, engineering',
    techStack: ['Python', 'Postgres', 'pgvector', 'FastAPI', 'SvelteKit'],
    coverUrl: '/images/covers/rasa.svg',
    liveUrl: 'https://rasa.fajar.codes',
    repositoryUrl: 'https://github.com/fajarnugroho/rasa',
    status: 'live',
    featured: true,
    sortOrder: 4,
    createdAt: at('2024-07-04'),
    updatedAt: at('2024-12-19'),
    images: [
      image('p-rasa', 1, '/images/covers/rasa.svg', 'Search results for "sambal tanpa terasi".'),
      image('p-rasa', 2, '/images/covers/rasa-2.svg', 'The ingredient graph. Shallots are connected to everything.'),
    ],
    content: `## Background

Indonesian recipes online are a mess of blog posts, comment threads and screenshots of handwriting. Search engines treat "rendang" and "rendang daging" as different things and "pedas" as a word rather than a dial.

I wanted a dataset I could actually query, and then I wanted to see what fell out of it.

## The problem

Three research questions:

1. Can you normalise ingredients across 12,000 recipes written by 4,000 different people?
2. Does semantic search (embeddings) beat plain full-text search for cooking, where synonyms are regional?
3. What does the ingredient graph of a cuisine look like?

## Process

Scraping was the boring part. Normalisation was the hard part — "bawang merah", "bamer", "brambang" and "shallot" are all the same thing, and a rule-based pass got 70% of the way there. The remaining 30% was a hand-built alias table that I am weirdly proud of.

For search I ran both approaches side by side:

| Query | Full-text top hit | Embedding top hit |
| --- | --- | --- |
| sambal tanpa terasi | sambal terasi (!) | sambal bawang |
| makanan buat orang sakit | — | bubur ayam |
| pedas banget | rendang | ayam geprek level 5 |

Embeddings won on intent, full-text won on exact names. The final ranker blends both, weighted by whether the query contains a known dish name.

## Result

The corpus is public. The search is public. The ingredient graph has a very dense centre — shallots, garlic, chilli, salt — and a long tail of things that appear in exactly one recipe from one grandmother in Manado. That long tail is the interesting part, and it is what I want to look at next.`,
  },
  {
    id: 'p-tiny-cron',
    title: 'Tiny Cron',
    slug: 'tiny-cron',
    shortDescription: 'Cron expressions explained in plain English and Indonesian, as you type. 4 KB, no dependencies.',
    category: 'experiment',
    year: 2023,
    role: 'Everything',
    techStack: ['TypeScript', 'Vite', 'Zero dependencies'],
    coverUrl: '/images/covers/tiny-cron.svg',
    liveUrl: 'https://cron.fajar.codes',
    repositoryUrl: 'https://github.com/fajarnugroho/tiny-cron',
    status: 'live',
    featured: false,
    sortOrder: 5,
    createdAt: at('2023-01-14'),
    updatedAt: at('2023-02-02'),
    images: [image('p-tiny-cron', 1, '/images/covers/tiny-cron.svg', '"0 9 * * 1-5" → "At 09:00, Monday through Friday."')],
    content: `## Background

I have written cron expressions for ten years and I still cannot read them. Neither can anyone I have worked with. The existing explainers are fine but heavy, and none speak Indonesian.

## The problem

Make \`*/15 2-4 * * 1\` readable, in two languages, in a page that loads instantly on a bad connection.

## Process

A weekend. The parser is 180 lines. The English and Indonesian renderers share a small grammar so that adding a third language is a data change, not a code change.

\`\`\`ts
const explain = (expr: string, lang: 'en' | 'id') =>
  render(parse(expr), grammars[lang])
\`\`\`

No framework. The whole page, fonts excluded, is 4.1 KB gzipped.

## Result

It gets a few hundred visits a week, mostly from Indonesia, mostly on weekday mornings. I assume those are people about to deploy something. Good luck to them.`,
  },
  {
    id: 'p-ambient',
    title: 'Ambient',
    slug: 'ambient',
    shortDescription: 'Generative audio in the browser, driven by live weather data from Jakarta. Rain sounds like rain.',
    category: 'experiment',
    year: 2025,
    role: 'Sound design (badly), engineering',
    techStack: ['Web Audio API', 'TypeScript', 'Vite', 'BMKG API'],
    coverUrl: '/images/covers/ambient.svg',
    liveUrl: null,
    repositoryUrl: 'https://github.com/fajarnugroho/ambient',
    status: 'in_progress',
    featured: false,
    sortOrder: 6,
    createdAt: at('2025-09-01'),
    updatedAt: at('2026-09-10'),
    images: [image('p-ambient', 1, '/images/covers/ambient.svg', 'The only UI: a circle that breathes with the humidity.')],
    content: `## Background

I wanted a background sound for working that was not a Spotify playlist and was not the same 10-hour YouTube video of rain. I also wanted an excuse to finally learn the Web Audio API.

## The problem

Generate something that sounds like the weather outside, right now, without any recorded samples. Humidity, wind, rain intensity and time of day are the only inputs.

## Process (ongoing)

Currently: four oscillators, a noise source through a resonant filter for rain, and a very slow LFO tied to wind speed. The weather comes from BMKG's public feed every ten minutes.

What is not working yet: thunder. Everything I have tried sounds like a cardboard box.

## Result

Not finished. It lives in a tab on my second monitor. When it is raining in Jakarta, it rains in the tab, and that is already more than I expected.`,
  },
  {
    id: 'p-peta-banjir',
    title: 'Peta Banjir',
    slug: 'peta-banjir',
    shortDescription: 'Crowd-sourced flood reports on a map, built in one weekend during the January 2020 Jakarta floods.',
    category: 'web',
    year: 2020,
    role: 'Everything',
    techStack: ['Vue', 'Firebase', 'Leaflet'],
    coverUrl: '/images/covers/peta-banjir.svg',
    liveUrl: null,
    repositoryUrl: 'https://github.com/fajarnugroho/peta-banjir',
    status: 'archived',
    featured: false,
    sortOrder: 7,
    createdAt: at('2020-01-04'),
    updatedAt: at('2020-03-01'),
    images: [image('p-peta-banjir', 1, '/images/covers/peta-banjir.svg', 'Day two. Red is over a metre.')],
    content: `## Background

On the first of January 2020 it rained in Jakarta for eighteen hours. By morning the road outside my flat was a river and the only information about which roads were passable was in a thousand WhatsApp groups.

## The problem

Put the reports on one map. Fast.

## Process

Saturday: Vue, Firebase, Leaflet, a form with three fields — location, depth, photo. Sunday: moderation, because people are people. Monday: 3,000 reports.

## Result

It ran for two weeks and then the water went down. I archived it rather than maintain it; the city has since built a proper version. It taught me more about building under pressure than anything I had done professionally, and it is the reason I care about things working on bad phones with bad signal.`,
  },
  {
    id: 'p-gilingan',
    title: 'Gilingan',
    slug: 'gilingan',
    shortDescription: 'A personal RSS reader that shows one article at a time and refuses to count unread items.',
    category: 'experiment',
    year: 2026,
    role: 'Everything',
    techStack: ['Go', 'SQLite', 'HTMX'],
    coverUrl: null,
    liveUrl: null,
    repositoryUrl: null,
    status: 'draft',
    featured: false,
    sortOrder: 8,
    createdAt: at('2026-08-20'),
    updatedAt: at('2026-09-05'),
    images: [],
    content: `## Background

Draft. RSS readers make me anxious; the unread count is a to-do list I did not ask for. This one shows a single article, then another, then stops.`,
  },
]

export const sampleNotes: Note[] = [
  {
    id: 'n-offline-first',
    title: 'Offline-first is a product decision, not a technical one',
    slug: 'offline-first-is-a-product-decision',
    excerpt: 'Everyone agrees offline support is nice. Almost nobody budgets for it, because it changes what the product is.',
    coverUrl: '/images/covers/note-offline.svg',
    readingTime: 5,
    status: 'published',
    publishedAt: at('2025-06-14'),
    createdAt: at('2025-06-10'),
    updatedAt: at('2025-06-14'),
    tags: [tag('offline'), tag('product'), tag('engineering')],
    content: `When I tell people Warung POS works fully offline, the response is usually "oh nice, service workers?" and I have to explain that no, that is not really the point.

## Offline is not a feature you add

The common mental model is: build the app, then add caching so it "still works" when the connection drops. This produces apps that *technically* function offline in the way a car with no engine technically functions as a chair.

The real question is: **what does the user need to accomplish when the network is gone, and for how long?**

For a street vendor the answer is "everything, all day". For a bank the answer is "nothing, please". Most products are somewhere in between and never decide.

## What changes when you decide

Once you commit, a lot of design decisions flip:

- **IDs are generated on the client.** UUIDs, ULIDs, whatever. The server cannot hand out IDs if the server is not there.
- **Every write is an event.** You are not updating a row; you are recording that a thing happened at a time, to be reconciled later.
- **Conflicts are a UI problem.** Two phones sold the last portion of ayam bakar. Somebody has to see that and decide.
- **Sync status is a first-class UI element.** Not a spinner. A truthful list of what has not left the device.

None of these are hard. All of them are expensive to retrofit.

## A rough heuristic

\`\`\`text
if users will lose money or data when offline  → offline-first, from day one
if users will be mildly annoyed                → read cache, queue writes
if users will not notice                       → do nothing, ship faster
\`\`\`

The mistake is picking the third row and shipping the first product.

## What I would tell past me

Decide before the schema. The schema is where offline-first lives; the service worker is just the doorman.`,
  },
  {
    id: 'n-rls',
    title: 'Row Level Security is the backend',
    slug: 'row-level-security-is-the-backend',
    excerpt: 'If your only authorisation check is in a React component, you do not have authorisation. You have a suggestion.',
    coverUrl: null,
    readingTime: 6,
    status: 'published',
    publishedAt: at('2025-03-22'),
    createdAt: at('2025-03-18'),
    updatedAt: at('2025-03-22'),
    tags: [tag('supabase'), tag('postgres'), tag('security')],
    content: `This site has an admin panel. It is gated by a \`RequireAdmin\` component that checks whether your profile has \`role = 'admin'\` and redirects you if not. That component is a convenience. It is not security.

Security is this:

\`\`\`sql
create policy "admins write projects"
  on public.projects for all
  using (public.is_admin())
  with check (public.is_admin());
\`\`\`

## The threat model is boring

Nobody is going to reverse-engineer your bundle to bypass a redirect. They are going to open the network tab, copy the request, change one field, and send it again with \`curl\`. It takes ninety seconds and no skill.

If the database accepts that request, the React guard was theatre.

## What RLS actually gives you

With Row Level Security, the *database* evaluates every row against a policy using the caller's identity — in Supabase, the JWT that comes with the anon key. The API layer is not making the decision. Postgres is.

This means:

1. The frontend can be as wrong as it likes.
2. A bug in the UI cannot become a data leak.
3. You can give people the anon key and sleep.

## The shape that works for content sites

Three policies per table, roughly:

\`\`\`sql
-- anyone can read published rows
create policy "public read" on notes for select
  using (status = 'published' or public.is_admin());

-- only admins can change anything
create policy "admin write" on notes for insert with check (public.is_admin());
create policy "admin update" on notes for update using (public.is_admin());
create policy "admin delete" on notes for delete using (public.is_admin());
\`\`\`

And \`is_admin()\` is a small \`security definer\` function that reads the caller's profile row. It is important that it is \`security definer\` — otherwise the function itself is subject to RLS on \`profiles\` and you get a very confusing afternoon.

## The part people forget

Storage. Supabase Storage has its own policy table (\`storage.objects\`) and it defaults to *nothing allowed*, which is correct, but it also means your upload button silently fails until you write:

\`\`\`sql
create policy "admin upload" on storage.objects for insert
  with check (bucket_id = 'media' and public.is_admin());
\`\`\`

## Conclusion

Guard the UI so people do not see buttons they cannot use. Guard the database so it does not matter if they do. Only one of those is load-bearing.`,
  },
  {
    id: 'n-pos-lessons',
    title: 'What shipping a POS to street vendors taught me about software',
    slug: 'what-shipping-a-pos-to-street-vendors-taught-me',
    excerpt: 'Field notes from eight months of building for people who fry things for a living and do not care about my app.',
    coverUrl: '/images/covers/note-pos.svg',
    readingTime: 7,
    status: 'published',
    publishedAt: at('2024-11-09'),
    createdAt: at('2024-11-01'),
    updatedAt: at('2024-11-09'),
    tags: [tag('product'), tag('field-notes')],
    content: `I spent two afternoons a week for a month sitting on a plastic stool next to a nasi uduk cart, watching someone use software I had built. Here is what I wrote in my notebook, cleaned up.

## Nobody reads anything

Not labels. Not confirmations. Not the very clear error message I spent an hour wording. People look at the shape of the screen and tap where the thing usually is.

Design consequence: things must *stay where they are*. I removed every conditional layout. The "Bayar" button is in the same spot whether the cart is empty or has forty items.

## Wet hands, cracked screens

Touch targets that pass accessibility guidelines are too small. My minimum is now 56px, and the primary action is a full-width bar at the bottom that you can hit with a knuckle.

## Batteries are the real uptime metric

The phone is charged overnight and must last from 6am to 9pm. Background sync every 30 seconds was killing it by 3pm. Now it syncs on every sale (if there is signal) and otherwise every 10 minutes, with the radio off in between.

## "It is broken" means one of six things

I kept a tally:

| Report | Actual cause | Count |
| --- | --- | --- |
| "Rusak" (broken) | No signal, sync pending | 11 |
| "Rusak" | Phone battery dead | 4 |
| "Rusak" | Tapped twice, saw duplicate | 3 |
| "Rusak" | Actually broken | 2 |
| "Hilang" (missing) | Scrolled, item off-screen | 5 |
| "Hilang" | Deleted by nephew | 1 |

Every row except "actually broken" became a UI change.

## The feature that mattered was not on my list

The end-of-day summary sent to WhatsApp. I added it in an afternoon because Bu Ratna asked, and it is the thing every other vendor mentions when they ask for the app. Not the offline sync I spent three months on. The summary.

> Build the thing they will show their friends. It is rarely the thing you are proud of.

## What I would do differently

Start on the stool. I built for two months before I sat down at the cart, and I threw most of those two months away.`,
  },
  {
    id: 'n-boring-tech',
    title: 'A small case for boring technology',
    slug: 'a-small-case-for-boring-technology',
    excerpt: 'Every project gets a budget of one interesting decision. Spend it on the problem, not the stack.',
    coverUrl: null,
    readingTime: 3,
    status: 'published',
    publishedAt: at('2024-05-03'),
    createdAt: at('2024-05-01'),
    updatedAt: at('2024-05-03'),
    tags: [tag('engineering'), tag('opinion')],
    content: `Dan McKinley's "Choose Boring Technology" is over a decade old and I still send it to people weekly. Here is my shorter version.

## One interesting decision per project

You get one. Maybe two if the project is large. Everything else should be the most obvious, most documented, most searchable option available.

For Rasa the interesting decision was pgvector. So the API is FastAPI, the frontend is plain, the hosting is a single VPS. For Ambient the interesting decision is the Web Audio API. So there is no framework at all.

## Why

Interesting technology has interesting failure modes. Two interesting things fail in ways that interact, and now you are debugging the intersection of two things nobody else has combined. There is no Stack Overflow answer for the intersection.

## Boring is not the same as old

Postgres is boring. It is also more capable than most new databases. React is boring now. Tailwind is boring now. This is a compliment; it means the surprises have been found.

## The test

Can you explain your stack to a competent stranger in one sentence without them raising an eyebrow? If yes, you have spent your budget well.`,
  },
  {
    id: 'n-naming',
    title: 'Notes on naming things',
    slug: 'notes-on-naming-things',
    excerpt: 'A variable name is a tiny piece of documentation that cannot go stale. Some rules I keep breaking and re-learning.',
    coverUrl: null,
    readingTime: 4,
    status: 'published',
    publishedAt: at('2026-08-11'),
    createdAt: at('2026-08-04'),
    updatedAt: at('2026-08-11'),
    tags: [tag('engineering'), tag('writing')],
    content: `## Name the thing, not the type

\`userList\` tells me it is a list. \`activeSubscribers\` tells me what it is for. The type system already knows it is a list.

## Booleans should read as questions

\`isPublished\`, \`hasCover\`, \`canDelete\`. If a boolean is named \`published\` I have to guess whether it is a state or a command.

## Functions are verbs, unless they are not

\`fetchNotes()\`, \`publishNote()\`, \`estimateReadingTime()\`. But a pure transformer can be a noun: \`slugify\`, \`markdownToText\`. The rule is that reading the call site should feel like reading a sentence.

## Avoid the word "data"

\`data\` is the name you give something when you have not decided what it is. Decide.

\`\`\`ts
// before
const data = await getProjects()
// after
const projects = await getProjects()
\`\`\`

## Names are for the reader, not the writer

At the point of writing you know everything about the thing. The name is for the version of you in six months who knows nothing. Write for that person; they are tired and it is late.`,
  },
  {
    id: 'n-reading-list',
    title: 'Reading list, mid-2026',
    slug: 'reading-list-mid-2026',
    excerpt: 'What is on the desk, what is finished, and what has been on the desk for an embarrassing amount of time.',
    coverUrl: null,
    readingTime: 2,
    status: 'published',
    publishedAt: at('2026-07-06'),
    createdAt: at('2026-07-06'),
    updatedAt: at('2026-07-06'),
    tags: [tag('reading')],
    content: `## Finished

- **A Philosophy of Software Design** — John Ousterhout. Second time through. The chapter on "deep modules" alone is worth the price.
- **The Mom Test** — Rob Fitzpatrick. Should have read this before Warung POS, not after.
- **Sejarah Jakarta** — a dense, dry, wonderful book about how the city got this way.

## In progress

- **Designing Data-Intensive Applications** — Kleppmann. Reading the chapters on replication again with Warung's sync problems in mind.
- **Programming Rust** — the second edition. Chapter 5. Still.

## Abandoned, honestly

- **Zero to One**. I do not think it was written for me.

## Wishlist

- Anything good about sound synthesis that does not assume I can read a circuit diagram.`,
  },
  {
    id: 'n-building-in-public',
    title: 'On building in public without the public',
    slug: 'on-building-in-public-without-the-public',
    excerpt: 'A draft about writing progress notes nobody reads, and why I keep doing it anyway.',
    coverUrl: null,
    readingTime: 2,
    status: 'draft',
    publishedAt: null,
    createdAt: at('2026-09-02'),
    updatedAt: at('2026-09-08'),
    tags: [tag('writing')],
    content: `## Draft

Notes to self: the "Now" section of this site has maybe eleven readers. Six of them are me. The value is not the audience; it is that writing "currently building X" makes it very obvious when X has not moved in a month.

To expand: the accountability loop, the archive, the awkwardness of publishing half-thoughts.`,
  },
]

export const sampleNowItems: NowItem[] = [
  {
    id: 'now-building',
    type: 'building',
    title: 'Ambient',
    description: 'Generative audio driven by Jakarta weather. Currently losing a fight with the Web Audio API over thunder.',
    url: '/work/ambient',
    isActive: true,
    updatedAt: at('2026-09-10'),
  },
  {
    id: 'now-learning',
    type: 'learning',
    title: 'Rust, slowly',
    description: 'Through small CLI tools I would never publish. Chapter 5 of Programming Rust, still.',
    url: null,
    isActive: true,
    updatedAt: at('2026-08-28'),
  },
  {
    id: 'now-reading',
    type: 'reading',
    title: 'Designing Data-Intensive Applications',
    description: 'The replication chapters, again, with a specific sync bug in mind.',
    url: '/notes/reading-list-mid-2026',
    isActive: true,
    updatedAt: at('2026-09-03'),
  },
  {
    id: 'now-thinking',
    type: 'thinking',
    title: 'Whether personal sites need a backend',
    description: 'This one has one. I am not sure it should. A folder of markdown is very hard to beat.',
    url: null,
    isActive: true,
    updatedAt: at('2026-09-01'),
  },
]

const photo = (
  id: string,
  sortOrder: number,
  fields: Omit<GalleryPhoto, 'id' | 'sortOrder' | 'isPublished' | 'createdAt' | 'updatedAt'> & { isPublished?: boolean },
): GalleryPhoto => ({
  id,
  sortOrder,
  isPublished: fields.isPublished ?? true,
  createdAt: at('2026-09-01'),
  updatedAt: at('2026-09-01'),
  title: fields.title,
  caption: fields.caption,
  imageUrl: fields.imageUrl,
  width: fields.width,
  height: fields.height,
  location: fields.location,
  takenAt: fields.takenAt,
})

export const sampleGallery: GalleryPhoto[] = [
  photo('g-01', 1, {
    title: 'Kopi pagi',
    caption: 'Tubruk, no sugar, the only correct answer. Taken before the first meeting of the day.',
    imageUrl: '/images/gallery/01.svg',
    width: 1200,
    height: 1600,
    location: 'Blok M, Jakarta',
    takenAt: '2026-08-30',
  }),
  photo('g-02', 2, {
    title: 'Sudirman, hujan',
    caption: 'Eighteen minutes to cross one junction. Ambient was born on this afternoon.',
    imageUrl: '/images/gallery/02.svg',
    width: 1600,
    height: 1000,
    location: 'Jakarta',
    takenAt: '2026-07-12',
  }),
  photo('g-03', 3, {
    title: 'Gerobak, 06:00',
    caption: 'Bu Ratna’s cart, before the queue. The phone is already charging.',
    imageUrl: '/images/gallery/03.svg',
    width: 1200,
    height: 1200,
    location: 'Kuningan, Jakarta',
    takenAt: '2024-09-03',
  }),
  photo('g-04', 4, {
    title: 'Peron 2',
    caption: 'Yogyakarta to Jakarta. Seven hours, one bar of signal, one production deploy.',
    imageUrl: '/images/gallery/04.svg',
    width: 1600,
    height: 1100,
    location: 'Stasiun Tugu, Yogyakarta',
    takenAt: '2025-12-20',
  }),
  photo('g-05', 5, {
    title: 'Meja, 01:00',
    caption: 'The monitor is still slightly too big.',
    imageUrl: '/images/gallery/05.svg',
    width: 1200,
    height: 1500,
    location: 'Home',
    takenAt: '2026-05-02',
  }),
  photo('g-06', 6, {
    title: 'Kelas, hari pertama',
    caption: 'Fourteen desks, four teachers, zero paper. The first day the LMS ran for real.',
    imageUrl: '/images/gallery/06.svg',
    width: 1600,
    height: 1000,
    location: 'Depok',
    takenAt: '2023-07-17',
  }),
]
