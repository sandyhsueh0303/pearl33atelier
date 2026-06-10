import Link from 'next/link'
import { listAdminBlogPosts } from '@/app/lib/blogAdmin'
import AdminPageHeader from '../components/AdminPageHeader'
import styles from './page.module.css'

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

      <div className={`admin-card ${styles.blogCard}`}>
        <div className="admin-section-header">
          <div>
            <div className="admin-section-kicker">Existing Articles</div>
            <div className="admin-section-subtitle">
              {posts.length} article{posts.length === 1 ? '' : 's'} found
            </div>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className={`admin-empty-state ${styles.emptyState}`}>
            No publishable blog posts were found.
          </div>
        ) : (
          <div className={styles.postList}>
            {posts.map((post) => (
              <article
                key={post.slug}
                className={styles.postCard}
              >
                <div className={styles.postHeader}>
                  <div className={styles.postTitleGroup}>
                    <h2 className={styles.postTitle}>{post.title}</h2>
                    <div className={styles.postSlug}>/blog/{post.slug}</div>
                  </div>
                  <div className={styles.pillRow}>
                    <span className="admin-pill admin-pill-gold">{formatDate(post.publishedAt)}</span>
                    <span className="admin-pill">{post.readingMinutes} min</span>
                  </div>
                </div>

                <p className={styles.excerpt}>{post.excerpt}</p>

                <div className={styles.postFooter}>
                  <div className={styles.tagList}>
                    {post.tags.map((tag) => (
                      <span
                        key={`${post.slug}-${tag}`}
                        className={styles.tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className={styles.fileMeta}>
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
