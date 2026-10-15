import Link from 'next/link';

const books: Record<string, { title: string; subtitle: string; description: string; cover: string; url: string }> = {
  azxaz: {
    title: 'AZxAZ Hiermorphic Exegesis',
    subtitle: 'THE ARCHIVE / DIGITAL EDITION 01',
    description: 'An exploration of recursive storytelling, consciousness, speculative cosmology and the 18-Gate framework.',
    cover: '/covers/azxaz-hieromorphic-exegesis.png',
    url: 'https://vercel-store-36fdd2b4-epzbepqg.myshopify.com/products/azxaz-hiermorphic-exegesis',
  },
  phase: {
    title: 'Phase Recursion Ontology',
    subtitle: 'THE ARCHIVE / DIGITAL EDITION 02',
    description: 'A speculative philosophical framework exploring phase states, recursion, patterns and observer feedback.',
    cover: '/covers/phase-recursion-ontology.png',
    url: 'https://vercel-store-36fdd2b4-epzbepqg.myshopify.com/products/phase-recursion-ontology-v1-0',
  },
};

export default async function Edition({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = books[slug];
  if (!book) return <main style={{ padding: 60, background: '#0b0e1b', color: '#f0ebff', minHeight: '100vh' }}><h1>Edition not found</h1><Link href="/#works">Return to archive</Link></main>;
  return <main style={{ minHeight: '100vh', padding: '36px 6vw 80px', background: 'radial-gradient(circle at 76% 26%, #2b1d4a 0%, transparent 38%), #0b0e1b', color: '#f0ebff', fontFamily: 'Manrope, sans-serif' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #363049', paddingBottom: 26, gap: 20, flexWrap: 'wrap' }}>
      <Link href="/" style={{ color: '#bd9bff', letterSpacing: 3, fontWeight: 700 }}>TR / ∞</Link>
      <Link href="/#works" style={{ color: '#beb5d0', fontSize: 12, letterSpacing: 2 }}>← BACK TO THE ARCHIVE</Link>
    </header>
    <section style={{ maxWidth: 1050, margin: 'clamp(56px,9vw,130px) auto 0', display: 'flex', gap: 'clamp(30px,6vw,100px)', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
      <div style={{ width: 'min(100%, 310px)', flex: '0 1 310px', padding: 22, border: '1px solid #46375e', background: '#171429', boxShadow: '0 26px 75px #0008' }}>
        <img src={book.cover} alt={book.title + ' cover'} style={{ display: 'block', width: '100%', maxHeight: 440, objectFit: 'contain' }}/>
      </div>
      <div style={{ flex: '1 1 330px', maxWidth: 490 }}>
        <p style={{ color: '#bd9bff', letterSpacing: 3, fontSize: 11 }}>{book.subtitle}</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(40px,5vw,68px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: -2, margin: '28px 0' }}>{book.title}</h1>
        <p style={{ color: '#bcb6ca', lineHeight: 1.9, fontSize: 15 }}>{book.description}</p>
        <div style={{ padding: '28px 0', borderTop: '1px solid #423752', marginTop: 35, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#c8c0d7', fontSize: 13 }}>Digital download · DOCX</span>
          <strong style={{ fontSize: 30 }}>$6.99</strong>
        </div>
        <a href={book.url} style={{ display: 'block', padding: '19px 24px', background: '#7950d7', color: '#fff', textAlign: 'center', fontWeight: 700, letterSpacing: 1, textDecoration: 'none', borderRadius: 5 }}>CONTINUE TO SHOPIFY PURCHASE ↗</a>
        <p style={{ color: '#a8a0b7', fontSize: 12, textAlign: 'center', marginTop: 18 }}>Secure payment handled by Shopify · Digital file delivered after purchase</p>
      </div>
    </section>
    <footer style={{ marginTop: 120, borderTop: '1px solid #363049', paddingTop: 28, color: '#978ca9', fontSize: 11, letterSpacing: 2 }}>THE TRANSCENDENT RECURSION / ALL SYSTEMS ARE STORIES</footer>
  </main>;
}
