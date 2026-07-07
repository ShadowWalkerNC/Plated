import type { ProjectSchema } from '@plated/types';
import type { AstroFile }    from '../types.js';

export function buildTestimonialsComponent(_schema: ProjectSchema): AstroFile {
  return {
    path: 'src/components/Testimonials.astro',
    content: `---
interface Quote { quote: string; author: string; }
interface Props { items?: Quote[]; heading?: string; }
const { items = [], heading = 'What People Say' } = Astro.props;
---
{items.length > 0 && (
  <section class="section block-testimonials">
    <div class="container">
      <h2 class="section-title">{heading}</h2>
      <div class="testimonials-grid">
        {items.map((q) => (
          <figure class="testimonial-card">
            <blockquote class="testimonial-card__quote">{q.quote}</blockquote>
            <figcaption class="testimonial-card__author">— {q.author}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
)}

<style>
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%,320px),1fr));
  gap: var(--space-6, 1.5rem);
  margin-top: var(--space-8, 2rem);
}
.testimonial-card {
  background: var(--color-bg-surface, var(--color-surface));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg, 0.75rem);
  padding: var(--space-6, 1.5rem);
  display: grid;
  gap: var(--space-4, 1rem);
}
.testimonial-card__quote  { font-style: italic; line-height: 1.7; }
.testimonial-card__author { font-weight: 600; font-size: 0.9rem; color: var(--color-text-muted, var(--color-text-secondary)); }
</style>
`,
  };
}
