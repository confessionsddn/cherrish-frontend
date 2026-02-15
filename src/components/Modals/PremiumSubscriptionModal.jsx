// MOBILE-FIRST Premium Modal - 60FPS BUTTER SMOOTH
import { useState, useEffect } from 'react'
import './PremiumSubscriptionModal.css'
import { API_URL } from '../../services/api';

const FEATURES = [
  { icon: '🎨', title: 'Unlimited Confessions', desc: 'Post without credit costs' },
  { icon: '🎤', title: 'Daily Voice Note', desc: '30-second recordings' },
  { icon: '⭐', title: '10 Spotlight Boosts', desc: 'Pin to top monthly' },
  { icon: '👤', title: 'Free Username Change', desc: 'One-time rename' },
  { icon: '💰', title: '150 Bonus Credits', desc: 'Instant reward' },
  { icon: '👑', title: 'Premium Badge', desc: 'Exclusive status' },
]

export default function PremiumSubscriptionModal({ onClose }) {
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  const handleSubscribe = async () => {
    if (processing) return;
    
    setProcessing(true)

    try {
      const response = await fetch(`${API_URL}/api/payments/create-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create subscription')
      }

      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Payment system not loaded')
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Cherrish Premium',
        description: 'Monthly Subscription - ₹99',
        order_id: data.order_id,
        
        handler: async function (paymentResponse) {
          try {
            const verifyRes = await fetch(`${API_URL}/api/payments/verify-subscription`, {
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
              const successDiv = document.createElement('div')
              successDiv.className = 'premium-success-toast'
              successDiv.innerHTML = `
                <div class="success-crown">👑</div>
                <div>
                  <div class="success-title">Welcome to Premium!</div>
                  <div class="success-text">All features unlocked</div>
                </div>
              `
              document.body.appendChild(successDiv)
              
              setTimeout(() => {
                successDiv.remove()
                window.location.href = '/'
              }, 1500)
            } else {
              throw new Error(verifyData.error || 'Verification failed')
            }
          } catch (error) {
            alert('Subscription verification failed')
            setProcessing(false)
          }
        },
        
        theme: { color: '#FFD700' },
        
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

  return (
    <div className="premium-overlay" onClick={onClose}>
      <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button className="premium-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        {/* Crown Animation */}
        <div className="crown-container">
          <div className="crown-glow"></div>
          <div className="crown-icon">👑</div>
        </div>

        {/* Header */}
        <div className="premium-header">
          <h1 className="premium-title">
            <span className="title-line1">Unlock</span>
            <span className="title-line2">Premium</span>
          </h1>
          <p className="premium-tagline">Unlimited power. Zero limits.</p>
        </div>

        {/* Pricing */}
        <div className="premium-pricing">
          <div className="price-old">
            <span className="strike-price">₹319</span>
            <span className="save-badge">69% OFF</span>
          </div>
          <div className="price-current">
            <span className="price-amount">₹99</span>
            <span className="price-period">/month</span>
          </div>
        </div>

        {/* Features */}
        <div className="premium-features">
          {FEATURES.map((feature, index) => (
            <div 
              key={index}
              className="feature-item"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-text">
                <div className="feature-title">{feature.title}</div>
                <div className="feature-desc">{feature.desc}</div>
              </div>
              <div className="feature-check">✓</div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button 
          className="premium-subscribe-btn"
          onClick={handleSubscribe}
          disabled={processing}
        >
          {processing ? (
            <>
              <span className="btn-spinner"></span>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Activate Premium</span>
              <i className="fas fa-arrow-right"></i>
            </>
          )}
        </button>

        {/* Terms */}
        <p className="premium-terms">
          Recurring monthly. Cancel anytime. No hidden fees.
        </p>

      </div>
    </div>
  )
}
