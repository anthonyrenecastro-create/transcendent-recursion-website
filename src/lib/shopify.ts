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
  { number: '01', type: 'Soundtrack / Original score', title: 'The Soundtrack', description: 'An audio layer for the multiverse: atmosphere, memory, and the sound of a simulation losing coherence.', action: 'Listen to the soundtrack', href: '#soundtrack', status: 'Listen soon', theme: 'sound' },
  { number: '02', type: 'Theory / Physics of the book', title: 'Multi Modal Unified Recursive Multiverse', description: 'A technical companion to the fiction. The physics, architecture, and recursive logic beneath the worlds.', action: 'View the papers on Zenodo', href: 'https://zenodo.org/records/23236616', status: 'Coming soon', theme: 'grid', cover: '/covers/mmurm.png' },
  { number: '03', type: 'Book / A declaration', title: 'The Technological Sovereignty Manifesto', description: 'A challenge to build tools that return agency to the people who use them.', action: 'Buy the book — $6.99', href: '/edition/manifesto', status: 'Digital book', theme: 'orange', cover: '/covers/technological-sovereignty-manifesto.png' },
  { number: '04', type: 'Book / A practical intervention', title: 'The AZ-X-AZ Hieromorphic Exegesis', description: 'The source material of the series: channelings, transmissions, and otherworldly voices.', action: 'Buy the book — $6.99', href: '/edition/azxaz', status: 'Digital book', theme: 'violet', cover: '/covers/azxaz-hieromorphic-exegesis.png' },
  { number: '05', type: 'Book / Physics philosophy', title: 'Phase Recursion Ontology', description: 'A physics-first philosophy on the shoulders of giants — reality as recursively evolving phase states, across nine chapters.', action: 'Buy the book — $6.99', href: '/edition/phase', status: 'Digital book', theme: 'grid', cover: '/covers/phase-recursion-ontology.png' },
  { number: '06', type: 'Book / A practical guide', title: 'Become the Engineer', description: 'A guide to prompt engineering — ten chapters on turning a request into a working prompt, from the foundations of AI to advanced techniques and the future of human–AI collaboration.', action: 'Buy the book — $6.99', href: '/edition/become-the-engineer', status: 'Digital book', theme: 'grid', cover: '/covers/become-the-engineer.png' }
];


function connectBookPurchase(work: CreativeWork): CreativeWork {
  // The published Shopify creative_work links may point to unrelated newsletter content.
  // Route the four book records to their dedicated editorial purchase pages, matched by title.
  const book = fallbackCreativeWorks.find((entry) => entry.title === work.title && entry.status === 'Digital book');
  if (!book) return work;
  return { ...work, cover: book.cover, href: book.href, action: book.action, status: book.status };
}

function connectMmurnCard(work: CreativeWork): CreativeWork {
  // The MMURM card carries its artwork and links to the public Zenodo record,
  // whatever the Shopify metaobject holds for the link.
  if (work.title !== 'Multi Modal Unified Recursive Multiverse') return work;
  return { ...work, cover: '/covers/mmurm.png', href: 'https://zenodo.org/records/23236616', action: 'View the papers on Zenodo' };
}

// Removed from the archive 2026-11-20: these works must not reappear from Shopify.
const REMOVED_TITLES = new Set(['Atlantis Regenesis', 'The Quadrabrid: End Simulation']);

// The two published books (archive numbers 04 and 05) lead the archive;
// everything else follows in archive-number order.
const PUBLISHED_BOOK_NUMBERS = new Set(['04', '05']);

function sortCreativeWorks(works: CreativeWork[]): CreativeWork[] {
  return [...works].sort((first, second) => {
    const firstRank = PUBLISHED_BOOK_NUMBERS.has(first.number) ? 0 : 1;
    const secondRank = PUBLISHED_BOOK_NUMBERS.has(second.number) ? 0 : 1;
    if (firstRank !== secondRank) return firstRank - secondRank;
    return first.number.localeCompare(second.number, undefined, { numeric: true });
  });
}

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
    return sortCreativeWorks(fallbackCreativeWorks);
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
    .map((work) => {
      // Renumber to the current archive numbers so Shopify data and the
      // built-in list agree after the 2026-11-20 removal + renumber.
      const current = fallbackCreativeWorks.find((entry) => entry.title === work.title);
      return current ? { ...work, number: current.number } : work;
    })
    .filter((work) => !REMOVED_TITLES.has(work.title))
    .map(connectBookPurchase)
    .map(connectMmurnCard);

  if (works.length === 0) return sortCreativeWorks(fallbackCreativeWorks);

  // Fallback entries Shopify doesn't return (e.g. a new book awaiting its
  // metaobject) are appended, so code-defined works still appear.
  const seen = new Set(works.map((work) => work.number));
  const missing = fallbackCreativeWorks.filter((work) => !seen.has(work.number));
  return sortCreativeWorks([...works, ...missing]);
}
