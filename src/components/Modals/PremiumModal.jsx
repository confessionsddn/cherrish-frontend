import { API_URL } from '../../services/api';//PremiumModal.jsx
import './PremiumModal.css'

const PREMIUM_ITEMS = [
  // --- EFFECTS & UPGRADES (Applied to Confession Card) ---
  {
    id: 'gold_hearts',
    title: 'SPARKLE HEARTS',
    description: 'Explosive golden particle effects on your card.',
    price: 25,
    icon: '💖',
    tag: 'POPULAR',
    color: 'pink'
  },
  {
    id: 'cyber_glitch',
    title: 'CYBER GLITCH',
    description: 'Hacker-style text distortion and green aura.',
    price: 35,
    icon: '👾',
    tag: 'COOL',
    color: 'green'
  },
  {
    id: 'holo_foil',
    title: 'HOLO FOIL',
    description: 'Rare shiny rainbow gradient border.',
    price: 50,
    icon: '💿',
    tag: 'RARE',
    color: 'holo' // New special color
  },
  {
    id: 'sunset_bg',
    title: 'VAPORWAVE',
    description: 'Aesthetic purple/orange gradient background.',
    price: 40,
    icon: '🌅',
    tag: 'VIBE',
    color: 'orange'
  },
  {
    id: 'starry_night',
    title: 'GALACTIC MODE',
    description: 'Deep space animation with twinkling stars.',
    price: 45,
    icon: '🌌',
    tag: 'EPIC',
    color: 'purple'
  },
  {
    id: 'retro_vhs',
    title: 'RETRO VHS',
    description: 'Old-school static noise and scanlines.',
    price: 30,
    icon: '📺',
    tag: 'RETRO',
    color: 'grey'
  },

  // --- GIFTS (Sent to others) ---
  {
    id: 'roses',
    title: 'MEGA BOUQUET',
    description: 'Send 100 digital roses instantly.',
    price: 20,
    icon: '💐',
    tag: 'GIFT',
    color: 'red',
    type: 'gift'
  },
  {
    id: 'ring',
    title: 'DIAMOND RING',
    description: 'The ultimate proposal (virtually).',
    price: 100,
    icon: '💍',
    tag: 'FLEX',
    color: 'cyan',
    type: 'gift'
  },
  {
    id: 'chocolates',
    title: 'LUXURY BOX',
    description: 'Swiss chocolates for their sweet tooth.',
    price: 15,
    icon: '🍫',
    tag: 'YUM',
    color: 'brown',
    type: 'gift'
  },
  {
    id: 'teddy',
    title: 'GIANT TEDDY',
    description: 'Maximum cuddles delivered digitally.',
    price: 40,
    icon: '🧸',
    tag: 'CUTE',
    color: 'orange',
    type: 'gift'
  },
  {
    id: 'mixtape',
    title: 'LO-FI MIXTAPE',
    description: 'A dedicated playlist vibe.',
    price: 15,
    icon: '📼',
    tag: 'CHILL',
    color: 'yellow',
    type: 'gift'
  },
  {
    id: 'poem',
    title: 'EPIC POEM',
    description: 'AI-generated romantic masterpiece.',
    price: 25,
    icon: '📜',
    tag: 'ART',
    color: 'yellow',
    type: 'gift'
  }
]

export default function PremiumModal({ onClose, onPurchase, credits }) {
  const handlePurchase = (price) => {
    onPurchase(price)
  }

  const effects = PREMIUM_ITEMS.filter(item => !item.type)
  const gifts = PREMIUM_ITEMS.filter(item => item.type === 'gift')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="neo-modal-container wide-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* BRIGHT HEADER */}
        <div className="neo-modal-header brand-gradient">
          <div className="header-content-punchy">
            <h2><i className="fas fa-bolt"></i> UNLOCK GOD MODE</h2>
            <p>STAND OUT FROM THE CROWD!</p>
          </div>
          <button className="neo-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="neo-modal-body">
          
          {/* CREDITS BAR */}
          <div className="credits-flash-bar">
            <span>YOUR STASH:</span>
            <div className="flash-pill">
              <i className="fas fa-coins"></i> {credits}
            </div>
          </div>

          {/* EFFECTS SECTION */}
          <div className="neo-section-title">
            <h3>⚡ CARD THEMES & FX</h3>
          </div>

          <div className="neo-items-grid">
            {effects.map((item) => (
              <div key={item.id} className={`neo-item-card color-${item.color}`}>
                {item.tag && <span className={`neo-tag rotate-tag tag-${item.color}`}>{item.tag}</span>}
                <div className="item-icon-pop">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <button 
                  className="neo-buy-btn"
                  onClick={() => handlePurchase(item.price)}
                  disabled={credits < item.price}
                >
                  GET FOR {item.price} <i className="fas fa-coins"></i>
                </button>
              </div>
            ))}
          </div>

          {/* GIFTS SECTION */}
          <div className="neo-section-title">
            <h3>🎁 EPIC GIFTS</h3>
          </div>

          <div className="neo-items-grid gifts-grid">
            {gifts.map((item) => (
              <div key={item.id} className={`neo-item-card gift-layout color-${item.color}`}>
                <div className="item-icon-sm">{item.icon}</div>
                <div className="gift-info">
                  <h4>{item.title}</h4>
                  <button 
                    className="neo-buy-btn-sm"
                    onClick={() => handlePurchase(item.price)}
                    disabled={credits < item.price}
                  >
                    {item.price} <i className="fas fa-coins"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
