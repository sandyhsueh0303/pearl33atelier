import Link from 'next/link'
import { listAdminBlogPosts } from '@/app/lib/blogAdmin'
import AdminPageHeader from '../components/AdminPageHeader'

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
      <AdminPageHeader
        title="Blog"
        actions={
          <Link
          href="/admin/blog/new"
          className="admin-link-btn admin-link-btn-soft"
        >
          <span aria-hidden="true" className="admin-link-btn-soft-icon">✦</span>
          <span>Write with AI</span>
        </Link>
        }
      />

      <div className="admin-card" style={{ padding: '1.25rem 1.25rem 1rem' }}>
        <div className="admin-section-header">
          <div>
            <div className="admin-section-kicker">Existing Articles</div>
            <div className="admin-section-subtitle">
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
