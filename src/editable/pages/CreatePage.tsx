'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, FileText, ImageIcon, Lock, PlusCircle, Send, Sparkles } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const taskIcon: Record<string, typeof FileText> = {
  article: FileText,
  listing: Sparkles,
  classified: PlusCircle,
  image: ImageIcon,
  profile: Sparkles,
  pdf: FileText,
  sbm: Sparkles,
}

const fieldClass = 'w-full rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-4 py-3 text-sm font-medium text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-muted-text)] focus:border-[var(--slot4-accent)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((item) => item.key === task) || enabledTasks[0]

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
          <section className="relative overflow-hidden pt-32 sm:pt-40 lg:pt-48">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-96 w-[900px] -translate-x-1/2 rounded-full bg-[var(--slot4-accent)]/[0.06] blur-[120px]" />
            <div className="relative mx-auto max-w-[var(--editable-container)] px-5 pb-24 sm:px-8 sm:pb-32 lg:px-12">
              <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                <div className="flex aspect-square items-center justify-center rounded-[2.5rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]">
                  <Lock className="h-32 w-32 text-[var(--slot4-accent)]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ 001 &nbsp;— &nbsp; {pagesContent.create.locked.badge}</p>
                  <h1 className="editable-display mt-8 text-6xl font-black leading-[0.92] tracking-[-0.045em] text-[var(--slot4-page-text)] sm:text-7xl lg:text-8xl">
                    {pagesContent.create.locked.title}
                  </h1>
                  <p className="mt-8 max-w-xl text-lg leading-8 text-[var(--slot4-muted-text)]">{pagesContent.create.locked.description}</p>
                  <div className="mt-10 flex flex-wrap gap-3">
                    <Link href="/login" className="group inline-flex items-center gap-3 rounded-full bg-[var(--slot4-accent)] py-4 pl-6 pr-4 text-sm font-semibold text-[var(--slot4-on-accent)] transition hover:scale-[1.02]">
                      Login
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--slot4-on-accent)] text-[var(--slot4-accent)] transition group-hover:rotate-45">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </Link>
                    <Link href="/signup" className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] px-6 py-4 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">
                      Sign up
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="relative overflow-hidden pt-32 sm:pt-40 lg:pt-48">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-96 w-[900px] -translate-x-1/2 rounded-full bg-[var(--slot4-accent)]/[0.06] blur-[120px]" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-5 pb-24 sm:px-8 sm:pb-32 lg:px-12">
            <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
              <aside>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ 001 &nbsp;— &nbsp; {pagesContent.create.hero.badge}</p>
                <h1 className="editable-display mt-8 text-6xl font-black leading-[0.92] tracking-[-0.045em] text-[var(--slot4-page-text)] sm:text-7xl">
                  {pagesContent.create.hero.title}
                </h1>
                <p className="mt-8 max-w-xl text-lg leading-8 text-[var(--slot4-muted-text)]">{pagesContent.create.hero.description}</p>
                <div className="mt-10 grid gap-3 sm:grid-cols-2">
                  {enabledTasks.map((item, index) => {
                    const Icon = taskIcon[item.key] || FileText
                    const active = item.key === task
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setTask(item.key)}
                        className={`rounded-2xl border p-5 text-left transition ${
                          active
                            ? 'border-[var(--slot4-accent)] bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)]'
                            : 'border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] text-[var(--slot4-page-text)] hover:border-[var(--slot4-accent)]/40'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <Icon className="h-6 w-6" />
                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-60">/{String(index + 1).padStart(2, '0')}</span>
                        </span>
                        <span className="editable-display mt-5 block text-xl font-bold tracking-[-0.02em]">{item.label}</span>
                        <span className="mt-2 block text-xs font-medium leading-5 opacity-70">{item.description}</span>
                      </button>
                    )
                  })}
                </div>
              </aside>

              <form onSubmit={submit} className="rounded-[2.5rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 sm:p-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">Create {activeTask?.label || 'post'}</p>
                    <h2 className="editable-display mt-3 text-4xl font-bold tracking-[-0.02em] text-[var(--slot4-page-text)]">{pagesContent.create.formTitle}</h2>
                  </div>
                  <span className="rounded-full border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--slot4-muted-text)]">{session.name}</span>
                </div>

                <div className="mt-8 grid gap-4">
                  <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" required />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
                    <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Website or source URL" />
                  </div>
                  <input className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Featured image URL" />
                  <textarea className={`${fieldClass} min-h-24`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short summary" required />
                  <textarea className={`${fieldClass} min-h-48`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Main content, details, notes, or description" required />
                </div>

                {created ? (
                  <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[var(--slot4-accent)]/30 bg-[var(--slot4-accent-soft)] p-5 text-[var(--slot4-accent)]">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{pagesContent.create.successTitle}</p>
                      <p className="mt-1 text-sm opacity-80">{created.title}</p>
                    </div>
                  </div>
                ) : null}

                <button type="submit" className="group mt-6 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[var(--slot4-accent)] text-sm font-semibold uppercase tracking-[0.18em] text-[var(--slot4-on-accent)] transition hover:scale-[1.01]">
                  <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
