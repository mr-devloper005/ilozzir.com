'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  const navItems = useMemo(
    () => [
      { label: 'Home', href: '/' },
     
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    []
  )

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--editable-border)] bg-[var(--editable-nav-bg)] text-[var(--editable-nav-text)] backdrop-blur-xl">
      <nav className="mx-auto flex min-h-[76px] w-full max-w-[var(--editable-container)] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
        {/* Brand */}
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--slot4-accent)] transition group-hover:rotate-12">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-10 w-10 object-contain" />
          </span>
          <span className="editable-display text-lg font-black uppercase tracking-[-0.02em] text-[var(--slot4-page-text)]">
            {SITE_CONFIG.name}
          </span>
        </Link>

        {/* Desktop nav — numbered agency-style pill */}
        <div className="hidden items-center gap-1 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]/50 p-1.5 backdrop-blur-md lg:flex">
          {navItems.slice(0, 6).map((item, index) => {
            const active = item.href === '/' ? pathname === '/' : (pathname === item.href || pathname.startsWith(`${item.href}/`))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  active
                    ? 'bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)]'
                    : 'text-[var(--slot4-muted-text)] hover:text-[var(--slot4-page-text)]'
                }`}
              >
                <span className="text-[9px] opacity-60">{String(index + 1).padStart(2, '0')}</span>
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-2">
          {session ? (
            <>
              <Link
                href="/create"
                className="group hidden items-center gap-2 rounded-full bg-[var(--slot4-accent)] py-2 pl-4 pr-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--slot4-on-accent)] transition hover:scale-[1.02] sm:inline-flex"
              >
                Create
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--slot4-on-accent)] text-[var(--slot4-accent)] transition group-hover:rotate-45">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden rounded-full border border-[var(--editable-border)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--slot4-muted-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)] sm:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full border border-[var(--editable-border)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--slot4-muted-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)] sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="group hidden items-center gap-2 rounded-full bg-[var(--slot4-accent)] py-2 pl-4 pr-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--slot4-on-accent)] transition hover:scale-[1.02] sm:inline-flex"
              >
                Sign up
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--slot4-on-accent)] text-[var(--slot4-accent)] transition group-hover:rotate-45">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)] lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--slot4-page-bg)] px-5 py-6 lg:hidden">
          <div className="grid gap-2">
            {navItems.map((item, index) => {
              const active = item.href === '/' ? pathname === '/' : (pathname === item.href || pathname.startsWith(`${item.href}/`))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`editable-display flex items-baseline justify-between rounded-2xl px-4 py-4 text-2xl font-black tracking-[-0.02em] transition ${
                    active
                      ? 'bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)]'
                      : 'text-[var(--slot4-page-text)] hover:bg-[var(--slot4-surface-bg)]'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.24em] opacity-60">/{String(index + 1).padStart(2, '0')}</span>
                </Link>
              )
            })}
          </div>
          <div className="mt-6 grid gap-2 border-t border-[var(--editable-border)] pt-6">
            {session ? (
              <>
                <Link
                  href="/create"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-between rounded-full bg-[var(--slot4-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--slot4-on-accent)]"
                >
                  Create <ArrowUpRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => { logout(); setOpen(false) }}
                  className="rounded-full border border-[var(--editable-border)] px-5 py-3 text-left text-sm font-semibold uppercase tracking-[0.14em] text-[var(--slot4-muted-text)]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-between rounded-full bg-[var(--slot4-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--slot4-on-accent)]"
                >
                  Sign up <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-[var(--editable-border)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--slot4-muted-text)]"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
