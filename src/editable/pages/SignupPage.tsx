import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Sign up', description: pagesContent.auth.signup.metadataDescription })
}

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="relative mx-auto max-w-[var(--editable-container)] px-5 pt-32 pb-24 sm:px-8 sm:pt-40 sm:pb-32 lg:px-12">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-96 w-[700px] -translate-x-1/2 rounded-full bg-[var(--slot4-accent)]/[0.06] blur-[100px]" />
          <div className="relative grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 sm:p-10">
              <h2 className="editable-display text-3xl font-bold tracking-[-0.02em] text-[var(--slot4-page-text)]">{pagesContent.auth.signup.formTitle}</h2>
              <EditableLocalSignupForm />
              <p className="mt-8 text-sm text-[var(--slot4-muted-text)]">
                Already have an account?{' '}
                <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-[var(--slot4-accent)] hover:underline">
                  {pagesContent.auth.signup.loginCta} <ArrowUpRight className="h-4 w-4" />
                </Link>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--slot4-muted-text)]">/ 002 &nbsp;— &nbsp; {pagesContent.auth.signup.badge}</p>
              <h1 className="editable-display mt-8 max-w-xl text-6xl font-black leading-[0.92] tracking-[-0.045em] text-[var(--slot4-page-text)] sm:text-7xl lg:text-8xl">
                {pagesContent.auth.signup.title}
                <span className="ml-3 inline-flex h-4 w-4 translate-y-1 rounded-full bg-[var(--slot4-accent)] align-middle sm:h-5 sm:w-5" />
              </h1>
              <p className="mt-8 max-w-lg text-lg leading-8 text-[var(--slot4-muted-text)]">{pagesContent.auth.signup.description}</p>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
