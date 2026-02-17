import { useState, useEffect, useRef } from 'react'
import { confessionsAPI, authAPI, API_URL } from './services/api'
import LandingPage from './pages/LandingPage'
import AccessCodePage from './pages/AccessCodePage'
import AdminPanel from './pages/AdminPanel'
import AdminChatPage from './pages/AdminChatPage'
import ContactUsPage from './pages/ContactUsPage'
import TermsAndConditionsPage from './pages/TermsAndConditionsPage'
import RefundsCancellationPage from './pages/RefundsCancellationPage'
import BanOverlay from './components/BanOverlay/BanOverlay'
import Header from './components/Header/Header'
import ConfessionForm from './components/ConfessionForm/ConfessionForm'
import FilterBar from './components/ConfessionFeed/FilterBar'
import ConfessionFeed from './components/ConfessionFeed/ConfessionFeed'
import PremiumModal from './components/Modals/PremiumModal'
import GiftModal from './components/Modals/GiftModal'
import BuyCreditsModal from './components/Modals/BuyCreditsModal'
import PremiumSubscriptionModal from './components/Modals/PremiumSubscriptionModal'
import ChangeUsernameModal from './components/Modals/ChangeUsernameModal'
import { ThemeProvider, useTheme } from './context/ThemeContext'
// Community Pages
import CommunityPage from './pages/CommunityPage'
import AdminCommunityPanel from './components/AdminCommunityPanel/AdminCommunityPanel'

import { 
  ConfettiContainer, 
  MoodTransitionOverlay, 
  FullscreenHearts, 
  BrutalNotification 
} from './components/Animations/AnimationComponents'

// ============================================
// HASH ROUTING HANDLER (for OAuth callback)
// ============================================
function HashRouter() {
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      // Handle #/auth/callback?token=...
      if (hash.includes('#/auth/callback')) {
        const params = new URLSearchParams(hash.split('?')[1]);
        const token = params.get('token');
        
        if (token) {
          console.log('✅ Token received via hash routing');
          localStorage.setItem('auth_token', token);
          
          // Clear hash and redirect to home
          window.location.hash = '';
          window.location.href = '/';
        }
      }
      
      // Handle #/access-code?data=...
      if (hash.includes('#/access-code')) {
        const params = new URLSearchParams(hash.split('?')[1]);
        const data = params.get('data');
        
        if (data) {
          console.log('✅ Access code data received via hash');
          // Clear hash and redirect
          window.location.hash = '';
          window.location.href = `/access-code?data=${data}`;
        }
      }
    };
    
    // Check on mount
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  return null;
}


function App() {
  // ============================================
  // AUTH STATE
  // ============================================

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [premiumData, setPremiumData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // ============================================
  // APP STATE
  // ============================================
  const [confessions, setConfessions] = useState([])
  const [currentFilter, setCurrentFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [theme, setTheme] = useState('light')
  const [userCredits, setUserCredits] = useState(0)
  const [notification, setNotification] = useState(null)
  
  // ============================================
  // MODAL STATE
  // ============================================
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showGiftModal, setShowGiftModal] = useState(false)
  const [selectedConfessionId, setSelectedConfessionId] = useState(null)
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false)
  const [showPremiumSubscriptionModal, setShowPremiumSubscriptionModal] = useState(false)
  const [showChangeUsernameModal, setShowChangeUsernameModal] = useState(false)
  
  // ============================================
  // REFS
  // ============================================
  const reactionDebounceRef = useRef({})
  
  // ============================================
  // COMPUTED STATE
  // ============================================
  const isBanned = isAuthenticated && user && user.is_banned
const [currentPath, setCurrentPath] = useState(window.location.pathname)

  // ============================================
// ONESIGNAL PLAYER ID REGISTRATION
// ============================================
useEffect(() => {
  if (user && user.id && window.OneSignalDeferred) {
    console.log('🔔 Registering OneSignal...');
    
    window.OneSignalDeferred.push(async function(OneSignal) {
      try {
        // Get the player ID
        const playerId = await OneSignal.User.PushSubscription.id;
        
        if (playerId) {
          console.log('📱 OneSignal Player ID:', playerId);
          
          // Save to backend
          const response = await fetch(`${API_URL}/api/notifications/register`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              player_id: playerId,
              push_enabled: true 
            })
          });
          
          const data = await response.json();
          
          if (data.success) {
            console.log('✅ Push notifications registered!');
          } else {
            console.error('❌ Failed to save player ID:', data.error);
          }
        }
      } catch (error) {
        console.error('OneSignal setup error:', error);
      }
    });
  }
}, [user]);
  // ============================================
  // AUTH FUNCTIONS
  // ============================================
  
  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      setLoading(false)
      setIsAuthenticated(false)
      return
    }

    try {
      const data = await authAPI.getCurrentUser()
      setUser(data.user)
      setUserCredits(data.user.credits)
      setPremiumData(data.user.premium_data)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      
      // Handle banned user
      if (error.message && error.message.includes('banned')) {
        localStorage.removeItem('auth_token')
        setIsAuthenticated(false)
        window.location.href = '/'
        return
      }
      
      // Invalid token
      localStorage.removeItem('auth_token')
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    setIsAuthenticated(false)
    setUser(null)
    window.location.href = '/'
  }

  // ============================================
  // DATA LOADING FUNCTIONS
  // ============================================
  
  const loadConfessions = async () => {
    try {
      let url = `${API_URL}/api/confessions`
      const params = new URLSearchParams()
      
      // Apply filters
      if (currentFilter === 'my-posts') {
        params.append('my_posts', 'true')
      } else if (currentFilter === 'spotlight') {
        params.append('filter_type', 'spotlight')
      } else if (currentFilter === 'boosted') {
        params.append('filter_type', 'boosted')
      } else if (currentFilter !== 'all') {
        params.append('mood_zone', currentFilter)
      }
      
      params.append('sort', sortBy)
      
      if (params.toString()) {
        url += '?' + params.toString()
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      const data = await response.json()
      
      setConfessions(data.confessions || [])
    } catch (error) {
      console.error('Failed to load confessions:', error)
      showNotification('Failed to load confessions', 'error')
    }
  }

  const fetchUserData = async () => {
    try {
      const data = await authAPI.getCurrentUser()
      setUser(data.user)
      setUserCredits(data.user.credits)
      setPremiumData(data.user.premium_data)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  // ============================================
  // CONFESSION HANDLERS
  // ============================================
  
  const handleNewConfession = async (confession) => {
    try {
      const formData = new FormData()
      formData.append('content', confession.content)
      formData.append('mood_zone', confession.mood_zone)
      
      if (confession.audioBlob) {
        formData.append('audio', confession.audioBlob, 'confession.webm')
        formData.append('voice_duration', confession.voice_duration || 0)
      }
      
      const response = await fetch(`${API_URL}/api/confessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to post')
      }
      
      const data = await response.json()
      
      // Add new confession to top of feed
      setConfessions([data.confession, ...confessions])
      setUserCredits(data.credits_remaining)
      showNotification(data.message, 'success')
      
      // Refresh user data to update premium usage
      if (user?.is_premium) {
        fetchUserData()
      }
      
    } catch (error) {
      console.error('Failed to post confession:', error)
      showNotification(error.message, 'error')
    }
  }

  // ============================================
  // REACTION HANDLER (Optimistic UI)
  // ============================================
  
  const handleReaction = async (confessionId, reactionType, action = 'add') => {
    // Handle remove all
    if (action === 'remove_all') {
      try {
        const data = await confessionsAPI.react(confessionId, reactionType, action)
        setConfessions(prev => prev.map(conf => 
          conf.id === confessionId ? { ...conf, reactions: data.reactions } : conf
        ))
        setUserCredits(data.credits_remaining)
        showNotification(`Removed ${data.removed_count} ${reactionType} reactions`, 'info')
      } catch (error) {
        console.error('Failed to remove reactions:', error)
        showNotification(error.message, 'error')
      }
      return
    }
    
    // Optimistic update ID
    const optimisticId = `${confessionId}-${reactionType}-${Date.now()}`
    
    // Immediately update UI (optimistic)
    setConfessions(prev => prev.map(conf => {
      if (conf.id === confessionId) {
        return {
          ...conf,
          reactions: {
            ...conf.reactions,
            [reactionType]: (conf.reactions[reactionType] || 0) + 1
          },
          _pendingReaction: optimisticId
        }
      }
      return conf
    }))
    
    // Send to server
    try {
      const data = await confessionsAPI.react(confessionId, reactionType, 'add')
      
      // Replace optimistic update with real data
      setConfessions(prev => prev.map(conf => {
        if (conf.id === confessionId) {
          const { _pendingReaction, ...rest } = conf
          return { ...rest, reactions: data.reactions }
        }
        return conf
      }))
      
      setUserCredits(data.credits_remaining)
      
    } catch (error) {
      console.error('Reaction failed:', error)
      
      // Revert optimistic update
      setConfessions(prev => prev.map(conf => {
        if (conf.id === confessionId && conf._pendingReaction === optimisticId) {
          const { _pendingReaction, ...rest } = conf
          return {
            ...rest,
            reactions: {
              ...rest.reactions,
              [reactionType]: Math.max((rest.reactions[reactionType] || 0) - 1, 0)
            }
          }
        }
        return conf
      }))
      
      // Show error message
      if (error.message?.includes('Not enough credits')) {
        showNotification('❌ Not enough credits!', 'error')
      } else if (error.message?.includes('10 TIMES PER MINUTE')) {
        showNotification('⏰ Slow down! 10 reactions per minute limit.', 'error')
      } else {
        showNotification('Failed to react', 'error')
      }
    }
  }

  // ============================================
  // GIFT HANDLER
  // ============================================
  
  const handleSendGift = async (giftType, price) => {
    try {
      const response = await fetch(`${API_URL}/api/gifts/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gift_id: giftType,
          receiver_id: selectedConfessionId,
          confession_id: selectedConfessionId
        })
      })

      const data = await response.json()

      if (data.success) {
        setUserCredits(data.credits_remaining)
        setShowGiftModal(false)
        showNotification(`GIFT SENT! 🎁 ${data.message}`, 'success')
        
        // Show unlock notification if just unlocked
        if (data.receiver_progress?.just_unlocked) {
          setTimeout(() => {
            showNotification(`🎉 GIFT UNLOCKED!`, 'success')
          }, 1500)
        }
      } else {
        showNotification(data.error || 'Failed to send gift', 'error')
      }
    } catch (error) {
      console.error('Send gift error:', error)
      showNotification('NOT ENOUGH CREDITS! 💸', 'error')
    }
  }

  // ============================================
  // MODAL HANDLERS
  // ============================================
  
  const handlePremiumClick = () => {
    setShowPremiumSubscriptionModal(true)
  }

  const handleBuyCreditsClick = () => {
    setShowBuyCreditsModal(true)
  }

  const handleUsernameChange = (newUsername, newCredits) => {
    setUser({ ...user, username: newUsername, username_changed: true })
    setUserCredits(newCredits)
  }

  // ============================================
  // UI FUNCTIONS
  // ============================================
  
  

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // ============================================
  // EFFECTS
  // ============================================
  
  // OAuth callback handler - MUST BE FIRST!
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    
    if (currentPath === '/auth/callback' && token) {
      console.log('✅ OAuth token received')
      localStorage.setItem('auth_token', token)
      
      // Small delay to ensure storage is written
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
    }
  }, [currentPath])

  useEffect(() => {
    const syncPath = () => setCurrentPath(window.location.pathname)
    window.addEventListener('popstate', syncPath)
    return () => window.removeEventListener('popstate', syncPath)
  }, [])
  // Check auth on mount (skip for certain routes)
  useEffect(() => {
    if (currentPath === '/auth/callback' || currentPath === '/access-code') {
      setLoading(false)
      return
    }
    checkAuth()
  }, [currentPath])

  // Load confessions when authenticated
  useEffect(() => {
    if (isAuthenticated && currentPath === '/') {
      loadConfessions()
    }
  }, [currentFilter, isAuthenticated, sortBy, currentPath])

  // Apply theme


  // ============================================
  // ROUTING
  // ============================================
  
  // OAuth callback - MUST HANDLE FIRST
  if (currentPath === '/auth/callback') {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        fontSize: '1.5rem', 
        fontWeight: 'bold',
        fontFamily: 'Dela Gothic One, cursive',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✅</div>
          <div>LOGGING IN...</div>
        </div>
      </div>
    )
  }

  // Access code page
  if (currentPath === '/access-code') {
    return <AccessCodePage />
  }

  // Mandatory legal pages
  if (currentPath === '/contact-us') {
    return <ContactUsPage />
  }

  if (currentPath === '/terms-and-conditions') {
    return <TermsAndConditionsPage />
  }

  if (currentPath === '/refunds-and-cancellation-policy') {
    return <RefundsCancellationPage />
  }
  // Admin panel
  if (currentPath === '/admin') {
    if (loading) {
      return <div className="admin-loading">LOADING ADMIN PANEL...</div>
    }
    if (!isAuthenticated || !user?.is_admin) {
      window.location.href = '/'
      return null
    }
    return <AdminPanel />
  }

  // Admin chat page
  if (currentPath === '/admin-chat') {
    if (loading) {
      return <div className="admin-loading">LOADING...</div>
    }
    if (!isAuthenticated) {
      window.location.href = '/'
      return null
    }
    return (
      <>
        
        <Header 
          credits={userCredits}
          onThemeToggle={toggleTheme}
          onPremiumClick={handlePremiumClick}
          onBuyCreditsClick={handleBuyCreditsClick}
          onLogout={handleLogout}
          onChangeUsername={() => setShowChangeUsernameModal(true)}
          theme={theme}
          isAuthenticated={isAuthenticated}
          user={user}
        />
        <AdminChatPage />
      </>
    )
  }

  // Community page
  if (currentPath === '/community') {
    if (loading) {
      return <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        fontSize: '1.5rem', 
        fontWeight: 'bold',
        fontFamily: 'Dela Gothic One, cursive'
      }}>
        LOADING...
      </div>
    }
    if (!isAuthenticated) {
      window.location.href = '/'
      return null
    }
    return (
      <>
        <Header 
          credits={userCredits}
          onThemeToggle={toggleTheme}
          onPremiumClick={handlePremiumClick}
          onBuyCreditsClick={handleBuyCreditsClick}
          onLogout={handleLogout}
          onChangeUsername={() => setShowChangeUsernameModal(true)}
          theme={theme}
          isAuthenticated={isAuthenticated}
          user={user}
        />
        <CommunityPage />
      </>
    )
  }

  // Admin community panel
  if (currentPath === '/admin/community') {
    if (loading) {
      return <div className="admin-loading">LOADING...</div>
    }
    if (!isAuthenticated || !user?.is_admin) {
      window.location.href = '/'
      return null
    }
    return (
      <>
        <Header 
          credits={userCredits}
          onThemeToggle={toggleTheme}
          onPremiumClick={handlePremiumClick}
          onBuyCreditsClick={handleBuyCreditsClick}
          onLogout={handleLogout}
          onChangeUsername={() => setShowChangeUsernameModal(true)}
          theme={theme}
          isAuthenticated={isAuthenticated}
          user={user}
        />
        <AdminCommunityPanel />
      </>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        fontSize: '1.5rem', 
        fontWeight: 'bold',
        fontFamily: 'Dela Gothic One, cursive'
      }}>
        LOADING...
      </div>
    )
  }

  // Ban overlay (takes over entire screen)
  if (isBanned) {
    return <BanOverlay user={user} onUnban={() => checkAuth()} />
  }

  // Not authenticated - show landing page
  if (!isAuthenticated) {
    return <LandingPage />
  }

  // ============================================
  // MAIN APP (Authenticated)
  // ============================================
  
  const filteredConfessions = currentFilter === 'all' 
    ? confessions 
    : confessions.filter(conf => conf.mood_zone === currentFilter)

  return (
      <ThemeProvider user={user}>
    <>
       <HashRouter />
      {/* Global animations */}
      <ConfettiContainer />
      <MoodTransitionOverlay />
      <FullscreenHearts />
      
      {/* Notifications */}
      {notification && (
        <BrutalNotification 
          message={notification.message} 
          type={notification.type} 
        />
      )}

      {/* Header */}
      <Header 
        credits={userCredits}
        onThemeToggle={toggleTheme}
        onPremiumClick={handlePremiumClick}
        onBuyCreditsClick={handleBuyCreditsClick}
        onLogout={handleLogout}
        onChangeUsername={() => setShowChangeUsernameModal(true)}
        theme={theme}
        isAuthenticated={isAuthenticated}
        user={user}
      />

      {/* Main content */}
      <div className="app-container">
        {/* Confession creation form */}
        <div className="create-section">
          <ConfessionForm 
            onSubmit={handleNewConfession}
            onNotification={showNotification}
            user={user}
            premiumData={premiumData}
          />
        </div>

        {/* Filter bar */}
        <div className="top-section">
          <FilterBar 
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            onSortChange={setSortBy}
            onRefresh={loadConfessions}
          />
        </div>

        {/* Confession feed */}
        <div className="feed-section">
          <ConfessionFeed 
            confessions={filteredConfessions}
            onReaction={handleReaction}
            onGiftClick={(confessionId) => {
              setSelectedConfessionId(confessionId)
              setShowGiftModal(true)
            }}
            onCreditsUpdate={setUserCredits}
            currentUserId={user?.id}
            isPremium={user?.is_premium}
            premiumData={premiumData}
            isAdmin={user?.is_admin}
          />
        </div>
      </div>

      {/* Modals */}
      {showPremiumModal && (
        <PremiumModal 
          onClose={() => setShowPremiumModal(false)}
          onPurchase={() => {}}
          credits={userCredits}
        />
      )}

    {showGiftModal && (
  <GiftModal
    confession={confessions.find(c => c.id === selectedConfessionId) || { id: selectedConfessionId, username: '?', user_number: '?' }}
    user={user}
    onClose={() => setShowGiftModal(false)}
    onCreditsUpdate={setUserCredits}
  />
)}

      {showBuyCreditsModal && (
        <BuyCreditsModal 
          onClose={() => setShowBuyCreditsModal(false)}
          currentCredits={userCredits}
          onSuccess={fetchUserData}
        />
      )}

      {showPremiumSubscriptionModal && (
        <PremiumSubscriptionModal 
          onClose={() => setShowPremiumSubscriptionModal(false)}
          currentCredits={userCredits}
          onSuccess={fetchUserData}
        />
      )}

      {showChangeUsernameModal && (
        <ChangeUsernameModal 
          onClose={() => setShowChangeUsernameModal(false)}
          currentUsername={user?.username}
          isPremium={user?.is_premium}
          credits={userCredits}
          onSuccess={handleUsernameChange}
        />
      )}
    </>
          </ThemeProvider>

  )
}

export default App
