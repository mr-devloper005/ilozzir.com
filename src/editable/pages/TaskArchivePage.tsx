import Link from 'next/link'
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, Download, FileText, Globe, MapPin, Search, Star, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-4 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-4 md:grid-cols-2 xl:grid-cols-3',
  classified: 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-4 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-4 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-4 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

// Shared premium surface: dark cinematic card with soft border, big radius, lift.
const cardBase = 'group block rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1 hover:border-[var(--tk-accent)]/40'

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="relative overflow-hidden border-b border-[var(--tk-line)] pt-32 sm:pt-40 lg:pt-48">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[var(--tk-accent)]/[0.06] blur-[120px]" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-[var(--tk-muted)]">
              <span className="inline-flex h-2 w-2 rounded-full bg-[var(--tk-accent)]" />
              <span>/ {String(page).padStart(3, '0')} &nbsp;— &nbsp; {theme.kicker}</span>
            </div>
            <h1 className="editable-display mt-8 max-w-[16ch] text-balance text-6xl font-black leading-[0.92] tracking-[-0.045em] text-[var(--tk-text)] sm:text-7xl lg:text-[9rem] xl:text-[10.5rem]">
              {voice?.headline || label}
              <span className="ml-4 inline-flex h-4 w-4 translate-y-1 rounded-full bg-[var(--tk-accent)] align-middle sm:h-6 sm:w-6 md:h-8 md:w-8" />
            </h1>
            <p className="mt-10 max-w-2xl text-lg leading-8 text-[var(--tk-muted)] sm:text-xl">{voice?.description || theme.note}</p>
            {voice?.chips?.length ? (
              <div className="mt-8 flex flex-wrap gap-2.5">
                {voice.chips.map((chip) => (
                  <span key={chip} className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-4 py-2 text-xs font-medium text-[var(--tk-muted)]">{chip}</span>
                ))}
              </div>
            ) : null}

            <div className="mt-14 flex flex-col gap-4 border-t border-[var(--tk-line)] pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--tk-muted)]">
                <span className="editable-display text-2xl font-black tracking-[-0.02em] text-[var(--tk-text)]">{posts.length}</span> {posts.length === 1 ? 'post' : 'posts'} <span className="opacity-60">·</span> {categoryLabel}
              </p>
              <form action={basePath} className="flex items-center gap-2.5">
                <div className="relative">
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-11 appearance-none rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] pl-5 pr-11 text-sm font-medium text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-accent)]"
                    aria-label={voice?.filterLabel || 'Filter category'}
                  >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                </div>
                <button className="group inline-flex h-11 items-center gap-2 rounded-full bg-[var(--tk-accent)] pl-5 pr-2 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:scale-[1.02]">
                  Apply
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tk-on-accent)] text-[var(--tk-accent)]">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              </form>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-16 sm:py-20 lg:px-8">
          {task === 'listing' ? (
            <div className="mb-12">
              <Ads slot="in-feed" showLabel className="mx-auto w-full" />
            </div>
          ) : null}

          {posts.length ? (
            <div className={taskGrid[task]}>
              {posts.map((post, index) => (
                <EditableReveal key={post.id || post.slug} delay={Math.min(index, 8) * 70} className={task === 'listing' || task === 'sbm' ? (index === 0 ? 'sm:col-span-2' : '') : ''}>
                  <ArchivePostCard post={post} task={task} basePath={basePath} index={index} featured={(task === 'listing' || task === 'sbm') && index === 0} />
                </EditableReveal>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-[var(--tk-radius)] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-2xl font-semibold tracking-[-0.02em]">Nothing here yet</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Try another category, or check back after new {label.toLowerCase()} are published.</p>
            </div>
          )}

          {task === 'sbm' && posts.length ? (
            <div className="mt-12">
              <Ads slot="article-bottom" showLabel className="mx-auto w-full" />
            </div>
          ) : null}

          {posts.length ? (
            <nav className="mt-16 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">Previous</Link> : null}
              <span className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-2.5 font-medium text-[var(--tk-muted)]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-accent)]">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index, featured = false }: { post: SitePost; task: TaskKey; basePath: string; index: number; featured?: boolean }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} index={index} featured={featured} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} featured={featured} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

// Star ratings. Prefers real rating/review fields, falls back to a stable
// derived value so the UI always reads well (wire to real data later).
const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}
const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.7 + (hashStr(post.slug || post.id || post.title || 'x') % 13) / 10) * 10) / 10
}
const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function RatingLine({ post, center = false }: { post: SitePost; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-2.5 flex items-center gap-2 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">({reviewsOf(post)})</span>
    </div>
  )
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Article')
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <Link href={href} className={`${cardBase} flex flex-col overflow-hidden`}>
      <div className="relative aspect-[5/4] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
        <span className="absolute right-4 top-4 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
          /{String(index + 1).padStart(3, '0')}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--tk-accent)]">{category}</p>
        <h2 className="editable-display mt-3 line-clamp-2 text-2xl font-bold leading-[1.05] tracking-[-0.02em] text-[var(--tk-text)]">{post.title}</h2>
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-5 flex items-center justify-between border-t border-[var(--tk-line)] pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--tk-muted)]">
            <span className="inline-flex items-center gap-[2px]">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className={`h-3 w-3 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'text-[var(--tk-muted)]/40'}`} />
              ))}
            </span>
            {rating.toFixed(1)}
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--tk-line)] text-[var(--tk-text)] transition group-hover:border-[var(--tk-accent)] group-hover:bg-[var(--tk-accent)] group-hover:text-[var(--tk-on-accent)]">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href, index, featured = false }: { post: SitePost; href: string; index: number; featured?: boolean }) {
  const image = getImage(post)
  const location = getField(post, ['location', 'address', 'city'])
  const category = getCategory(post, 'Business')
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <Link href={href} className={`${cardBase} flex h-full flex-col overflow-hidden`}>
      <div className={`relative overflow-hidden bg-[var(--tk-raised)] ${featured ? 'aspect-[16/9]' : 'aspect-[5/4]'}`}>
        {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" /> : <div className="flex h-full items-center justify-center"><BriefcaseBusiness className="h-12 w-12 text-[var(--tk-muted)]" /></div>}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.55))]" />
        <span className="absolute left-4 top-4 rounded-full bg-[var(--tk-accent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--tk-on-accent)]">
          {category}
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
          /{String(index + 1).padStart(3, '0')}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h2 className={`editable-display line-clamp-2 font-bold leading-[1.05] tracking-[-0.02em] text-[var(--tk-text)] ${featured ? 'text-3xl' : 'text-2xl'}`}>{post.title}</h2>
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        {location ? (
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--tk-muted)]">
            <MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}
          </p>
        ) : null}
        <div className="mt-5 flex items-center justify-between border-t border-[var(--tk-line)] pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--tk-muted)]">
            <span className="inline-flex items-center gap-[2px]">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className={`h-3 w-3 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'text-[var(--tk-muted)]/40'}`} />
              ))}
            </span>
            {rating.toFixed(1)}
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--tk-line)] text-[var(--tk-text)] transition group-hover:border-[var(--tk-accent)] group-hover:bg-[var(--tk-accent)] group-hover:text-[var(--tk-on-accent)]">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-6 sm:p-7`}>
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-3xl font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</span>
        {condition ? <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">{condition}</span> : null}
      </div>
      <h2 className="editable-display mt-5 text-xl font-semibold leading-snug tracking-[-0.02em]">{post.title}</h2>
      <RatingLine post={post} />
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <div className="mt-6 flex items-center justify-between border-t border-[var(--tk-line)] pt-4 text-xs font-medium text-[var(--tk-muted)]">
        <span className="inline-flex items-center gap-1.5">{location ? <><MapPin className="h-3.5 w-3.5" /> {location}</> : 'Details inside'}</span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)] transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link href={href} className="group mb-5 block break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.78))] opacity-80 transition group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h2 className="editable-display line-clamp-2 text-lg font-semibold leading-snug tracking-[-0.02em] text-white">{post.title}</h2>
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-white/70">View image <ArrowUpRight className="h-3.5 w-3.5" /></span>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index, featured = false }: { post: SitePost; href: string; index: number; featured?: boolean }) {
  const website = getField(post, ['website', 'url', 'link'])
  const category = getCategory(post, 'Bookmark')
  return (
    <Link href={href} className={`${cardBase} flex h-full flex-col justify-between p-8 ${featured ? 'aspect-[16/9]' : 'aspect-square'}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--tk-accent)] text-[var(--tk-on-accent)]">
          <Globe className="h-5 w-5" />
        </span>
        <span className="flex flex-col items-end gap-1 text-right">
          <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--tk-accent)]">
            {category}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">/{String(index + 1).padStart(3, '0')}</span>
        </span>
      </div>
      <div>
        <h2 className={`editable-display line-clamp-3 font-bold leading-[1.05] tracking-[-0.02em] text-[var(--tk-text)] ${featured ? 'text-4xl' : 'text-2xl'}`}>{post.title}</h2>
        <p className={`mt-4 line-clamp-2 leading-6 text-[var(--tk-muted)] ${featured ? 'text-base' : 'text-sm'}`}>{getSummary(post)}</p>
        <div className="mt-6 flex items-center justify-between border-t border-[var(--tk-line)] pt-4">
          {website ? <p className="truncate text-xs font-medium text-[var(--tk-accent)]">{cleanDomain(website)}</p> : <span className="text-xs font-medium text-[var(--tk-muted)]">Saved bookmark</span>}
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--tk-line)] text-[var(--tk-text)] transition group-hover:border-[var(--tk-accent)] group-hover:bg-[var(--tk-accent)] group-hover:text-[var(--tk-on-accent)]">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const category = getCategory(post, 'Document')
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-6 sm:p-7`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-6 w-6" /></div>
        <span className="rounded-full border border-[var(--tk-line)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{category}</span>
      </div>
      <h2 className="editable-display mt-6 text-xl font-semibold leading-snug tracking-[-0.02em]">{post.title}</h2>
      <RatingLine post={post} />
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">Open document <Download className="h-4 w-4" /></span>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col items-center p-7 text-center`}>
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />}
      </div>
      <h2 className="editable-display mt-5 text-lg font-semibold tracking-[-0.02em]">{post.title}</h2>
      {role ? <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
      <RatingLine post={post} center />
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}
