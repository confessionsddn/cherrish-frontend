import { useEffect } from 'react'

export default function AuthCallback() {
  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      // Store token
      localStorage.setItem('auth_token', token)
      console.log('✅ Token saved:', token.substring(0, 20) + '...')
      
      // Redirect to home
      window.location.href = '/'
    } else {
      // No token - redirect to home with error
      console.error('❌ No token in callback')
      window.location.href = '/?error=auth_failed'
    }
  }, [])

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100vh',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textTransform: 'uppercase'
    }}>
      🔐 Logging you in...
    </div>
  )
}