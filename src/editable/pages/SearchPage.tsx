import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Filter, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { pagesContent } from '@/editable/content/pages.content'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const parseSummaryText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim() : ''
const compactText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? content.images.find((item) => typeof item === 'string') as string | undefined : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const compactRaw = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const summaryOf = (post: SitePost) => {
  const content = getContent(post)
  return parseSummaryText(post.summary) || parseSummaryText(content.description) || parseSummaryText(content.excerpt)
}

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Post'
  const strong = index % 5 === 0

  return (
    <EditableReveal delay={Math.min(index, 8) * 60} className={strong ? 'md:col-span-2' : ''}>
      <Link href={href} className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)]/40">
        {image ? (
          <div className={`relative overflow-hidden bg-[var(--slot4-media-bg)] ${strong ? 'aspect-[16/7]' : 'aspect-[5/4]'}`}>
            <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.55))]" />
            <span className="absolute left-4 top-4 rounded-full bg-[var(--slot4-accent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-on-accent)]">{taskLabel}</span>
            <span className="absolute right-4 top-4 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">/{String(index + 1).padStart(3, '0')}</span>
          </div>
        ) : null}
        <div className="flex flex-1 flex-col p-6">
          {!image ? <span className="w-fit rounded-full bg-[var(--slot4-accent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-on-accent)]">{taskLabel}</span> : null}
          <h2 className="editable-display mt-4 line-clamp-3 text-2xl font-bold leading-[1.05] tracking-[-0.02em] text-[var(--slot4-page-text)]">{post.title}</h2>
          {summary ? <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]">{summary}</p> : null}
          <div className="mt-6 flex items-center justify-between border-t border-[var(--editable-border)] pt-4">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]">Open result</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--editable-border)] text-[var(--slot4-page-text)] transition group-hover:border-[var(--slot4-accent)] group-hover:bg-[var(--slot4-accent)] group-hover:text-[var(--slot4-on-accent)]">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </EditableReveal>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled)

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 sm:pt-40 lg:pt-48">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-96 w-[900px] -translate-x-1/2 rounded-full bg-[var(--slot4-accent)]/[0.06] blur-[120px]" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ 001 &nbsp;— &nbsp; {pagesContent.search.hero.badge}</p>
            <h1 className="editable-display mt-8 max-w-4xl text-6xl font-black leading-[0.92] tracking-[-0.045em] text-[var(--slot4-page-text)] sm:text-7xl lg:text-[9rem]">
              {pagesContent.search.hero.title}
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-[var(--slot4-muted-text)]">{pagesContent.search.hero.description}</p>

            {/* Search form */}
            <form action="/search" className="mt-12 rounded-[2rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-4 sm:p-6">
              <input type="hidden" name="master" value="1" />
              <label className="flex items-center gap-3 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-5 py-3.5">
                <Search className="h-5 w-5 text-[var(--slot4-accent)]" />
                <input name="q" defaultValue={query} placeholder={pagesContent.search.hero.placeholder} className="min-w-0 flex-1 bg-transparent text-base font-medium text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]" />
              </label>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <label className="flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-5 py-3">
                  <Filter className="h-4 w-4 text-[var(--slot4-accent)]" />
                  <input name="category" defaultValue={category} placeholder="Category" className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]" />
                </label>
                <select name="task" defaultValue={task} className="rounded-full border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-5 py-3 text-sm font-medium text-[var(--slot4-page-text)] outline-none">
                  <option value="">All content types</option>
                  {enabledTasks.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                </select>
                <button className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent)] px-6 py-3 text-sm font-semibold text-[var(--slot4-on-accent)] transition hover:scale-[1.02]" type="submit">
                  Search
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--slot4-on-accent)] text-[var(--slot4-accent)] transition group-hover:rotate-45">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Results */}
        <section className="border-t border-[var(--editable-border)] bg-[var(--slot4-page-bg)] py-16 sm:py-24">
          <div className="mx-auto max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ 002 &nbsp;— &nbsp; {results.length} results</p>
                <h2 className="editable-display mt-6 text-4xl font-black tracking-[-0.035em] text-[var(--slot4-page-text)] sm:text-5xl lg:text-6xl">
                  {query ? `Results for "${query}"` : pagesContent.search.resultsTitle}
                </h2>
              </div>
              <Link href={enabledTasks[0]?.route || '/'} className="group inline-flex items-center gap-3 rounded-full border border-[var(--editable-border)] py-3 pl-5 pr-3 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">
                Browse latest
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)] transition group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            </div>

            <div className="mt-10">
              <Ads slot="header" showLabel className="mx-auto w-full" />
            </div>

            {results.length ? (
              <div className="mt-10 grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
                {results.map((post, index) => <SearchResultCard key={post.id || post.slug} post={post} index={index} />)}
              </div>
            ) : (
              <div className="mt-10 rounded-[2rem] border border-dashed border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-16 text-center">
                <p className="editable-display text-4xl font-black tracking-[-0.035em] text-[var(--slot4-page-text)]">Nothing found.</p>
                <p className="mt-4 text-base text-[var(--slot4-muted-text)]">Try a different keyword, task type, or category.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
