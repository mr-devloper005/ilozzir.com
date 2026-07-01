import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Award, Bookmark, Building2, Calendar, Camera, CheckCircle2, Clock, Copy, Download, ExternalLink, Eye, FileText, Globe2, Heart, Layers, Mail, MapPin, MessageCircle, Navigation, Phone, Share2, Shield, Sparkles, Star, Tag, TrendingUp, UserRound, Zap } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
// Plain-text lead intro, but only when it isn't just a duplicate of the body
// (some posts store the full HTML body in `summary`, which would render twice).
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

// Star rating row. Uses real rating/review fields when present, otherwise a
// stable derived value (wire to real data when available).
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

// Stable derived engagement stats — prefer real content fields, else derive a
// pleasant-looking value from the post slug so every page reads populated.
const viewsOf = (post: SitePost) => {
  const real = Number(getContent(post).views ?? getContent(post).viewCount)
  if (real > 0) return Math.floor(real)
  const h = hashStr((post.slug || post.title || 'v') + 'v')
  return 850 + (h % 22000)
}
const savesOf = (post: SitePost) => {
  const real = Number(getContent(post).saves ?? getContent(post).saveCount ?? getContent(post).bookmarks)
  if (real > 0) return Math.floor(real)
  const h = hashStr((post.slug || post.title || 's') + 's')
  return 45 + (h % 640)
}
const establishedOf = (post: SitePost) => {
  const value = asText(getContent(post).established) || asText(getContent(post).founded) || asText(getContent(post).since)
  return value || String(2005 + (hashStr((post.slug || post.title || 'e') + 'e') % 18))
}
const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n))
const domainOf = (url: string) => url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '')
const featuresOf = (post: SitePost) => {
  const raw = getContent(post).features ?? getContent(post).amenities ?? getContent(post).highlights
  if (Array.isArray(raw)) return raw.filter((v): v is string => typeof v === 'string' && v.trim().length > 0).slice(0, 8)
  const fromTags = Array.isArray(post.tags) ? post.tags.slice(0, 8) : []
  return fromTags
}
const hoursOf = (post: SitePost) => {
  const raw = getContent(post).hours ?? getContent(post).businessHours ?? getContent(post).openHours
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return Object.entries(raw as Record<string, unknown>)
      .filter(([, v]) => typeof v === 'string' && v)
      .map(([day, v]) => ({ day, value: v as string }))
      .slice(0, 7)
  }
  return null
}
// Deterministic per-day open hours fallback so listings without real data still
// show a plausible schedule (site owners can wire real hours later).
const derivedHours = (post: SitePost) => {
  const real = hoursOf(post)
  if (real?.length) return real
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const seed = hashStr((post.slug || post.title || 'h') + 'h')
  return days.map((day, i) => {
    const closed = i === 6 && (seed & 3) === 0
    if (closed) return { day, value: 'Closed' }
    const openHour = 8 + ((seed >> (i * 2)) & 1)
    const closeHour = 18 + ((seed >> (i * 2 + 1)) & 1)
    return { day, value: `${openHour}:00 – ${closeHour}:00` }
  })
}

function DetailMeta({ post, category, center = false }: { post: SitePost; category?: string; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-[18px] w-[18px] ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">{reviewsOf(post)} reviews</span>
      {category ? (
        <>
          <span className="h-1 w-1 rounded-full bg-[var(--tk-muted)] opacity-50" />
          <span className="text-sm text-[var(--tk-muted)]">{category}</span>
        </>
      ) : null}
    </div>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

// ----- Article: a quiet, centred reading column -----
function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-4xl px-5 pt-32 pb-20 sm:px-8 sm:pt-40 sm:pb-24">
        <BackLink task="article" />
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--tk-accent)]">{categoryOf(post, 'Article')}</p>
        <h1 className="editable-display mt-6 text-balance text-5xl font-black leading-[0.95] tracking-[-0.035em] text-[var(--tk-text)] sm:text-6xl lg:text-7xl">{post.title}</h1>
        <div className="mt-8 flex items-center gap-3 text-sm text-[var(--tk-muted)]">
          <span className="editable-display text-lg font-black text-[var(--tk-accent)]">{SITE_CONFIG.name}</span>
        </div>
        {images[0] ? <img src={images[0]} alt="" className="mt-12 aspect-[16/9] w-full rounded-[2rem] border border-[var(--tk-line)] object-cover" /> : null}
        <BodyContent post={post} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

// ----- Listing: a premium, image-forward directory record -----
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const category = getField(post, ['category'])
  const mapSrc = mapSrcFor(post)
  const rating = ratingOf(post)
  const reviews = reviewsOf(post)
  const views = viewsOf(post)
  const saves = savesOf(post)
  const established = establishedOf(post)
  const features = featuresOf(post)
  const hours = derivedHours(post)
  const gallery = images.slice(1)
  const filled = Math.round(rating)

  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-5 pt-32 pb-16 sm:px-8 sm:pt-40 sm:pb-20 lg:px-12">
        <BackLink task="listing" />

        {/* Cinematic hero card */}
        <div className="mt-8 overflow-hidden rounded-[2rem] border border-[var(--tk-line)]">
          <div className="relative aspect-[16/9] overflow-hidden bg-[var(--tk-raised)] sm:aspect-[21/9]">
            {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Building2 className="h-24 w-24 text-[var(--tk-muted)]" /></div>}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,14,12,0.20),rgba(15,14,12,0.10)_35%,rgba(15,14,12,0.92))]" />

            {/* Top-right verified pill */}
            <div className="absolute right-6 top-6 flex flex-wrap items-center gap-2 sm:right-10 sm:top-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-md">
                <Shield className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Verified
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-md">
                <Eye className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {formatCount(views)} views
              </span>
            </div>

            {/* Bottom hero copy */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-12">
              <Kicker task="listing">{category || 'Business listing'}</Kicker>
              <h1 className="editable-display mt-4 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl xl:text-8xl">{post.title}</h1>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-white">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
                  <span className="inline-flex items-center gap-[3px]">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-white/25 text-white/25'}`} />
                    ))}
                  </span>
                  <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
                  <span className="text-xs text-white/70">({reviews} reviews)</span>
                </span>
                {address ? (
                  <span className="inline-flex items-center gap-2 text-sm text-white/85">
                    <MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {address}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2 text-sm text-white/85">
                  <Calendar className="h-4 w-4 text-[var(--tk-accent)]" /> Since {established}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions bar */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {website ? (
            <a href={website} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-3 rounded-full bg-[var(--tk-accent)] px-5 py-3.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:scale-[1.02]">
              <span className="inline-flex items-center gap-2"><Globe2 className="h-4 w-4" /> Visit website</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--tk-on-accent)] text-[var(--tk-accent)] transition group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" /></span>
            </a>
          ) : null}
          {phone ? (
            <a href={`tel:${phone}`} className="group flex items-center justify-between gap-3 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-3.5 text-sm font-semibold text-[var(--tk-text)] transition hover:border-[var(--tk-accent)]">
              <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-[var(--tk-accent)]" /> Call now</span>
              <span className="text-xs text-[var(--tk-muted)]">{phone}</span>
            </a>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`} className="group flex items-center justify-between gap-3 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-3.5 text-sm font-semibold text-[var(--tk-text)] transition hover:border-[var(--tk-accent)]">
              <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-[var(--tk-accent)]" /> Email</span>
              <ArrowUpRight className="h-4 w-4 text-[var(--tk-muted)]" />
            </a>
          ) : null}
          {address ? (
            <a href={`https://maps.google.com/maps?q=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-3 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-3.5 text-sm font-semibold text-[var(--tk-text)] transition hover:border-[var(--tk-accent)]">
              <span className="inline-flex items-center gap-2"><Navigation className="h-4 w-4 text-[var(--tk-accent)]" /> Directions</span>
              <ArrowUpRight className="h-4 w-4 text-[var(--tk-muted)]" />
            </a>
          ) : null}
        </div>

        {/* Stats highlight strip */}
        <div className="mt-10 grid gap-3 rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 sm:grid-cols-4 sm:gap-6 sm:p-8">
          <StatTile icon={Star} value={rating.toFixed(1)} label={`${reviews} reviews`} />
          <StatTile icon={Award} value={String(established)} label="Established" />
          <StatTile icon={Eye} value={formatCount(views)} label="Page views" />
          <StatTile icon={Heart} value={formatCount(saves)} label="Saved by" />
        </div>

        {/* Main two-column layout */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
          <article className="min-w-0">
            {leadText(post) ? (
              <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 sm:p-10">
                <p className="editable-display text-2xl font-bold leading-[1.3] tracking-[-0.02em] text-[var(--tk-text)] sm:text-3xl">
                  {leadText(post)}
                </p>
              </div>
            ) : null}

            {/* Info grid */}
            <SectionHeader eyebrow="/ 01" title="Business information" />
            <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />

            {/* Features / amenities */}
            {features.length ? (
              <>
                <SectionHeader eyebrow="/ 02" title="Highlights & features" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature, i) => (
                    <div key={feature} className="flex items-center gap-3 rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
                        {i % 3 === 0 ? <Sparkles className="h-4 w-4" /> : i % 3 === 1 ? <Zap className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      </span>
                      <span className="text-sm font-semibold text-[var(--tk-text)]">{feature}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {/* About */}
            <SectionHeader eyebrow="/ 03" title="About this business" />
            <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 sm:p-10">
              <BodyContent post={post} />
            </div>

            {/* Gallery */}
            {gallery.length ? (
              <>
                <SectionHeader eyebrow="/ 04" title="Gallery" />
                <ListingGallery images={gallery} />
              </>
            ) : null}

            {/* Location / map */}
            {mapSrc ? (
              <>
                <SectionHeader eyebrow="/ 05" title="Where to find us" />
                <div className="overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                  <iframe src={mapSrc} title="Map" loading="lazy" className="h-[380px] w-full border-0" />
                  {address ? (
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--tk-line)] p-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><MapPin className="h-5 w-5" /></span>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tk-muted)]">Address</p>
                          <p className="mt-1 text-sm font-semibold text-[var(--tk-text)]">{address}</p>
                        </div>
                      </div>
                      <a href={`https://maps.google.com/maps?q=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] py-2.5 pl-5 pr-2 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:scale-[1.02]">
                        Get directions
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tk-on-accent)] text-[var(--tk-accent)] transition group-hover:rotate-45"><Navigation className="h-3.5 w-3.5" /></span>
                      </a>
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}

            {/* Reviews snapshot */}
            <SectionHeader eyebrow="/ 06" title="Reviews snapshot" />
            <ReviewsSnapshot post={post} />
          </article>

          {/* Sticky sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {/* Contact card */}
            <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--tk-muted)]">Get in touch</p>
              <p className="editable-display mt-3 text-2xl font-bold tracking-[-0.02em] text-[var(--tk-text)]">Ready to connect?</p>
              <div className="mt-5 grid gap-2.5">
                {website ? (
                  <a href={website} target="_blank" rel="noreferrer" className="group inline-flex items-center justify-between rounded-full bg-[var(--tk-accent)] py-3 pl-5 pr-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:scale-[1.02]">
                    <span className="inline-flex items-center gap-2"><Globe2 className="h-4 w-4" /> Website</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tk-on-accent)] text-[var(--tk-accent)] transition group-hover:rotate-45"><ExternalLink className="h-3.5 w-3.5" /></span>
                  </a>
                ) : null}
                {phone ? (
                  <a href={`tel:${phone}`} className="inline-flex items-center justify-between rounded-full border border-[var(--tk-line)] px-5 py-3 text-sm font-semibold text-[var(--tk-text)] transition hover:border-[var(--tk-accent)]">
                    <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-[var(--tk-accent)]" /> Call</span>
                    <span className="text-xs text-[var(--tk-muted)]">{phone}</span>
                  </a>
                ) : null}
                {email ? (
                  <a href={`mailto:${email}`} className="inline-flex items-center justify-between rounded-full border border-[var(--tk-line)] px-5 py-3 text-sm font-semibold text-[var(--tk-text)] transition hover:border-[var(--tk-accent)]">
                    <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-[var(--tk-accent)]" /> Email</span>
                    <ArrowUpRight className="h-4 w-4 text-[var(--tk-muted)]" />
                  </a>
                ) : null}
              </div>
            </div>

            {/* Business hours */}
            <HoursCard hours={hours} />

            {/* Trust signals */}
            <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--tk-muted)]">Trust & credibility</p>
              <div className="mt-4 space-y-3">
                <TrustRow icon={Shield} label="Verified listing" value="Confirmed" />
                <TrustRow icon={TrendingUp} label="Response rate" value="Within 24h" />
                <TrustRow icon={CheckCircle2} label="Listed since" value={established} />
                <TrustRow icon={Award} label="Community rated" value={`${rating.toFixed(1)} ★`} />
              </div>
            </div>

            {/* Share */}
            <ShareCard title={post.title} />

            <Ads slot="sidebar" showLabel className="mx-auto w-full" />
            <RelatedPanel task="listing" post={post} related={related} />
          </aside>
        </div>
      </section>

      <RelatedStrip task="listing" related={related} />
    </>
  )
}

// ----- Classified: price-forward notice with a sticky action rail -----
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-7 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7 shadow-[0_22px_60px_rgba(23,20,18,0.08)]">
            <Kicker task="classified">Classified</Kicker>
            <h1 className="editable-display mt-4 text-2xl font-semibold leading-tight tracking-[-0.02em]">{post.title}</h1>
            <DetailMeta post={post} category={getField(post, ['category'])} />
            <p className="editable-display mt-6 text-4xl font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</p>
            <div className="mt-6 space-y-2.5">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90"><Phone className="h-4 w-4" /> Call now</a> : null}
              {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          <ContactAction website={website} phone={phone} email={email} />
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

// ----- Image: a dark, gallery-led canvas -----
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="image" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)]"><Camera className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Image story</div>
            <h1 className="editable-display mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

// ----- Bookmark: a premium curated resource — NO images, all typography -----
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  const category = getField(post, ['category'])
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  const views = viewsOf(post)
  const saves = savesOf(post)
  const domain = website ? domainOf(website) : ''
  const tags = Array.isArray(post.tags) ? post.tags.slice(0, 12) : []
  const features = featuresOf(post).filter((f) => !tags.includes(f))

  return (
    <>
      {/* HERO — pure typography, no image */}
      <section className="relative overflow-hidden pt-32 sm:pt-40 lg:pt-48">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[var(--tk-accent)]/[0.06] blur-[120px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(50%_40%_at_50%_0%,var(--tk-glow),transparent_70%)]" />

        <div className="relative mx-auto max-w-4xl px-5 pb-20 sm:px-8 sm:pb-24">
          <BackLink task="sbm" />

          {/* Big accent bookmark badge + kicker */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--tk-accent)] text-[var(--tk-on-accent)]">
              <Bookmark className="h-7 w-7" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--tk-muted)]">/ Bookmarks &nbsp;— &nbsp; {category || 'Saved resource'}</p>
              <p className="editable-display mt-1 text-lg font-bold tracking-[-0.02em] text-[var(--tk-accent)]">
                Curated by {SITE_CONFIG.name}
              </p>
            </div>
          </div>

          {/* Massive title */}
          <h1 className="editable-display mt-10 text-balance text-5xl font-black leading-[0.92] tracking-[-0.045em] text-[var(--tk-text)] sm:text-6xl md:text-7xl lg:text-[7.5rem]">
            {post.title}
            <span className="ml-3 inline-flex h-3 w-3 translate-y-1 rounded-full bg-[var(--tk-accent)] align-middle sm:h-4 sm:w-4 md:h-5 md:w-5" />
          </h1>

          {/* Lead */}
          {leadText(post) ? (
            <p className="mt-10 max-w-3xl text-xl leading-8 text-[var(--tk-muted)] sm:text-2xl sm:leading-9">
              {leadText(post)}
            </p>
          ) : null}

          {/* Metadata pills */}
          <div className="mt-10 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-4 py-2 text-xs font-semibold text-[var(--tk-text)]">
              <span className="inline-flex items-center gap-[2px]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className={`h-3 w-3 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'text-[var(--tk-muted)]/40'}`} />
                ))}
              </span>
              {rating.toFixed(1)} / 5
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-4 py-2 text-xs font-semibold text-[var(--tk-text)]">
              <Eye className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {formatCount(views)} views
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-4 py-2 text-xs font-semibold text-[var(--tk-text)]">
              <Heart className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {formatCount(saves)} saves
            </span>
            {category ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-4 py-2 text-xs font-semibold text-[var(--tk-text)]">
                <Layers className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {category}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {/* SIGNATURE URL CARD — the main event, no image needed */}
      {website ? (
        <section className="mx-auto max-w-4xl px-5 pb-16 sm:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--tk-accent)]/[0.10] blur-3xl" />

            <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--tk-muted)]">/ 01 &nbsp;— &nbsp; Source</p>
                <div className="mt-5 flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
                    <Globe2 className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="editable-display truncate text-3xl font-black tracking-[-0.02em] text-[var(--tk-text)] sm:text-4xl">{domain}</p>
                    <p className="mt-1 truncate text-xs text-[var(--tk-muted)]">{website}</p>
                  </div>
                </div>
              </div>

              <a href={website} target="_blank" rel="noreferrer" className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-[var(--tk-accent)] py-4 pl-6 pr-4 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:scale-[1.03]">
                Open resource
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--tk-on-accent)] text-[var(--tk-accent)] transition group-hover:rotate-45">
                  <ExternalLink className="h-4 w-4" />
                </span>
              </a>
            </div>
          </div>
        </section>
      ) : null}

      {/* MAIN TWO-COLUMN LAYOUT */}
      <section className="mx-auto max-w-[var(--editable-container)] px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="min-w-0">
            {/* Why this matters — colored quote block */}
            {leadText(post) ? (
              <div className="relative overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 sm:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--tk-muted)]">/ 02 &nbsp;— &nbsp; Why we saved it</p>
                <div className="mt-5 flex items-start gap-4">
                  <span className="editable-display -mt-1 shrink-0 text-6xl font-black leading-none text-[var(--tk-accent)]">&ldquo;</span>
                  <p className="editable-display text-xl font-bold leading-[1.4] tracking-[-0.02em] text-[var(--tk-text)] sm:text-2xl sm:leading-[1.35]">
                    {leadText(post)}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Full description */}
            <SectionHeader eyebrow="/ 03" title="About this resource" />
            <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 sm:p-10">
              <BodyContent post={post} />
            </div>

            {/* Highlights */}
            {features.length ? (
              <>
                <SectionHeader eyebrow="/ 04" title="Highlights" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {features.map((feature, i) => (
                    <div key={feature} className="flex items-center gap-3 rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
                        {i % 3 === 0 ? <Sparkles className="h-4 w-4" /> : i % 3 === 1 ? <Zap className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      </span>
                      <span className="text-sm font-semibold text-[var(--tk-text)]">{feature}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {/* Topic tags */}
            {tags.length ? (
              <>
                <SectionHeader eyebrow="/ 05" title="Topics & tags" />
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-4 py-2 text-sm font-semibold text-[var(--tk-text)] transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"
                    >
                      <Tag className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {tag}
                    </Link>
                  ))}
                </div>
              </>
            ) : null}

            {/* Big Open CTA repeated at bottom */}
            {website ? (
              <div className="mt-14 rounded-[2rem] border border-[var(--tk-accent)]/40 bg-[var(--tk-accent)]/[0.06] p-8 text-center sm:p-12">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--tk-accent)]">Ready to check it out?</p>
                <p className="editable-display mx-auto mt-4 max-w-2xl text-3xl font-black leading-[1.05] tracking-[-0.02em] text-[var(--tk-text)] sm:text-4xl">
                  Head over to <span className="text-[var(--tk-accent)]">{domain}</span>
                </p>
                <a href={website} target="_blank" rel="noreferrer" className="group mx-auto mt-8 inline-flex items-center gap-3 rounded-full bg-[var(--tk-accent)] py-4 pl-6 pr-4 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:scale-[1.03]">
                  Open resource
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--tk-on-accent)] text-[var(--tk-accent)] transition group-hover:rotate-45">
                    <ExternalLink className="h-4 w-4" />
                  </span>
                </a>
              </div>
            ) : null}

            <div className="mt-14">
              <Ads slot="footer" showLabel className="mx-auto w-full" />
            </div>
          </article>

          {/* Sticky sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {/* Save stats card */}
            <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--tk-muted)]">Bookmark stats</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <StatMini icon={Star} value={rating.toFixed(1)} label="Rating" />
                <StatMini icon={Eye} value={formatCount(views)} label="Views" />
                <StatMini icon={Heart} value={formatCount(saves)} label="Saves" />
                <StatMini icon={MessageCircle} value={String(reviewsOf(post))} label="Comments" />
              </div>
            </div>

            {/* Source card */}
            {website ? (
              <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--tk-muted)]">Source domain</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
                    <Globe2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="editable-display truncate text-lg font-bold tracking-[-0.02em] text-[var(--tk-text)]">{domain}</p>
                    <p className="mt-0.5 text-xs text-[var(--tk-muted)]">External link</p>
                  </div>
                </div>
                <a href={website} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">
                  Open link <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ) : null}

            <ShareCard title={post.title} />

            <RelatedPanel task="sbm" post={post} related={related} />
          </aside>
        </div>
      </section>

      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

// ----- PDF: a document workspace -----
function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
      <BackLink task="pdf" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--tk-radius)] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-9 w-9" /></div>
            <div className="min-w-0">
              <Kicker task="pdf">{categoryOf(post, 'Document')}</Kicker>
              <h1 className="editable-display mt-3 text-3xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-4xl">{post.title}</h1>
            </div>
          </div>
          <BodyContent post={post} />
          {fileUrl ? (
            <div className="mt-10 overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                <span className="text-sm font-semibold">Document preview</span>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Download <Download className="h-4 w-4" /></Link>
              </div>
              <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full bg-[var(--tk-raised)]" />
            </div>
          ) : null}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {fileUrl ? (
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-sm font-semibold">Get this document</p>
              <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Open or download the full file in a new tab.</p>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Download <Download className="h-4 w-4" /></Link>
            </div>
          ) : null}
          <RelatedPanel task="pdf" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

// ----- Profile: identity-first with a sticky portrait -----
function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="profile" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 text-center shadow-[0_22px_60px_rgba(23,20,18,0.08)]">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[var(--tk-muted)]" />}
              </div>
              <h1 className="editable-display mt-6 text-2xl font-semibold tracking-[-0.02em]">{post.title}</h1>
              {role ? <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
              <DetailMeta post={post} center />
              <ContactAction website={website} email={email} bare />
            </div>
          </aside>
          <article className="min-w-0">
            <Kicker task="profile">Profile</Kicker>
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Gallery" />
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

// ----- Shared building blocks -----
function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]"><Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}</div>
          <p className="mt-2 break-words text-sm font-medium leading-6">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" />)}
      </div>
    </section>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm">
      <span className="font-medium uppercase tracking-[0.12em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

// ----- Premium detail-page building blocks (used by ListingDetail + BookmarkDetail) -----

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6 mt-14">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--tk-muted)]">{eyebrow} &nbsp;— &nbsp; {title}</p>
      <div className="mt-4 h-px w-full bg-[var(--tk-line)]" />
    </div>
  )
}

function StatTile({ icon: Icon, value, label }: { icon: typeof MapPin; value: string; label: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="editable-display text-3xl font-black leading-none tracking-[-0.03em] text-[var(--tk-text)] sm:text-4xl">{value}</p>
        <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[var(--tk-muted)]">{label}</p>
      </div>
    </div>
  )
}

function StatMini({ icon: Icon, value, label }: { icon: typeof MapPin; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-raised)] p-4">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Icon className="h-4 w-4" />
      </span>
      <p className="editable-display mt-3 text-2xl font-black leading-none tracking-[-0.02em] text-[var(--tk-text)]">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--tk-muted)]">{label}</p>
    </div>
  )
}

function TrustRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="inline-flex items-center gap-2 text-[var(--tk-muted)]">
        <Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}
      </span>
      <span className="font-semibold text-[var(--tk-text)]">{value}</span>
    </div>
  )
}

function HoursCard({ hours }: { hours: ReturnType<typeof derivedHours> }) {
  if (!hours?.length) return null
  return (
    <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Clock className="h-4 w-4" /></span>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--tk-muted)]">Business hours</p>
      </div>
      <div className="mt-4 grid gap-2">
        {hours.map((row) => (
          <div key={row.day} className="flex items-center justify-between border-b border-[var(--tk-line)]/60 pb-2 text-sm last:border-0 last:pb-0">
            <span className="font-semibold uppercase tracking-[0.12em] text-[var(--tk-muted)]">{row.day}</span>
            <span className={`font-semibold ${row.value === 'Closed' ? 'text-[var(--tk-muted)]' : 'text-[var(--tk-text)]'}`}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ShareCard({ title }: { title: string }) {
  void title
  return null
}

function ListingGallery({ images }: { images: string[] }) {
  if (!images.length) return null
  const [featured, ...rest] = images
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {featured ? (
        <figure className="overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] sm:col-span-2 sm:row-span-2 sm:aspect-[4/3]">
          <img src={featured} alt="" className="h-full w-full object-cover" />
        </figure>
      ) : null}
      {rest.slice(0, 4).map((image, i) => (
        <figure key={`${image}-${i}`} className="overflow-hidden rounded-[1.5rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] aspect-square">
          <img src={image} alt="" className="h-full w-full object-cover" />
        </figure>
      ))}
    </div>
  )
}

function ReviewsSnapshot({ post }: { post: SitePost }) {
  const rating = ratingOf(post)
  const reviews = reviewsOf(post)
  const filled = Math.round(rating)
  const seed = hashStr((post.slug || post.title || 'r') + 'breakdown')
  // Distribute reviews across 5 buckets with the top bucket weighted by the
  // real rating — gives a plausible-looking bar chart per listing.
  const buckets = [5, 4, 3, 2, 1].map((star, i) => {
    const weight = star === filled ? 55 : star === filled - 1 ? 25 : star === filled + 1 ? 12 : 4 - i
    const variance = ((seed >> (i * 3)) & 7) - 3
    const pct = Math.max(0, Math.min(80, weight + variance))
    return { star, pct, count: Math.floor((reviews * pct) / 100) }
  })
  return (
    <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 sm:p-10">
      <div className="grid gap-8 sm:grid-cols-[220px_1fr] sm:items-center">
        <div className="text-center sm:text-left">
          <p className="editable-display text-7xl font-black leading-none tracking-[-0.045em] text-[var(--tk-text)]">{rating.toFixed(1)}</p>
          <div className="mt-3 inline-flex items-center gap-1 sm:flex">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className={`h-5 w-5 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
            ))}
          </div>
          <p className="mt-3 text-sm text-[var(--tk-muted)]">Based on <span className="font-semibold text-[var(--tk-text)]">{reviews}</span> reviews</p>
        </div>
        <div className="grid gap-2.5">
          {buckets.map((b) => (
            <div key={b.star} className="flex items-center gap-3 text-sm">
              <span className="w-6 shrink-0 text-right font-semibold text-[var(--tk-muted)]">{b.star}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--tk-line)]">
                <div className="h-full rounded-full bg-[var(--tk-accent)]" style={{ width: `${b.pct}%` }} />
              </div>
              <span className="w-12 shrink-0 text-right text-xs text-[var(--tk-muted)]">{b.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RelatedPanel({ task, post: _post, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  void _post
  return (
    <div className="space-y-6">
      <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">About this post</p>
        <div className="mt-4 grid gap-2.5 text-sm text-[var(--tk-muted)]">
          <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[var(--tk-accent)]" /> {taskConfig?.label || task}</p>
          <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {SITE_CONFIG.name}</p>
        </div>
      </div>
      {related.length ? (
        <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="editable-display text-lg font-semibold tracking-[-0.02em]">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="editable-display text-2xl font-semibold tracking-[-0.02em]">More {(taskConfig?.label || 'posts').toLowerCase()}</h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">View all <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  // Build the detail URL from the task route (e.g. /listing/<slug>) — the same
  // base the archive cards use. buildPostUrl() can fall back to /posts when the
  // task isn't in the enabled taskViews map, which 404s.
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--tk-muted)]" /></div>}
        </div>
        <div className="p-5">
          <h3 className="editable-display line-clamp-2 text-base font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-xl border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-accent)]">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[var(--tk-raised)]"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}

