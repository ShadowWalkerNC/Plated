/**
 * renderBlock.ts — maps every BlockType to an Astro JSX-like HTML string.
 *
 * Rules:
 *   - Each renderer receives (schema, block) and returns a string of
 *     Astro/HTML markup (no frontmatter — that lives in renderPage.ts).
 *   - Renderers must be safe to call even when schema data is sparse.
 *   - Unknown block types fall through to a <!-- plated:unknown --> comment.
 */
import type { ProjectSchema, BlockSchema } from '@plated/types';

type BlockRenderer = (schema: ProjectSchema, block: BlockSchema) => string;

// ── Individual renderers ───────────────────────────────────────────────────

const hero: BlockRenderer = (schema) => {
  const hero = schema.branding.heroImageUrl;
  const resUrl = schema.extensions?.reservations?.widgetUrl ?? '';
  const hasMenu = schema.menu.categories.length > 0;
  return [
    `<section class="block-hero"${hero ? ` style="--hero-img:url('${hero}')"` : ''}>`,
    `  <div class="block-hero__inner">`,
    `    <h1 class="block-hero__title">${schema.business.name}</h1>`,
    schema.business.tagline
      ? `    <p class="block-hero__tagline">${schema.business.tagline}</p>`
      : '',
    `    <div class="block-hero__actions">`,
    hasMenu ? `      <a class="btn" href="/menu">View Menu</a>` : '',
    resUrl  ? `      <a class="btn btn-ghost" href="${resUrl}" target="_blank" rel="noreferrer">Reserve a Table</a>` : '',
    `    </div>`,
    `  </div>`,
    `</section>`,
  ].filter(Boolean).join('\n');
};

const text: BlockRenderer = (_schema, block) => {
  const heading = String(block.config['heading'] ?? '');
  const body    = String(block.config['body']    ?? '');
  return [
    `<section class="section block-text">`,
    `  <div class="container prose">`,
    heading ? `    <h2>${heading}</h2>` : '',
    body    ? `    <div>${body}</div>`  : '',
    `  </div>`,
    `</section>`,
  ].filter(Boolean).join('\n');
};

const image: BlockRenderer = (_schema, block) => {
  const src = String(block.config['src'] ?? '');
  const alt = String(block.config['alt'] ?? '');
  if (!src) return '<!-- plated:image — no src set -->';
  return [
    `<section class="section block-image">`,
    `  <div class="container">`,
    `    <img src="${src}" alt="${alt}" loading="lazy" />`,
    `  </div>`,
    `</section>`,
  ].join('\n');
};

const gallery: BlockRenderer = (schema, block) => {
  const images: string[] = Array.isArray(block.config['images'])
    ? (block.config['images'] as string[])
    : (schema.branding.heroImageUrl ? [schema.branding.heroImageUrl] : []);
  if (!images.length) return '<!-- plated:gallery — no images -->';
  const items = images
    .map((src) => `      <li class="gallery__item"><img src="${src}" alt="" loading="lazy" /></li>`)
    .join('\n');
  return [
    `<section class="section block-gallery">`,
    `  <div class="container">`,
    `    <ul class="gallery__grid">`,
    items,
    `    </ul>`,
    `  </div>`,
    `</section>`,
  ].join('\n');
};

const menuPreview: BlockRenderer = (schema) => {
  const cats = schema.menu.categories.slice(0, 2);
  if (!cats.length) return '<!-- plated:menu-preview — no categories -->';
  const items = cats.flatMap((c) =>
    c.items.slice(0, 4).map((i) =>
      `      <div class="menu-card"><span class="menu-card__name">${i.name}</span>${i.price ? `<span class="menu-card__price">${i.price}</span>` : ''}</div>`
    )
  ).join('\n');
  return [
    `<section class="section block-menu-preview">`,
    `  <div class="container">`,
    `    <h2 class="section-title">From Our Menu</h2>`,
    `    <div class="menu-preview-grid">`,
    items,
    `    </div>`,
    `    <a class="btn" href="/menu">Full Menu</a>`,
    `  </div>`,
    `</section>`,
  ].join('\n');
};

const hours: BlockRenderer = (schema) => {
  const loc = schema.locations?.[schema.primaryLocationIndex] ?? schema.locations?.[0];
  if (!loc?.hours?.schedule?.length) return '<!-- plated:hours — no schedule -->';
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const rows = loc.hours.schedule
    .filter((d) => d.open)
    .map((d) => {
      const label = `${d.openTime ?? ''}${d.closeTime ? '–' + d.closeTime : ''}`;
      return `      <tr><th>${DAYS[d.day]}</th><td>${label}</td></tr>`;
    }).join('\n');
  return [
    `<section class="section block-hours">`,
    `  <div class="container">`,
    `    <h2 class="section-title">Hours</h2>`,
    `    <table class="hours-table"><tbody>`,
    rows,
    `    </tbody></table>`,
    loc.hours.additionalNotes ? `    <p class="hours-note">${loc.hours.additionalNotes}</p>` : '',
    `  </div>`,
    `</section>`,
  ].filter(Boolean).join('\n');
};

const map: BlockRenderer = (schema) => {
  const loc = schema.locations?.[schema.primaryLocationIndex] ?? schema.locations?.[0];
  const mapsUrl = loc?.googleMapsUrl ?? '';
  if (!mapsUrl) return '<!-- plated:map — no googleMapsUrl -->';
  // Embed as a simple map link section; users can upgrade to an iframe embed
  const addr = loc ? [loc.address1, loc.city, loc.state, loc.zip].filter(Boolean).join(', ') : '';
  return [
    `<section class="section block-map">`,
    `  <div class="container">`,
    `    <h2 class="section-title">Find Us</h2>`,
    addr ? `    <address class="map-address">${addr}</address>` : '',
    `    <a class="btn btn-ghost" href="${mapsUrl}" target="_blank" rel="noreferrer">Open in Maps</a>`,
    `  </div>`,
    `</section>`,
  ].filter(Boolean).join('\n');
};

const socialFeed: BlockRenderer = (schema) => {
  const ig = schema.social.instagram;
  if (!ig) return '<!-- plated:social-feed — no instagram handle -->';
  return [
    `<section class="section block-social-feed">`,
    `  <div class="container">`,
    `    <h2 class="section-title">Follow Us</h2>`,
    `    <a class="btn btn-ghost" href="https://instagram.com/${ig}" target="_blank" rel="noreferrer">@${ig} on Instagram</a>`,
    `  </div>`,
    `</section>`,
  ].join('\n');
};

const cta: BlockRenderer = (_schema, block) => {
  const heading  = String(block.config['heading']  ?? 'Ready to visit?');
  const subtext  = String(block.config['subtext']  ?? '');
  const btnLabel = String(block.config['btnLabel'] ?? 'Get in Touch');
  const btnHref  = String(block.config['btnHref']  ?? '/contact');
  return [
    `<section class="section block-cta">`,
    `  <div class="container cta-inner">`,
    `    <h2 class="cta-heading">${heading}</h2>`,
    subtext ? `    <p class="cta-subtext">${subtext}</p>` : '',
    `    <a class="btn" href="${btnHref}">${btnLabel}</a>`,
    `  </div>`,
    `</section>`,
  ].filter(Boolean).join('\n');
};

const testimonials: BlockRenderer = (_schema, block) => {
  type Quote = { quote: string; author: string };
  const items: Quote[] = Array.isArray(block.config['items'])
    ? (block.config['items'] as Quote[])
    : [];
  if (!items.length) return '<!-- plated:testimonials — no items -->';
  const cards = items
    .map((q) =>
      `      <figure class="testimonial-card"><blockquote>${q.quote}</blockquote><figcaption>— ${q.author}</figcaption></figure>`
    ).join('\n');
  return [
    `<section class="section block-testimonials">`,
    `  <div class="container">`,
    `    <h2 class="section-title">What People Say</h2>`,
    `    <div class="testimonials-grid">`,
    cards,
    `    </div>`,
    `  </div>`,
    `</section>`,
  ].join('\n');
};

const specials: BlockRenderer = (schema, _block) => {
  const items = (schema.specials ?? []).filter((s) => s.active).slice(0, 6);
  if (!items.length) return '<!-- plated:specials — no active specials -->';
  const cards = items
    .map((s) => [
      `      <div class="special-card">`,
      s.imageUrl ? `        <img src="${s.imageUrl}" alt="${s.title}" loading="lazy" />` : '',
      `        <div class="special-card__body">`,
      `          <h3>${s.title}</h3>`,
      s.description ? `          <p>${s.description}</p>` : '',
      s.price ? `          <span class="special-price">${s.price}</span>` : '',
      `        </div>`,
      `      </div>`,
    ].filter(Boolean).join('\n'))
    .join('\n');
  return [
    `<section class="section block-specials">`,
    `  <div class="container">`,
    `    <h2 class="section-title">Today's Specials</h2>`,
    `    <div class="specials-grid">`,
    cards,
    `    </div>`,
    `  </div>`,
    `</section>`,
  ].join('\n');
};

const eventsList: BlockRenderer = (schema, _block) => {
  const items = (schema.events ?? []).slice(0, 6);
  if (!items.length) return '<!-- plated:events-list — no events -->';
  const cards = items
    .map((e) => [
      `      <div class="event-card">`,
      e.coverImageUrl ? `        <img src="${e.coverImageUrl}" alt="${e.title}" loading="lazy" />` : '',
      `        <div class="event-card__body">`,
      `          <h3>${e.title}</h3>`,
      `          <time>${e.eventDate}</time>`,
      e.description ? `          <p>${e.description}</p>` : '',
      e.ticketUrl ? `          <a class="btn btn-sm" href="${e.ticketUrl}" target="_blank" rel="noreferrer">Tickets</a>` : '',
      `        </div>`,
      `      </div>`,
    ].filter(Boolean).join('\n'))
    .join('\n');
  return [
    `<section class="section block-events">`,
    `  <div class="container">`,
    `    <h2 class="section-title">Upcoming Events</h2>`,
    `    <div class="events-grid">`,
    cards,
    `    </div>`,
    `  </div>`,
    `</section>`,
  ].join('\n');
};

const blogList: BlockRenderer = (schema, _block) => {
  const posts = (schema.blog ?? []).slice(0, 6);
  if (!posts.length) return '<!-- plated:blog-list — no posts -->';
  const cards = posts
    .map((p) =>
      `      <article class="blog-card"><a href="/blog/${p.slug}"><h3>${p.title}</h3></a>${p.excerpt ? `<p>${p.excerpt}</p>` : ''}</article>`
    ).join('\n');
  return [
    `<section class="section block-blog-list">`,
    `  <div class="container">`,
    `    <h2 class="section-title">From the Blog</h2>`,
    `    <div class="blog-grid">`,
    cards,
    `    </div>`,
    `  </div>`,
    `</section>`,
  ].join('\n');
};

const press: BlockRenderer = (schema, _block) => {
  const items = schema.press ?? [];
  if (!items.length) return '<!-- plated:press — no press items -->';
  const logos = items
    .map((p) => [
      `      <a class="press-item"${p.url ? ` href="${p.url}" target="_blank" rel="noreferrer"` : ''}>`,
      p.logoUrl ? `        <img src="${p.logoUrl}" alt="${p.publication}" loading="lazy" />` : '',
      `        <span class="press-item__pub">${p.publication}</span>`,
      p.headline ? `        <span class="press-item__headline">${p.headline}</span>` : '',
      `      </a>`,
    ].filter(Boolean).join('\n'))
    .join('\n');
  return [
    `<section class="section block-press">`,
    `  <div class="container">`,
    `    <h2 class="section-title">As Seen In</h2>`,
    `    <div class="press-grid">`,
    logos,
    `    </div>`,
    `  </div>`,
    `</section>`,
  ].join('\n');
};

const deliveryLinks: BlockRenderer = (schema) => {
  type Link = { label: string; href: string };
  const links: Link[] = [
    schema.social.doordash  && { label: 'DoorDash',  href: schema.social.doordash },
    schema.social.ubereats  && { label: 'Uber Eats', href: schema.social.ubereats },
    schema.social.grubhub   && { label: 'Grubhub',  href: schema.social.grubhub },
    schema.social.toast     && { label: 'Toast',     href: schema.social.toast },
    schema.social.chownow   && { label: 'ChowNow',  href: schema.social.chownow },
  ].filter((l): l is Link => Boolean(l));
  if (!links.length) return '<!-- plated:delivery-links — no delivery platforms -->';
  const btns = links
    .map((l) => `      <a class="btn btn-ghost delivery-btn" href="${l.href}" target="_blank" rel="noreferrer">${l.label}</a>`)
    .join('\n');
  return [
    `<section class="section block-delivery">`,
    `  <div class="container">`,
    `    <h2 class="section-title">Order Online</h2>`,
    `    <div class="delivery-grid">`,
    btns,
    `    </div>`,
    `  </div>`,
    `</section>`,
  ].join('\n');
};

const reservationWidget: BlockRenderer = (schema) => {
  const res = schema.extensions?.reservations;
  if (!res?.widgetUrl) return '<!-- plated:reservation-widget — no widgetUrl -->';
  return [
    `<section class="section block-reservation">`,
    `  <div class="container">`,
    `    <h2 class="section-title">Make a Reservation</h2>`,
    `    <iframe`,
    `      src="${res.widgetUrl}"`,
    `      title="Reservation widget"`,
    `      width="100%" height="540"`,
    `      style="border:none;border-radius:var(--radius-lg,0.75rem)"`,
    `      loading="lazy"`,
    `    ></iframe>`,
    `  </div>`,
    `</section>`,
  ].join('\n');
};

const video: BlockRenderer = (_schema, block) => {
  const src = String(block.config['src'] ?? '');
  if (!src) return '<!-- plated:video — no src set -->';
  const isYt = src.includes('youtube') || src.includes('youtu.be');
  if (isYt) {
    return [
      `<section class="section block-video">`,
      `  <div class="container">`,
      `    <div class="video-embed">`,
      `      <iframe src="${src}" title="Video" frameborder="0" allowfullscreen loading="lazy"></iframe>`,
      `    </div>`,
      `  </div>`,
      `</section>`,
    ].join('\n');
  }
  return [
    `<section class="section block-video">`,
    `  <div class="container">`,
    `    <video src="${src}" controls playsinline preload="metadata"></video>`,
    `  </div>`,
    `</section>`,
  ].join('\n');
};

const divider: BlockRenderer = () =>
  `<hr class="block-divider" />`;

const spacer: BlockRenderer = (_schema, block) => {
  const height = String(block.config['height'] ?? '4rem');
  return `<div class="block-spacer" style="height:${height}" aria-hidden="true"></div>`;
};

const customEmbed: BlockRenderer = (_schema, block) => {
  const html = String(block.config['html'] ?? '');
  if (!html) return '<!-- plated:custom-embed — empty -->';
  return [
    `<section class="section block-custom-embed">`,
    `  <div class="container">`,
    html,
    `  </div>`,
    `</section>`,
  ].join('\n');
};

// ── Dispatch table ─────────────────────────────────────────────────────────

const RENDERERS: Record<string, BlockRenderer> = {
  'hero':                 hero,
  'text':                 text,
  'image':                image,
  'gallery':              gallery,
  'menu-preview':         menuPreview,
  'hours':                hours,
  'map':                  map,
  'social-feed':          socialFeed,
  'cta':                  cta,
  'testimonials':         testimonials,
  'specials':             specials,
  'events-list':          eventsList,
  'blog-list':            blogList,
  'press':                press,
  'delivery-links':       deliveryLinks,
  'reservation-widget':   reservationWidget,
  'video':                video,
  'divider':              divider,
  'spacer':               spacer,
  'custom-embed':         customEmbed,
};

/**
 * renderBlock — renders a single block to an Astro-compatible HTML string.
 * Returns an HTML comment when the block type is unknown or invisible.
 */
export function renderBlock(schema: ProjectSchema, block: BlockSchema): string {
  if (!block.visible) return `<!-- plated:hidden block=${block.type} -->`;
  const renderer = RENDERERS[block.type];
  if (!renderer) return `<!-- plated:unknown block=${block.type} -->`;
  return renderer(schema, block);
}
