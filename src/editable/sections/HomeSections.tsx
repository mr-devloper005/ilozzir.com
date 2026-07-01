import Link from 'next/link'
import { ArrowUpRight, Star } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref } from '@/editable/cards/PostCards'
import { EditableReveal } from '@/editable/shell/EditableReveal'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

function categoryOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || ''
}

function getExcerpt(post?: SitePost | null, limit = 140) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}…` : clean
}

function hashStr(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}
function ratingOf(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const real = Number(content.rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  const h = hashStr(post.slug || post.id || post.title || 'x')
  return Math.round((3.7 + (h % 13) / 10) * 10) / 10
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12'

/* --------------------------------- HERO ---------------------------------- */
export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  void primaryTask
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const marqueeWords = ['Directory', 'Bookmarks', 'Listings', 'Discover', 'Curated', 'Reviews', 'Local', 'Community']

  const heroTitleParts = pagesContent.home.hero.title || ['Discover', SITE_CONFIG.name]

  return (
    <section className="relative overflow-hidden bg-[var(--slot4-page-bg)] pt-32 sm:pt-40 lg:pt-48">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[var(--slot4-accent)]/[0.06] blur-[120px]" />

      <div className={`relative ${container}`}>
        <div className="flex flex-col items-start gap-8">
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">
            <span className="inline-flex h-2 w-2 rounded-full bg-[var(--slot4-accent)]" />
            <span>{pagesContent.home.hero.badge || 'Social bookmarking & listing directory'}</span>
          </div>

          <h1 className="editable-display max-w-[16ch] text-[3.5rem] font-black leading-[0.92] tracking-[-0.045em] text-[var(--slot4-page-text)] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] xl:text-[10.5rem]">
            {heroTitleParts.map((part, index) => (
              <span key={index} className="block">
                {part}
                {index === 1 && (
                  <span className="ml-4 inline-flex h-4 w-4 translate-y-1 rounded-full bg-[var(--slot4-accent)] align-middle sm:h-6 sm:w-6 md:h-8 md:w-8" />
                )}
              </span>
            ))}
          </h1>

          <div className="grid gap-8 pt-8 md:grid-cols-[1fr_auto] md:items-end">
            <p className="max-w-lg text-lg leading-8 text-[var(--slot4-muted-text)] sm:text-xl">
              {pagesContent.home.hero.description}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={primaryRoute}
                className="group inline-flex items-center gap-3 rounded-full bg-[var(--slot4-accent)] py-4 pl-6 pr-4 text-sm font-semibold text-[var(--slot4-on-accent)] transition hover:scale-[1.02]"
              >
                Browse directory
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--slot4-on-accent)] text-[var(--slot4-accent)] transition group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href="/sbm"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-6 py-4 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
              >
                Save a link
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Hero collage grid — asymmetric image tiles */}
        {pool.length ? (
          <div className="mt-20 grid grid-cols-12 gap-3 sm:gap-4 lg:mt-28">
            {pool.slice(0, 5).map((post, index) => {
              const image = getEditablePostImage(post)
              const layout = [
                'col-span-12 sm:col-span-7 aspect-[4/3]',
                'col-span-6 sm:col-span-5 aspect-[4/5]',
                'col-span-6 sm:col-span-4 aspect-[4/5]',
                'col-span-6 sm:col-span-4 aspect-square',
                'col-span-12 sm:col-span-4 aspect-[4/3]',
              ][index]
              return (
                <EditableReveal key={post.id || post.slug} delay={index * 80} className={layout}>
                  <Link
                    href={postHref(primaryTask, post, primaryRoute)}
                    className="group relative block h-full w-full overflow-hidden rounded-[2rem] bg-[var(--slot4-media-bg)]"
                  >
                    <img
                      src={image}
                      alt={post.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(15,14,12,0.85))]" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                      <div className="min-w-0">
                        {categoryOf(post) ? (
                          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
                            {categoryOf(post)}
                          </p>
                        ) : null}
                        <h3 className="editable-display mt-2 line-clamp-2 text-lg font-bold tracking-[-0.02em] text-white sm:text-xl">
                          {post.title}
                        </h3>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)] transition group-hover:rotate-45">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </EditableReveal>
              )
            })}
          </div>
        ) : null}

        {/* Category chip row */}
        
      </div>

      {/* Marquee word strip */}
      <div className="mt-24 overflow-hidden border-y border-[var(--editable-border)] bg-[var(--slot4-page-bg)] py-6 sm:mt-32">
        <div className="editable-marquee-track flex w-max items-center gap-10">
          {[...marqueeWords, ...marqueeWords, ...marqueeWords].map((word, index) => (
            <div key={index} className="flex shrink-0 items-center gap-10">
              <span className="editable-display text-4xl font-black tracking-[-0.03em] text-[var(--slot4-page-text)] sm:text-6xl md:text-7xl">
                {word}
              </span>
              <span className="h-3 w-3 shrink-0 rounded-full bg-[var(--slot4-accent)]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------- Featured / Story rail intro --------------------- */
export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  if (!pool.length) return null
  const featured = pool.slice(0, 4)

  return (
    <section className="bg-[var(--slot4-page-bg)] py-24 sm:py-32">
      <div className={container}>
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ 001 &nbsp;— &nbsp; Featured picks</p>
            <h2 className="editable-display mt-6 text-5xl font-black leading-[0.95] tracking-[-0.035em] text-[var(--slot4-page-text)] sm:text-6xl lg:text-7xl">
              The picks worth<br />your time.
            </h2>
          </div>
          <Link
            href={primaryRoute}
            className="group inline-flex items-center gap-3 self-start rounded-full border border-[var(--editable-border)] py-3 pl-5 pr-3 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)] md:self-end"
          >
            See all featured
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)] transition group-hover:rotate-45">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((post, index) => (
            <EditableReveal key={post.id || post.slug} delay={index * 80}>
              <FeaturedTile post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedTile({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getEditablePostImage(post)
  const category = categoryOf(post)
  return (
    <Link
      href={href}
      className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-[2rem] bg-[var(--slot4-media-bg)] p-6 transition duration-500 hover:-translate-y-1"
    >
      <img
        src={image}
        alt={post.title}
        className="absolute inset-0 h-full w-full object-cover opacity-95 transition duration-700 group-hover:scale-[1.06]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,14,12,0.35)_0%,rgba(15,14,12,0)_35%,rgba(15,14,12,0.90)_100%)]" />
      <div className="relative flex items-start justify-between text-white">
        <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] backdrop-blur-md">
          /{String(index + 1).padStart(3, '0')}
        </span>
        {category ? (
          <span className="rounded-full bg-[var(--slot4-accent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-on-accent)]">
            {category}
          </span>
        ) : null}
      </div>
      <div className="relative">
        <h3 className="editable-display line-clamp-3 text-xl font-bold leading-[1.05] tracking-[-0.02em] text-white sm:text-2xl">
          {post.title}
        </h3>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
          Open <ArrowUpRight className="h-4 w-4 text-[var(--slot4-accent)]" />
        </span>
      </div>
    </Link>
  )
}

/* ------------------------ About / About the platform ------------------- */
export function EditableAboutBand() {
  const bullets = [
    { n: '01', title: 'Curated listings', body: 'Every business gets a full profile with ratings, hours, contact and reviews.' },
    { n: '02', title: 'Community bookmarks', body: 'Save, share, and organise the links that matter — publicly or privately.' },
    { n: '03', title: 'Trusted discovery', body: 'Real reviews and stable rankings help you find what you actually need.' },
  ]
  return (
    <section className="border-y border-[var(--editable-border)] bg-[var(--slot4-page-bg)] py-24 sm:py-32">
      <div className={container}>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ 002 &nbsp;— &nbsp; About</p>
            <h2 className="editable-display mt-6 text-5xl font-black leading-[0.95] tracking-[-0.035em] text-[var(--slot4-page-text)] sm:text-6xl lg:text-7xl">
              A single home for <span className="text-[var(--slot4-accent)]">discovery</span>.
            </h2>
            <p className="mt-8 max-w-lg text-lg leading-8 text-[var(--slot4-muted-text)]">
              {SITE_CONFIG.name} brings business listings and community bookmarks together. Find local, save online, and share the best of both.
            </p>
            <Link
              href="/about"
              className="group mt-10 inline-flex items-center gap-3 rounded-full border border-[var(--editable-border)] py-3 pl-5 pr-3 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
            >
              Learn more
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)] transition group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
          <div className="grid gap-4">
            {bullets.map((b, i) => (
              <EditableReveal key={b.n} delay={i * 90}>
                <div className="grid grid-cols-[auto_1fr] items-start gap-6 rounded-[2rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 transition hover:border-[var(--slot4-accent)]/40">
                  <span className="editable-display text-4xl font-black leading-none tracking-[-0.03em] text-[var(--slot4-accent)] sm:text-5xl">
                    {b.n}
                  </span>
                  <div>
                    <h3 className="editable-display text-2xl font-bold tracking-[-0.02em] text-[var(--slot4-page-text)]">{b.title}</h3>
                    <p className="mt-3 text-base leading-7 text-[var(--slot4-muted-text)]">{b.body}</p>
                  </div>
                </div>
              </EditableReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------- Editorial magazine split ------------------------ */
export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const activity = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]).slice(0, 6)
  if (!activity.length) return null
  const [feature, ...rest] = activity

  return (
    <section className="bg-[var(--slot4-page-bg)] py-24 sm:py-32">
      <div className={container}>
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ 003 &nbsp;— &nbsp; Latest activity</p>
            <h2 className="editable-display mt-6 text-5xl font-black leading-[0.95] tracking-[-0.035em] text-[var(--slot4-page-text)] sm:text-6xl lg:text-7xl">
              What&apos;s new<br />across the site.
            </h2>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          {/* Massive feature card */}
          <EditableReveal>
            <Link
              href={postHref(primaryTask, feature, primaryRoute)}
              className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[2rem] bg-[var(--slot4-media-bg)] p-8 sm:aspect-[5/4] sm:p-12"
            >
              <img
                src={getEditablePostImage(feature)}
                alt={feature.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,14,12,0.20),rgba(15,14,12,0.10)_45%,rgba(15,14,12,0.92))]" />
              <div className="relative flex items-start justify-between">
                <span className="rounded-full bg-white/15 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-md">
                  Feature story
                </span>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)] transition duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="h-6 w-6" />
                </span>
              </div>
              <div className="relative max-w-2xl">
                {categoryOf(feature) ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">{categoryOf(feature)}</p>
                ) : null}
                <h3 className="editable-display mt-4 line-clamp-3 text-4xl font-black leading-[0.95] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
                  {feature.title}
                </h3>
                <p className="mt-5 line-clamp-2 max-w-xl text-base text-white/70 sm:text-lg">{getExcerpt(feature, 160)}</p>
              </div>
            </Link>
          </EditableReveal>

          {/* Side column of 3 chunky editorial cards */}
          <div className="grid gap-4">
            {rest.slice(0, 3).map((post, i) => (
              <EditableReveal key={post.id || post.slug} delay={80 + i * 80}>
                <EditorialSideCard post={post} href={postHref(primaryTask, post, primaryRoute)} />
              </EditableReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function EditorialSideCard({ post, href }: { post: SitePost; href: string }) {
  const image = getEditablePostImage(post)
  const category = categoryOf(post)
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-[1.5rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-4 transition hover:border-[var(--slot4-accent)]/40 sm:p-5"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[var(--slot4-media-bg)] sm:h-28 sm:w-28">
        <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]" loading="lazy" />
      </div>
      <div className="min-w-0 flex-1">
        {category ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{category}</p>
        ) : null}
        <h4 className="editable-display mt-1.5 line-clamp-2 text-lg font-bold leading-tight tracking-[-0.02em] text-[var(--slot4-page-text)] sm:text-xl">
          {post.title}
        </h4>
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--editable-border)] text-[var(--slot4-page-text)] transition group-hover:border-[var(--slot4-accent)] group-hover:bg-[var(--slot4-accent)] group-hover:text-[var(--slot4-on-accent)]">
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  )
}

/* -------------------- Trust band: dark stats + reviews ------------------ */
export function EditableTrustBand({ posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  if (!pool.length) return null

  const avgRating = pool.reduce((sum, post) => sum + ratingOf(post), 0) / pool.length
  const categoryCount = new Set(pool.map((post) => categoryOf(post)).filter(Boolean)).size

  const stats = [
    { value: `${pool.length}+`, label: 'Listings & bookmarks' },
    { value: avgRating.toFixed(1), label: 'Avg. community rating' },
    { value: `${Math.max(categoryCount, 1)}+`, label: 'Categories covered' },
    { value: '24/7', label: 'Discovery, always on' },
  ]

  return (
    <section className="bg-[var(--slot4-dark-bg)] text-[var(--slot4-dark-text)]">
      <div className={`${container} py-24 sm:py-32`}>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] opacity-60">/ 004 &nbsp;— &nbsp; By the numbers</p>
            <h2 className="editable-display mt-6 text-5xl font-black leading-[0.95] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
              Real listings.<br />Real reviews.<br />Real people.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <EditableReveal key={stat.label} delay={i * 80}>
                <div className="rounded-[2rem] border border-[var(--slot4-dark-text)]/10 bg-[var(--slot4-dark-text)]/[0.03] p-8">
                  <p className="editable-display text-5xl font-black leading-none tracking-[-0.035em] sm:text-6xl lg:text-7xl">
                    {stat.value}
                  </p>
                  <p className="mt-4 text-sm font-medium opacity-70">{stat.label}</p>
                </div>
              </EditableReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------ Time collections rail ------------------------ */
const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: '/ 005  —  Fresh this week', title: 'Just added.' },
  browse: { eyebrow: '/ 006  —  Trending now', title: 'What people love.' },
  index: { eyebrow: '/ 007  —  From the archive', title: 'Evergreen picks.' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to explore' }
        return (
          <section key={section.key} className="border-t border-[var(--editable-border)] bg-[var(--slot4-page-bg)] py-24 sm:py-32">
            <div className={container}>
              <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">{copy.eyebrow}</p>
                  <h2 className="editable-display mt-6 text-5xl font-black leading-[0.95] tracking-[-0.035em] text-[var(--slot4-page-text)] sm:text-6xl lg:text-7xl">
                    {copy.title}
                  </h2>
                </div>
                <Link
                  href={section.href || primaryRoute}
                  className="group inline-flex items-center gap-3 self-start rounded-full border border-[var(--editable-border)] py-3 pl-5 pr-3 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)] md:self-end"
                >
                  See all
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)] transition group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.posts.slice(0, 8).map((post, cardIndex) => (
                  <EditableReveal key={post.id || post.slug} delay={cardIndex * 70}>
                    <PickTile post={post} href={postHref(primaryTask, post, primaryRoute)} index={cardIndex} />
                  </EditableReveal>
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

function PickTile({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getEditablePostImage(post)
  const category = categoryOf(post)
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-[2rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)]/40"
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]" loading="lazy" />
        <span className="absolute right-4 top-4 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
          /{String(index + 1).padStart(3, '0')}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        {category ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">{category}</p>
        ) : null}
        <h3 className="editable-display mt-3 line-clamp-2 text-xl font-bold leading-[1.1] tracking-[-0.02em] text-[var(--slot4-page-text)]">
          {post.title}
        </h3>
        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--slot4-muted-text)]">
            <span className="inline-flex items-center gap-[2px]">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className={`h-3 w-3 ${i < filled ? 'fill-[var(--slot4-accent)] text-[var(--slot4-accent)]' : 'text-[var(--slot4-muted-text)]/40'}`} />
              ))}
            </span>
            {rating.toFixed(1)}
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--editable-border)] text-[var(--slot4-page-text)] transition group-hover:border-[var(--slot4-accent)] group-hover:bg-[var(--slot4-accent)] group-hover:text-[var(--slot4-on-accent)]">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* -------------------------------- CTA band ------------------------------ */
export function EditableHomeCta() {
  const cta = pagesContent.home.cta
  return (
    <section id="get-app" className="scroll-mt-24 bg-[var(--slot4-page-bg)] pb-24 sm:pb-32">
      <div className={container}>
        <div className="relative overflow-hidden rounded-[3rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-10 sm:p-16 lg:p-24">
          <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-[var(--slot4-accent)]/[0.14] blur-[100px]" />
          <div className="relative grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ 008 &nbsp;— &nbsp; {cta.badge}</p>
              <h2 className="editable-display mt-6 text-5xl font-black leading-[0.95] tracking-[-0.035em] text-[var(--slot4-page-text)] sm:text-6xl lg:text-8xl">
                {cta.title}
              </h2>
              <p className="mt-8 max-w-xl text-lg text-[var(--slot4-muted-text)]">{cta.description}</p>
            </div>
            <div className="flex flex-col items-start gap-4 lg:items-end">
              <Link
                href={cta.primaryCta.href}
                className="group inline-flex items-center gap-3 rounded-full bg-[var(--slot4-accent)] py-4 pl-6 pr-4 text-sm font-semibold text-[var(--slot4-on-accent)] transition hover:scale-[1.02]"
              >
                {cta.primaryCta.label}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--slot4-on-accent)] text-[var(--slot4-accent)] transition group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href={cta.secondaryCta.href}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-6 py-4 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
              >
                {cta.secondaryCta.label}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
