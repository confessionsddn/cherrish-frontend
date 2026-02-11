//PremiumSubscriptionModal.jsx

import { useState } from 'react'
import './PremiumSubscriptionModal.css'
import { API_URL } from '../../services/api';
const AURA_FEATURES = [
  { icon: '🎨', title: 'Unlimited Confessions', desc: 'No credit cost ever.' },
  { icon: '🎤', title: 'Daily Free Voice Note', desc: '30-sec recording.' },
  { icon: '⭐', title: '10 Spotlight Boosts', desc: 'Refreshed per month.' },
  { icon: '✏️', title: 'Free Daily Edit', desc: 'Within 5 mins of posting.' },
  { icon: '👤', title: 'Free Username Change', desc: 'One-time change allowed.' },
  { icon: '💰', title: '150 Bonus Credits', desc: 'When free tier runs out.' },
  { icon: '👑', title: 'Premium Badge', desc: 'Displayed on all posts.' },
  { icon: '👀', title: 'Reveal Reactors', desc: 'See who reacted (with usernames).' }
]

export default function PremiumSubscriptionModal({ onClose }) {
  const [processing, setProcessing] = useState(false)

 const handleSubscribe = async () => {
  setProcessing(true)
  console.log('👑 Starting premium subscription...')

  try {
    const res = await fetch(`${API_URL}/api/payments/create-subscription`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await res.json()
    console.log('📦 Subscription order:', data)

    if (!data.success) {
      alert('❌ Failed to create subscription: ' + (data.error || 'Unknown error'))
      setProcessing(false)
      return
    }

    if (typeof window.Razorpay === 'undefined') {
      alert('❌ Razorpay not loaded! Refresh the page.')
      setProcessing(false)
      return
    }

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: 'LOVECONFESS',
      description: 'Premium Monthly Subscription - ₹99',
      order_id: data.order_id,
      handler: async function (response) {
        console.log('✅ Premium payment successful')
        
        try {
          const verifyRes = await fetch(`${API_URL}/api/payments/verify-subscription`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          })

          const verifyData = await verifyRes.json()

          if (verifyData.success) {
            alert('🎉 PREMIUM ACTIVATED! Welcome to the premium club!')
            window.location.reload()
          } else {
            alert('❌ Verification failed: ' + verifyData.error)
          }
        } catch (error) {
          console.error('❌ Verification error:', error)
          alert('❌ Failed to verify subscription')
        }
      },
      theme: { color: '#FFD700' },
      modal: {
        ondismiss: function() {
          console.log('💨 Subscription cancelled')
          setProcessing(false)
        }
      }
    }

    const rzp = new window.Razorpay(options)
    
    rzp.on('payment.failed', function (response) {
      console.error('❌ Payment failed:', response.error)
      alert('❌ Payment failed: ' + response.error.description)
      setProcessing(false)
    })

    rzp.open()

  } catch (error) {
    console.error('❌ Subscribe error:', error)
    alert('❌ Failed to subscribe: ' + error.message)
    setProcessing(false)
  }
}


  return (
    <div className="aura-overlay" onClick={onClose}>
      <div className="aura-container" onClick={(e) => e.stopPropagation()}>
        
        <div className="aura-glow-bg"></div>
        <div className="floating-crown">👑</div>
        
        <button className="aura-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
        </button>

        {/* LEFT PANEL */}
        <div className="aura-left-panel">
            <div className="holo-card">
                <div className="holo-shine"></div>
                <div className="card-header">
                    <span>VIP ACCESS</span>
                    <i className="fas fa-infinity"></i>
                </div>
                <div className="card-body">
                    <h1>AURA<br/>PASS</h1>
                    <div className="card-chip">
                        <div className="chip-lines"></div>
                    </div>
                    <p className="card-number">**** **** **** ELITE</p>
                </div>
                <div className="card-footer">
                    <span>MEMBER SINCE 2024</span>
                    <span className="master-logo">///</span>
                </div>
            </div>
            
            <div className="price-explainer">
                <div className="discount-row">
                    <span className="strike">₹319</span>
                    <div className="save-tag">SAVE 69%</div>
                </div>
                <div className="final-price-row">
                    <span className="current-price">₹99</span>
                    <span className="period"></span>
                </div>
            </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="aura-right-panel">
            <div className="panel-header">
                <h2>UNLOCK GOD MODE</h2>
                <p>Don't just post. Dominate.</p>
            </div>

            {/* --- AUTOMATIC INFINITE SCROLL SECTION --- */}
            <div className="features-auto-scroll-mask">
                <div className="features-track">
                    {/* Map TWICE for seamless loop */}
                    {[...AURA_FEATURES, ...AURA_FEATURES].map((f, i) => (
                        <div key={i} className="aura-feature-row">
                            <div className="feature-icon-glow">{f.icon}</div>
                            <div className="feature-texts">
                                <h4>{f.title}</h4>
                                <p>{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button 
                className="activate-aura-btn"
                onClick={handleSubscribe}
                disabled={processing}
            >
                <span className="btn-content">
                    {processing ? 'SYNCING AURA...' : 'ACTIVATE AURA PASS ⚡'}
                </span>
            </button>
            
            <p className="micro-terms">Recurring billing. Cancel anytime. No hidden fees.</p>
        </div>

      </div>
    </div>
  )
}
