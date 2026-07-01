import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'Discover local businesses. Save what matters.',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'Local business directory & bookmarking',
    primaryLinks: [
      { label: 'Listings', href: '/listing' },
      { label: 'Bookmarks', href: '/sbm' },
      { label: 'Search', href: '/search' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'Start exploring', href: '/' },
      secondary: { label: 'Submit', href: '/create' },
    },
  },
  footer: {
    tagline: 'Businesses worth finding, links worth saving',
    description: 'A place to discover and review trusted local businesses, and to save and share the best links and resources you find.',
    columns: [
      {
        title: 'Explore',
        links: [
          { label: 'Listings', href: '/listing' },
          { label: 'Bookmarks', href: '/sbm' },
          { label: 'Search', href: '/search' },
        ],
      },
      {
        title: 'Site',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    ],
    bottomNote: 'Built for clean discovery — find businesses, save what matters.',
  },
  commonLabels: {
    readMore: 'Read more',
    viewAll: 'View all',
    explore: 'Explore',
    latest: 'Latest',
    related: 'Related',
    published: 'Published',
  },
} as const
