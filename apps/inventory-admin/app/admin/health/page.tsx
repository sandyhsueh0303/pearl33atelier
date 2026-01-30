export default function AdminHealthPage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Admin Health Check</h1>
      <p style={{ color: 'green', fontSize: '2rem', fontWeight: 'bold' }}>OK</p>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Inventory Admin is running successfully
      </p>
    </main>
  )
}
