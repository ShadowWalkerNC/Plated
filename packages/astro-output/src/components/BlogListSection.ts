import type { ProjectSchema } from '@plated/types';
import type { AstroFile }    from '../types.js';

export function buildBlogListComponent(schema: ProjectSchema): AstroFile {
  const posts = JSON.stringify((schema.blog ?? []).slice(0, 6), null, 2);

  return {
    path: 'src/components/BlogListSection.astro',
    content: `---
type Post = { id:string; title:string; slug:string; excerpt?:string; publishedAt?:string; };
const posts: Post[] = ${posts};
---
{posts.length > 0 && (
  <section class="section block-blog-list">
    <div class="container">
      <h2 class="section-title">From the Blog</h2>
      <div class="blog-grid">
        {posts.map((p) => (
          <article class="blog-card">
            <a href={\`/blog/\${p.slug}\`}>
              <h3>{p.title}</h3>
            </a>
            {p.excerpt && <p>{p.excerpt}</p>}
            {p.publishedAt && <time>{p.publishedAt}</time>}
          </article>
        ))}
      </div>
      <a class="btn btn-ghost" href="/blog">All Posts</a>
    </div>
  </section>
)}

<style>
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(min(100%,300px),1fr));
  gap: var(--space-6,1.5rem);
  margin-top: var(--space-8,2rem);
  margin-bottom: var(--space-8,2rem);
}
.blog-card {
  background: var(--color-bg-surface,var(--color-surface));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg,0.75rem);
  padding: var(--space-4,1rem) var(--space-6,1.5rem);
}
.blog-card h3 { font-weight:700; margin-bottom:var(--space-2,0.5rem); }
.blog-card p  { color:var(--color-text-secondary,var(--color-text-muted)); font-size:0.95rem; }
.blog-card time { display:block; font-size:0.8rem; color:var(--color-text-muted); margin-top:var(--space-2,0.5rem); }
</style>
`,
  };
}
