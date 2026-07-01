'use client'

import { Building2, FileText, Image as ImageIcon, Mail, MapPin, Phone, Sparkles, Bookmark } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { getProductKind } from '@/design/factory/get-product-kind'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'

function getLanes(kind: ReturnType<typeof getProductKind>) {
  if (kind === 'directory') {
    return [
      { icon: Building2, title: 'Business onboarding', body: 'Add listings, verify operational details, and bring your business surface live quickly.' },
      { icon: Phone, title: 'Partnership support', body: 'Talk through bulk publishing, local growth, and operational setup questions.' },
      { icon: MapPin, title: 'Coverage requests', body: 'Need a new geography or category lane? We can shape the directory around it.' },
    ]
  }
  if (kind === 'editorial') {
    return [
      { icon: FileText, title: 'Editorial submissions', body: 'Pitch essays, columns, and long-form ideas that fit the publication.' },
      { icon: Mail, title: 'Newsletter partnerships', body: 'Coordinate sponsorships, collaborations, and issue-level campaigns.' },
      { icon: Sparkles, title: 'Contributor support', body: 'Get help with voice, formatting, and publication workflow questions.' },
    ]
  }
  if (kind === 'visual') {
    return [
      { icon: ImageIcon, title: 'Creator collaborations', body: 'Discuss gallery launches, creator features, and visual campaigns.' },
      { icon: Sparkles, title: 'Licensing and use', body: 'Reach out about usage rights, commercial requests, and visual partnerships.' },
      { icon: Mail, title: 'Media kits', body: 'Request creator decks, editorial support, or visual feature placement.' },
    ]
  }
  return [
    { icon: Bookmark, title: 'Collection submissions', body: 'Suggest resources, boards, and links that deserve a place in the library.' },
    { icon: Mail, title: 'Resource partnerships', body: 'Coordinate curation projects, reference pages, and link programs.' },
    { icon: Sparkles, title: 'Curator support', body: 'Need help organizing shelves, collections, or profile-connected boards?' },
  ]
}

export default function ContactPage() {
  const { recipe } = getFactoryState()
  const productKind = getProductKind(recipe)
  const lanes = getLanes(productKind)
  const faq = pagesContent.contact.faq

  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 sm:pt-40 lg:pt-48">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-96 w-[900px] -translate-x-1/2 rounded-full bg-[var(--slot4-accent)]/[0.06] blur-[120px]" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ 001 &nbsp;— &nbsp; {pagesContent.contact.eyebrow}</p>
            <h1 className="editable-display mt-8 max-w-4xl text-6xl font-black leading-[0.92] tracking-[-0.045em] text-[var(--slot4-page-text)] sm:text-7xl lg:text-[9rem]">
              Say <span className="text-[var(--slot4-accent)]">hello.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-[var(--slot4-muted-text)]">{pagesContent.contact.description}</p>
          </div>
        </section>

        {/* Lanes + Form */}
        <section className="border-y border-[var(--editable-border)] bg-[var(--slot4-page-bg)] py-24 sm:py-32">
          <div className="mx-auto grid max-w-[var(--editable-container)] gap-12 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:px-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ 002 &nbsp;— &nbsp; Support lanes</p>
              <h2 className="editable-display mt-6 text-5xl font-black leading-[0.95] tracking-[-0.035em] text-[var(--slot4-page-text)] sm:text-6xl">
                Pick a lane<br />that fits.
              </h2>
              <div className="mt-10 grid gap-4">
                {lanes.map((lane, index) => (
                  <EditableReveal key={lane.title} delay={index * 70}>
                    <div className="grid grid-cols-[auto_1fr] items-start gap-5 rounded-[2rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-7 transition hover:border-[var(--slot4-accent)]/40">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)]">
                        <lane.icon className="h-6 w-6" />
                      </span>
                      <div>
                        <h3 className="editable-display text-xl font-bold tracking-[-0.02em] text-[var(--slot4-page-text)]">{lane.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-[var(--slot4-muted-text)]">{lane.body}</p>
                      </div>
                    </div>
                  </EditableReveal>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ 003 &nbsp;— &nbsp; Send a message</p>
              <h2 className="editable-display mt-4 text-4xl font-bold tracking-[-0.02em] text-[var(--slot4-page-text)] sm:text-5xl">{pagesContent.contact.formTitle}</h2>
              <EditableContactLeadForm />
            </div>
          </div>
        </section>

        {/* FAQ */}
        {faq?.length ? (
          <section className="bg-[var(--slot4-page-bg)] py-24 sm:py-32">
            <div className="mx-auto max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-12">
              <div className="grid gap-14 lg:grid-cols-[0.4fr_1fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ 004 &nbsp;— &nbsp; FAQ</p>
                  <h2 className="editable-display mt-6 text-5xl font-black leading-[0.95] tracking-[-0.035em] text-[var(--slot4-page-text)] sm:text-6xl">
                    Frequent<br />questions.
                  </h2>
                </div>
                <div className="grid gap-4">
                  {faq.map((item, i) => (
                    <EditableReveal key={item.question} delay={i * 70}>
                      <div className="rounded-[1.5rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-7">
                        <h3 className="editable-display text-xl font-bold tracking-[-0.02em] text-[var(--slot4-page-text)]">{item.question}</h3>
                        <p className="mt-3 text-base leading-7 text-[var(--slot4-muted-text)]">{item.answer}</p>
                      </div>
                    </EditableReveal>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </EditableSiteShell>
  )
}
