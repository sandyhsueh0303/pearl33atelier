import { colors, spacing } from '../constants/design'

export default function ProductsLoading() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: colors.white,
        padding: `clamp(1rem, 3vw, ${spacing['3xl']})`,
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div
          style={{
            height: '42px',
            width: '220px',
            backgroundColor: '#f1f1f1',
            margin: `0 auto ${spacing.md}`,
          }}
        />
        <div
          style={{
            height: '20px',
            width: '320px',
            backgroundColor: '#f5f5f5',
            margin: `0 auto ${spacing['2xl']}`,
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: spacing['2xl'],
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ backgroundColor: colors.white, border: '1px solid #f1f1f1' }}>
              <div style={{ width: '100%', paddingBottom: '100%', backgroundColor: '#f3f3f3' }} />
              <div style={{ padding: spacing.lg }}>
                <div style={{ height: '22px', width: '70%', backgroundColor: '#f3f3f3', marginBottom: spacing.sm }} />
                <div style={{ height: '14px', width: '45%', backgroundColor: '#f5f5f5' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
