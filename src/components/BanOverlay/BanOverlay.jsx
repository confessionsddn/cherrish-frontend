// BanOverlay with RAZORPAY SDK (No Links!)
import { useState, useEffect } from 'react'
import './BanOverlay.css'
import { API_URL } from '../../services/api';

export default function BanOverlay({ user, onUnban }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [banDuration, setBanDuration] = useState('permanent')
  const [processing, setProcessing] = useState(false)

  // Calculate ban duration
  useEffect(() => {
    if (!user.ban_until || user.ban_until === null) {
      setBanDuration('permanent')
      setTimeLeft('PERMANENT')
      return
    }

    const updateCountdown = () => {
      const now = new Date()
      const banUntil = new Date(user.ban_until)
      const diff = banUntil - now

      if (diff <= 0) {
        setTimeLeft('EXPIRED')
        setBanDuration('expired')
        return
      }

      const totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

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
    if (banDuration === 'expired') return 0
    if (banDuration === '3') return 30
    if (banDuration === '7') return 70
    return 300
  }

  const getUnbanPriceInPaise = () => {
    return getUnbanPrice() * 100 // Convert to paise
  }

  // ✅ RAZORPAY SDK PAYMENT
  const handlePayment = async () => {
    if (processing) return;
    
    const amount = getUnbanPrice()
    
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

  // Disable context menu
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
    if (window.confirm('Logout?')) {
      localStorage.removeItem('auth_token')
      window.location.href = '/'
    }
  }

  return (
    <div className="ban-overlay">
      <div className="jail-bars"></div>
      <div className="dark-tint"></div>

      <div className="ban-card">
        
        {/* Header */}
        <div className="ban-header">
          <div className="ban-icon">🚫</div>
          <h1 className="ban-title">ACCOUNT BANNED</h1>
          <p className="ban-subtitle">Community Guidelines Violation</p>
        </div>

        {/* Info */}
        <div className="ban-info">
          <div className="info-row">
            <span className="info-label">User</span>
            <span className="info-value">{user.username} #{user.user_number}</span>
          </div>
          <div className="info-row highlight">
            <span className="info-label">Time Left</span>
            <span className="info-value blink">{timeLeft}</span>
          </div>
        </div>

        {/* FOMO */}
        <div className="ban-fomo">
          <div className="fomo-icon">💔</div>
          <div>
            <div className="fomo-title">Missing Out</div>
            <div className="fomo-text">128+ confessions posted while you're banned</div>
          </div>
        </div>

        {/* Unban Section */}
        <div className="ban-unban">
          <h3 className="unban-title">Want to get unbanned?</h3>
          <p className="unban-text">Pay the fine to restore access immediately</p>
          
          <button 
            className="unban-btn"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <span className="btn-spinner"></span>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <div className="btn-price">
                  <span className="btn-label">Fine Amount</span>
                  <span className="btn-amount">₹{getUnbanPrice()}</span>
                </div>
                <div className="btn-action">
                  <span>Pay Now</span>
                  <i className="fas fa-arrow-right"></i>
                </div>
              </>
            )}
          </button>

          <div className="unban-secure">
            <i className="fas fa-lock"></i>
            Secure Payment Gateway
          </div>
        </div>

        {/* Emergency Logout */}
        <button className="emergency-logout" onClick={handleEmergencyLogout}>
          <i className="fas fa-right-from-bracket"></i>
          Emergency Logout
        </button>

      </div>
    </div>
  )
}
