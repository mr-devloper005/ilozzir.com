import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'Discover Local Businesses & Save What Matters',
      description: 'Browse trusted local business listings, compare and review, and save the best links and resources through one connected discovery platform.',
      openGraphTitle: 'Discover Local Businesses & Save What Matters',
      openGraphDescription: 'Browse trusted local business listings and save the best bookmarks worth sharing.',
      keywords: ['business directory', 'local listings', 'social bookmarking', 'reviews', 'save links'],
    },
    hero: {
      badge: 'Directory & bookmarking, done right',
      title: ['Find great', 'places.'],
      description: 'Browse verified local listings, compare ratings and reviews, and save the links and resources worth coming back to — all in one place.',
      primaryCta: { label: 'Browse listings', href: '/listing' },
      secondaryCta: { label: 'Explore bookmarks', href: '/sbm' },
      searchPlaceholder: 'Search listings, bookmarks, and more',
      focusLabel: 'Focus',
      featureCardBadge: 'latest cover rotation',
      featureCardTitle: 'Latest listings and bookmarks shape the homepage.',
      featureCardDescription: 'Recent listings and saved resources stay at the center of the experience without changing any core platform behavior.',
    },
    intro: {
      badge: 'About the platform',
      title: 'Built for discovering trusted businesses and saving what matters.',
      paragraphs: [
        'This site brings together a local business directory and social bookmarking so visitors can move naturally between discovering places and saving resources.',
        'Instead of separating listings and bookmarks into disconnected surfaces, the platform keeps them connected in one place with consistent navigation and easier exploration.',
        'Whether someone starts by browsing a business listing or a saved link, they can keep discovering related content without friction.',
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'A directory-first homepage with stronger emphasis on trusted local listings.',
        'Connected sections for businesses, reviews, and saved bookmarks.',
        'Cleaner browsing rhythm designed to make exploration feel easier.',
        'Lightweight interactions that keep the experience fast and readable.',
      ],
      primaryLink: { label: 'Browse listings', href: '/listing' },
      secondaryLink: { label: 'See bookmarks', href: '/sbm' },
    },
    cta: {
      badge: 'Join the community',
      title: 'Got a business worth listing, or a link worth saving?',
      description: 'Add your business, share a review, or bookmark a resource worth sharing — and reach the community around this platform.',
      primaryCta: { label: 'Get started', href: '/create' },
      secondaryCta: { label: 'Contact us', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest posts in this section.',
    },
  },
  about: {
    badge: 'Our Story',
    title: 'A trusted way to discover businesses and save what matters.',
    description: `${slot4BrandConfig.siteName} is built to make local business discovery and social bookmarking feel like one unified experience.`,
    paragraphs: [
      'Instead of splitting business listings and saved resources into disconnected pages, the platform keeps them easy to move through and easy to understand.',
      'Whether someone starts by browsing a listing or saving a bookmark, they can continue exploring related content without losing context.',
    ],
    values: [
      {
        title: 'Verified local discovery',
        description: 'We prioritize clarity, trust cues, and structure so people can find and compare local businesses without noise.',
      },
      {
        title: 'Community reviews & bookmarks',
        description: 'Ratings, reviews, and saved resources stay connected so discovery feels natural across the site.',
      },
      {
        title: 'Simple and trustworthy',
        description: 'We focus on clean navigation and clear page structure to help visitors find useful listings and links faster.',
      },
    ],
    stats: [
      { value: '2', label: 'Core discovery surfaces' },
      { value: '100%', label: 'Community-submitted content' },
      { value: '24/7', label: 'Open for new listings & bookmarks' },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'A support page that matches the product, not a generic contact form.',
    description: 'Tell us what you are trying to list, save, or fix. We will route it through the right lane instead of forcing every request into the same support bucket.',
    formTitle: 'Send a message',
    faq: [
      { question: 'How do I list my business?', answer: 'Create a free account, then use the Create page to submit your business listing with details, photos, and contact info.' },
      { question: 'How do bookmarks get featured?', answer: 'Save a link through the Create page — the most useful and popular bookmarks surface across the homepage and category pages.' },
      { question: 'Is listing my business free?', answer: 'Yes. Creating an account and submitting a listing or bookmark is free for everyone.' },
      { question: 'How do reviews and ratings work?', answer: 'Ratings reflect community feedback on each listing, helping visitors compare businesses at a glance.' },
    ],
  },

  search: {
    metadata: {
      title: 'Search',
      description: 'Search posts, topics, categories, and content across the site.',
    },
    hero: {
      badge: 'Search the directory',
      title: 'Find businesses and saved resources faster.',
      description: 'Use keywords, categories, and content types to discover listings and bookmarks from every active section of the site.',
      placeholder: 'Search by keyword, category, or title',
    },
    resultsTitle: 'Latest listings & bookmarks',
  },
  create: {
    metadata: {
      title: 'Create',
      description: 'Create and submit new content for the site.',
    },
    locked: {
      badge: 'Member access',
      title: 'Login to list a business or save a bookmark.',
      description: 'Use your account to add a business listing or save a link for the active sections of this site.',
    },
    hero: {
      badge: 'Submission workspace',
      title: 'List a business or save a bookmark.',
      description: 'Choose listing or bookmark, add the details, and submit a clean post with images, links, summary, and body content.',
    },
    formTitle: 'Content details',
    submitLabel: 'Submit content',
    successTitle: 'Content submitted successfully.',
  },
  auth: {
    login: {
      metadataDescription: 'Login page for this site.',
      badge: 'Member access',
      title: 'Welcome back.',
      description: 'Login to continue browsing, manage your submissions, and add new listings or bookmarks from your account.',
      formTitle: 'Login',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create an account first, then login.',
      success: 'Login successful. Redirecting...',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Signup page for this site.',
      badge: 'Site access',
      title: 'Create your account and get started.',
      description: 'Create an account to list your business, save bookmarks, and manage your submissions through the site.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created successfully. Redirecting...',
      loginCta: 'Login',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related articles',
      fallbackTitle: 'Article details',
    },
    listing: {
      relatedTitle: 'Related listings',
      fallbackTitle: 'Listing details',
    },
    image: {
      relatedTitle: 'Related visuals',
      fallbackTitle: 'Image details',
    },
    profile: {
      relatedTitle: 'Suggested articles',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit Official Site',
    },
  },
} as const
