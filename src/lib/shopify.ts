type ShopifyField = {
  key: string;
  value: string | null;
};

type ShopifyMetaobject = {
  id: string;
  handle: string;
  fields: ShopifyField[];
};

type ShopifyResponse = {
  data?: {
    metaobjects: {
      nodes: ShopifyMetaobject[];
    };
  };
  errors?: Array<{ message: string }>;
};

export type CreativeWork = {
  number: string;
  type: string;
  title: string;
  description: string;
  action: string;
  href: string;
  status: string;
  theme: string;
  cover?: string;
};

export const fallbackCreativeWorks: CreativeWork[] = [
  { number: '01', type: 'Short story / Entry point', title: 'Atlantis Regenesis', description: 'The first transmission. A submerged beginning for a story that refuses to stay in one world.', action: 'Read the short story', href: '#atlantis', status: 'Available now', theme: 'water' },
  { number: '02', type: 'Novel / Book one', title: 'The Quadrabrid: End Simulation', description: 'Four realities. One recursive system. The first book of The Transcendent Recursion.', action: 'Enter the waitlist', href: '#quadrabrid', status: 'Coming soon', theme: 'signal' },
  { number: '03', type: 'Soundtrack / Original score', title: 'The Soundtrack', description: 'An audio layer for the multiverse: atmosphere, memory, and the sound of a simulation losing coherence.', action: 'Listen to the soundtrack', href: '#soundtrack', status: 'Listen soon', theme: 'sound' },
  { number: '04', type: 'Theory / Physics of the book', title: 'Multi Modal Unified Recursive Multiverse', description: 'A technical companion to the fiction. The physics, architecture, and recursive logic beneath the worlds.', action: 'View the framework', href: '#mmurm', status: 'Coming soon', theme: 'grid' },
  { number: '05', type: 'Manifesto / A declaration', title: 'The Technological Sovereignty Manifesto', description: 'A challenge to build tools that return agency to the people who use them.', action: 'Read the manifesto', href: '#manifesto', status: 'Coming soon', theme: 'orange' },
  { number: '06', type: 'Book / A practical intervention', title: 'The AZ-X-AZ Hieromorphic Exegesis', description: 'The source material of the series: channelings, transmissions, and otherworldly voices.', action: 'Register your interest', href: '#fix-yourself', status: 'Coming soon', theme: 'violet' },
  { number: '07', type: 'Book / Physics philosophy', title: 'Phase Recursion Ontology', description: 'A physics-first philosophy on the shoulders of giants — reality as recursively evolving phase states, across nine chapters.', action: 'Get the book', href: '#phase-recursion-ontology', status: 'Available now', theme: 'grid', cover: '/covers/phase-recursion-ontology.png' }
  
];

const creativeWorksQuery = `
  query CreativeWorks {
    metaobjects(type: "creative_work", first: 20) {
      nodes {
        id
        handle
        fields {
          key
          value
        }
      }
    }
  }
`;

function getField(fields: ShopifyField[], key: string, fallback = '') {
  return fields.find((field) => field.key === key)?.value?.trim() || fallback;
}

export async function getCreativeWorks(): Promise<CreativeWork[]> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!domain || !token) {
    return fallbackCreativeWorks;
  }

  const apiVersion = process.env.SHOPIFY_API_VERSION || '2026-07';
  const endpoint = `https://${domain.replace(/^https?:\/\//, '').replace(/\/$/, '')}/api/${apiVersion}/graphql.json`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token
    },
    body: JSON.stringify({ query: creativeWorksQuery }),
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error(`Shopify Storefront API responded with ${response.status}`);
  }

  const payload = (await response.json()) as ShopifyResponse;
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '));
  }

  const works = (payload.data?.metaobjects.nodes ?? [])
    .map((node) => ({
      number: getField(node.fields, 'number', '00'),
      type: getField(node.fields, 'type'),
      title: getField(node.fields, 'title', node.handle),
      description: getField(node.fields, 'description'),
      action: getField(node.fields, 'action', 'Explore the work'),
      href: getField(node.fields, 'href', `#${node.handle}`),
      status: getField(node.fields, 'status', 'Coming soon'),
      theme: getField(node.fields, 'theme', 'signal')
    }))
    .sort((first, second) => first.number.localeCompare(second.number, undefined, { numeric: true }));

  return works.length > 0 ? works : fallbackCreativeWorks;
}

// ---------------------------------------------------------------------------
// Newsletter — the "Transmissions" feed.
//
// The newsletter-autopilot app publishes free preview editions as articles
// in the Shopify blog identified by NEWSLETTER_BLOG_HANDLE (default "news").
// This reads them back through the same Storefront API so the site reflects
// whatever the pipeline has published. Until Shopify is wired (no token) or
// the first edition lands, it returns an empty list and the section renders
// its "first transmission pending" state.
// ---------------------------------------------------------------------------

export type NewsletterArticle = {
  title: string;
  excerpt: string;
  publishedAt: string;
  url: string;
  tags: string[];
};

type NewsletterResponse = {
  data?: {
    blog: {
      articles: {
        nodes: Array<{
          title: string;
          excerpt: string | null;
          contentHtml: string;
          publishedAt: string;
          url: string;
          tags: string[];
        }>;
      };
    } | null;
  };
  errors?: Array<{ message: string }>;
};

const newsletterQuery = `
  query NewsletterArticles($handle: String!) {
    blog(handle: $handle) {
      articles(first: 6, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          title
          excerpt
          contentHtml
          publishedAt
          url
          tags
        }
      }
    }
  }
`;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function getNewsletterArticles(): Promise<NewsletterArticle[]> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!domain || !token) {
    return [];
  }

  const apiVersion = process.env.SHOPIFY_API_VERSION || '2026-07';
  const endpoint = `https://${domain.replace(/^https?:\/\//, '').replace(/\/$/, '')}/api/${apiVersion}/graphql.json`;
  const handle = process.env.NEWSLETTER_BLOG_HANDLE || 'news';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token
      },
      body: JSON.stringify({ query: newsletterQuery, variables: { handle } }),
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as NewsletterResponse;
    if (payload.errors?.length || !payload.data?.blog) {
      return [];
    }

    return payload.data.blog.articles.nodes.map((node) => {
      const excerpt = (node.excerpt?.trim() || stripHtml(node.contentHtml)).slice(0, 220);
      return {
        title: node.title,
        excerpt,
        publishedAt: node.publishedAt,
        url: node.url,
        tags: node.tags ?? []
      };
    });
  } catch {
    // A Shopify outage or misconfiguration must never take the page down.
    return [];
  }
}
