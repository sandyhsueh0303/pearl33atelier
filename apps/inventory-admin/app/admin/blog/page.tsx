import Link from 'next/link'
import { listAdminBlogPosts } from '@/app/lib/blogAdmin'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

export default async function BlogAdminPage() {
  const posts = await listAdminBlogPosts()

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-title-row">
          <h1 className="admin-page-title">Blog</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/blog/new" className="admin-link-btn admin-link-btn-primary">
            New Article
          </Link>
          <Link href="/api/blog/posts" className="admin-link-btn" style={{ background: '#f5f5f5' }}>
            Open JSON
          </Link>
        </div>
      </div>

      <div
        style={{
          marginBottom: '1rem',
          padding: '0.95rem 1rem',
          borderRadius: '10px',
          border: '1px solid rgba(201, 169, 97, 0.22)',
          background: 'linear-gradient(145deg, #fffdf8 0%, #f8f3ea 100%)',
          color: '#5a4630',
          lineHeight: 1.6,
        }}
      >
        This page reads the existing Markdown posts in <code>apps/public-web/content/blog</code>{' '}
        and lists publishable articles with valid blog frontmatter. Pipeline prompts and schemas
        now live separately in <code>apps/public-web/content/blog-pipeline</code>.
      </div>

      <div className="admin-card" style={{ padding: '1.25rem 1.25rem 1rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Existing Articles
            </div>
            <div style={{ color: '#5a4630', marginTop: '0.2rem' }}>
              {posts.length} article{posts.length === 1 ? '' : 's'} found
            </div>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="admin-empty-state" style={{ padding: '2rem 1rem' }}>
            No publishable blog posts were found.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {posts.map((post) => (
              <article
                key={post.slug}
                style={{
                  border: '1px solid #ece7de',
                  borderRadius: '14px',
                  padding: '1rem 1.1rem',
                  background: '#fff',
                  display: 'grid',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'grid', gap: '0.35rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#2f2418' }}>{post.title}</h2>
                    <div style={{ color: '#7b6a55', fontSize: '0.95rem' }}>/blog/{post.slug}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="admin-pill admin-pill-gold">{formatDate(post.publishedAt)}</span>
                    <span className="admin-pill">{post.readingMinutes} min</span>
                  </div>
                </div>

                <p style={{ margin: 0, color: '#5a4630', lineHeight: 1.65 }}>{post.excerpt}</p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {post.tags.map((tag) => (
                      <span
                        key={`${post.slug}-${tag}`}
                        style={{
                          padding: '0.25rem 0.55rem',
                          borderRadius: '999px',
                          background: '#f6f1e7',
                          color: '#6f5837',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ color: '#7b6a55', fontSize: '0.88rem' }}>
                    {post.updatedAt ? `Updated ${formatDate(post.updatedAt)} · ` : ''}
                    {post.fileName}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
