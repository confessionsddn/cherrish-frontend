import { useState } from 'react'
import './BuyCreditsModal.css'
import { API_URL } from '../../services/api';

const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'STARTER',
    credits: 70,
    bonus: 0,
    price: 29,
    icon: '💰',
    tag: 'BASIC',
    color: 'yellow'
  },
  {
    id: 'popular',
    name: 'POPULAR',
    credits: 200,
    bonus: 25,
    price: 69,
    icon: '🔥',
    tag: 'HOT',
    color: 'cyan',
    popular: true
  },
  {
    id: 'best',
    name: 'BEST VALUE',
    credits: 400,
    bonus: 50,
    price: 139,
    icon: '👑',
    tag: '-40% OFF',
    color: 'purple',
    bestValue: true
  },
  {
    id: 'elite',
    name: 'ELITE PACK',
    credits: 800,
    bonus: 100,
    price: 249,
    icon: '💎',
    tag: 'MAX SAVINGS',
    color: 'red'
  }
]

export default function BuyCreditsModal({ onClose, currentCredits }) {
  const [processing, setProcessing] = useState(false)

  const handlePurchase = async (pkg) => {
    setProcessing(true)
    console.log('🛒 Starting purchase for:', pkg.name)

    try {
      // Step 1: Create Razorpay order
      const res = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ package_type: pkg.id })
      })

      const data = await res.json()
      console.log('📦 Order created:', data)

      if (!data.success) {
        alert('❌ Failed: ' + (data.error || 'Unknown error'))
        setProcessing(false)
        return
      }

      // Step 2: Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        alert('❌ Razorpay not loaded! Please refresh the page.')
        setProcessing(false)
        return
      }

      // Step 3: Configure Razorpay options
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Cherrish',
        description: `${pkg.name} - ${pkg.credits + pkg.bonus} Credits`,
        order_id: data.order_id,
        
        // Success handler
        handler: async function (response) {
          console.log('✅ Payment successful:', response)
          
          try {
            // Verify payment on backend
            const verifyRes = await fetch(`${API_URL}/api/payments/verify-payment`, {
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
              // Success! Close modal and redirect
              alert(`✅ SUCCESS!\n\n${verifyData.credits_added} credits added!\n\nNew Balance: ${verifyData.total_credits} credits`)
              
              // Close modal
              onClose()
              
              // Redirect to home to refresh credits
              window.location.href = '/'
            } else {
              alert('❌ Verification failed: ' + verifyData.error)
              setProcessing(false)
            }
          } catch (error) {
            console.error('❌ Verification error:', error)
            alert('❌ Payment verification failed. Contact support.')
            setProcessing(false)
          }
        },
        
        // Prefill user info (optional)
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        
        // Theme
        theme: { 
          color: '#FF69B4' 
        },
        
        // Modal settings
        modal: {
          ondismiss: function() {
            console.log('💨 Payment cancelled by user')
            setProcessing(false)
          }
        }
      }

      // Step 4: Open Razorpay checkout
      const rzp = new window.Razorpay(options)
      
      // Handle payment failure
      rzp.on('payment.failed', function (response) {
        console.error('❌ Payment failed:', response.error)
        alert(`❌ Payment Failed!\n\n${response.error.description}`)
        setProcessing(false)
      })
      
      rzp.open()

    } catch (error) {
      console.error('❌ Purchase error:', error)
      alert('❌ Failed to create order: ' + error.message)
      setProcessing(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="neo-modal-container wide-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER SECTION */}
        <div className="neo-modal-header brand-gradient relative-header">
          
          {/* STICKER */}
          <div className="starburst-sticker">
            <div className="starburst-shape"></div>
            <span className="starburst-text">SALE!</span>
          </div>

          {/* TITLE */}
          <div className="header-content-punchy">
            <h2><i className="fas fa-coins"></i> STORE </h2>
            <div className="subtitle-badge">UNLOCK PREMIUM POWERS INSTANTLY!</div>
          </div>

          {/* CLOSE BUTTON */}
          <button className="neo-close-btn absolute-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="neo-modal-body pattern-bg">
          
          {/* BALANCE BAR */}
          <div className="credits-flash-bar">
            <span>YOUR STASH:</span>
            <div className="flash-pill">
              <i className="fas fa-coins"></i> {currentCredits}
            </div>
          </div>

          {/* PACKAGES GRID */}
          <div className="neo-items-grid credits-grid">
            {CREDIT_PACKAGES.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`
                  neo-item-card credit-package color-${pkg.color} 
                  ${pkg.popular ? 'popular-glow' : ''} 
                  ${pkg.bestValue ? 'best-value-scale' : ''}
                `}
              >
                {/* Tag */}
                {pkg.tag && <span className={`neo-tag rotate-tag tag-${pkg.color}`}>{pkg.tag}</span>}
                
                <div className="package-header-group">
                    <div className="package-icon-bounce">{pkg.icon}</div>
                    <h3 className="package-name">{pkg.name}</h3>
                </div>
                
                <div className="package-mid-group">
                    <div className="package-credits-box">
                      <span className="base-amt">{pkg.credits}</span>
                      {pkg.bonus > 0 && <span className="bonus-amt">+{pkg.bonus} FREE</span>}
                    </div>

                    <div className="total-label">
                      = {pkg.credits + pkg.bonus} CREDITS
                    </div>
                </div>

                <div className="package-bottom-group">
                    <div className="price-tag">₹{pkg.price}</div>

                    <button 
                      className="neo-buy-btn buy-credits-btn"
                      onClick={() => handlePurchase(pkg)}
                      disabled={processing}
                    >
                      {processing ? 'PROCESSING...' : 'BUY NOW ⚡'}
                    </button>

                    <div className="package-value">
                      ONLY ₹{(pkg.price / (pkg.credits + pkg.bonus)).toFixed(2)} / credit
                    </div>
                </div>
              </div>
            ))}
          </div>

          {/* TRUST BADGES */}
          <div className="trust-badges">
            <span><i className="fas fa-lock"></i> 256-BIT SECURE</span>
            <span><i className="fas fa-bolt"></i> INSTANT DELIVERY</span>
            <span><i className="fas fa-undo"></i> BUY AGAIN ANYTIME</span>
          </div>

        </div>
      </div>
    </div>
  )
}
