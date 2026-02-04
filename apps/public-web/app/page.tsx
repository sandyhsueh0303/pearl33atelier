import HomeButton from './components/HomeButton'

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '2rem',
      backgroundColor: '#fafafa'
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        marginBottom: '1rem',
        color: '#333'
      }}>
        33 Pearl Atelier
      </h1>
      <p style={{ 
        fontSize: '1.25rem', 
        color: '#666', 
        marginBottom: '2rem',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        Curated collection of exquisite pearl jewelry
      </p>
      <HomeButton />
    </div>
  )
}