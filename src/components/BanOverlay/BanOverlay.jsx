import { useState, useEffect } from 'react'
import './BanOverlay.css'
import { API_URL } from '../../services/api';

export default function BanOverlay({ user, onUnban }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [banDuration, setBanDuration] = useState('permanent')
  const [processing, setProcessing] = useState(false)

  // Debug: Log user data
  useEffect(() => {
    console.log('🔍 BAN OVERLAY DEBUG:')
    console.log('User:', user)
    console.log('ban_until:', user.ban_until)
    console.log('is_banned:', user.is_banned)
  }, [user])

  // Calculate ban duration and price
  useEffect(() => {
    if (!user.ban_until || user.ban_until === null) {
      console.log('❌ No ban_until - PERMANENT BAN')
      setBanDuration('permanent')
      setTimeLeft('PERMANENT')
      return
    }

    const updateCountdown = () => {
      const now = new Date()
      const banUntil = new Date(user.ban_until)
      const diff = banUntil - now

      console.log('Now:', now)
      console.log('Ban Until:', banUntil)
      console.log('Diff (ms):', diff)

      if (diff <= 0) {
        setTimeLeft('EXPIRED')
        setBanDuration('expired')
        return
      }

      const totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      console.log('Total days remaining:', totalDays)

      // Determine duration category
      if (totalDays <= 3) {
        setBanDuration('3')
      } else if (totalDays <= 7) {
        setBanDuration('7')
      } else {
        setBanDuration('permanent')
      }

      setTimeLeft(`${days}d ${hours}h ${mins}m`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [user.ban_until])

  const getUnbanPrice = () => {
    console.log('💰 Ban Duration:', banDuration)
    
    if (banDuration === 'expired') return 0
    if (banDuration === '3') return 30
    if (banDuration === '7') return 70
    return 300
  }

  // ✅ RAZORPAY SDK PAYMENT (NO LINKS!)
  const handlePayment = async () => {
    if (processing) return;
    
    const amount = getUnbanPrice()
    
    console.log('💳 Payment initiated:', amount, 'Duration:', banDuration)
    
    if (amount === 0) {
      alert('Ban has expired! Please refresh the page.')
      return
    }
    
    setProcessing(true)

    try {
      // Create unban order
      const response = await fetch(`${API_URL}/api/payments/create-unban-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ban_duration: banDuration })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create unban order')
      }

      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Payment system not loaded')
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Cherrish',
        description: `Unban Account - ${banDuration === '3' ? '3 Days' : banDuration === '7' ? '7 Days' : 'Permanent'}`,
        order_id: data.order_id,
        
        handler: async function (paymentResponse) {
          try {
            const verifyRes = await fetch(`${API_URL}/api/payments/verify-unban-payment`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              })
            })

            const verifyData = await verifyRes.json()

            if (verifyData.success) {
              alert('✅ ACCOUNT UNBANNED!\n\nYou can now access Cherrish.')
              window.location.reload()
            } else {
              throw new Error(verifyData.error || 'Verification failed')
            }
          } catch (error) {
            alert('Payment verification failed. Contact support.')
            setProcessing(false)
          }
        },
        
        theme: { color: '#FF4757' },
        
        modal: {
          ondismiss: function() {
            setProcessing(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      
      rzp.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`)
        setProcessing(false)
      })
      
      rzp.open()

    } catch (error) {
      alert(error.message)
      setProcessing(false)
    }
  }

  useEffect(() => {
    const prevent = (e) => { e.preventDefault(); return false; }
    document.addEventListener('contextmenu', prevent)
    document.addEventListener('keydown', prevent)
    return () => {
      document.removeEventListener('contextmenu', prevent)
      document.removeEventListener('keydown', prevent)
    }
  }, [])

  const handleEmergencyLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('auth_token')
      window.location.href = '/'
    }
  }

  return (
    <div className="ban-overlay">
      <div className="jail-bars"></div>
      <div className="dark-tint"></div>

      <div className="wide-ban-card">
        {/* Full Width Header */}
        <div className="ban-header-strip">
          <h1>🛑 ACCOUNT BANNED 🛑</h1>
        </div>

        <div className="ban-body-horizontal">
          
          {/* LEFT COL: The "Record" */}
          <div className="col-left">
            <div className="info-table">
              <div className="info-row">
                <span className="info-label">OFFENDER</span>
                <span className="info-value">
                  {user.username} <span className="tag">#{user.user_number}</span>
                </span>
              </div>
              <div className="info-row highlight-red">
                <span className="info-label">SENTENCE</span>
                <span className="info-value blink-text">{timeLeft}</span>
              </div>
              <div className="info-row">
                <span className="info-label">VIOLATION</span>
                <span className="info-value">COMMUNITY GUIDELINES</span>
              </div>
            </div>

            <div className="fomo-mini">
              <span className="fomo-icon">💔</span>
              <div className="fomo-text">
                <strong>128+ CONFESSIONS LIVE</strong>
                <p>You are missing all the gossip right now.</p>
              </div>
            </div>
          </div>

          {/* VERTICAL DIVIDER */}
          <div className="dashed-divider"></div>

          {/* RIGHT COL: The "Bail" */}
          <div className="col-right">
            <div className="bail-header">
              <h3>WANT TO UNBAN?</h3>
              <p>Pay the fine to restore access immediately.</p>
            </div>

            <button 
              className="brutal-pay-btn-large" 
              onClick={handlePayment}
              disabled={processing}
            >
              <div className="btn-left">
                <span className="label">FINE AMOUNT</span>
                <span className="price">₹{getUnbanPrice()}</span>
              </div>
              <div className="btn-right">
                <span>{processing ? 'PROCESSING...' : 'PAY NOW'}</span>
                {!processing && <i className="fas fa-arrow-right"></i>}
              </div>
            </button>

            <div className="secure-badge">
              <i className="fas fa-lock"></i> SECURE PAYMENT GATEWAY
            </div>
            
            {/* DEBUG INFO - Remove after testing */}
            <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#666', textAlign: 'center' }}>
              DEBUG: Duration={String(banDuration)} | Price=₹{getUnbanPrice()}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="card-footer-strip">
          <p>⚠️ VIOLATION DETECTED • ACCESS REVOKED • PAY TO RESTORE</p>
        </div>
        
        <button 
          onClick={handleEmergencyLogout}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#FF0000',
            color: '#FFF',
            border: '3px solid #000',
            padding: '8px 15px',
            cursor: 'pointer',
            fontWeight: '900',
            fontSize: '0.8rem',
            boxShadow: '4px 4px 0 #000',
            zIndex: 999
          }}
        >
          🚪 EMERGENCY LOGOUT
        </button>
      </div>
    </div>
  )
}
