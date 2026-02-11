import React from 'react'
import './GiftModal.css' // Ensure this file contains the Neo-Brutalist CSS
import { API_URL } from '../../services/api';
const GIFT_ITEMS = [
  // --- EFFECTS (treated as Premium Awards) ---
  {
    id: 'gold_hearts',
    title: 'SPARKLE HEARTS',
    description: 'Explosive golden particle effects.',
    price: 25,
    icon: '💖',
    tag: 'POPULAR',
    color: 'pink'
  },
  {
    id: 'cyber_glitch',
    title: 'CYBER GLITCH',
    description: 'Hacker-style text distortion.',
    price: 35,
    icon: '👾',
    tag: 'COOL',
    color: 'green'
  },
  {
    id: 'holo_foil',
    title: 'HOLO FOIL',
    description: 'Rare shiny rainbow border.',
    price: 50,
    icon: '💿',
    tag: 'RARE',
    color: 'holo'
  },
  {
    id: 'sunset_bg',
    title: 'VAPORWAVE',
    description: 'Aesthetic purple/orange gradient.',
    price: 40,
    icon: '🌅',
    tag: 'VIBE',
    color: 'orange'
  },
  {
    id: 'starry_night',
    title: 'GALACTIC MODE',
    description: 'Deep space animation.',
    price: 45,
    icon: '🌌',
    tag: 'EPIC',
    color: 'purple'
  },
  {
    id: 'retro_vhs',
    title: 'RETRO VHS',
    description: 'Static noise and scanlines.',
    price: 30,
    icon: '📺',
    tag: 'RETRO',
    color: 'grey'
  },

  // --- PHYSICAL/VIRTUAL GIFTS ---
  {
    id: 'roses',
    title: 'MEGA BOUQUET',
    description: 'Send 100 digital roses.',
    price: 20,
    icon: '💐',
    tag: 'CLASSIC',
    color: 'red',
    type: 'gift'
  },
  {
    id: 'ring',
    title: 'DIAMOND RING',
    description: 'The ultimate proposal.',
    price: 100,
    icon: '💍',
    tag: 'FLEX',
    color: 'cyan',
    type: 'gift'
  },
  {
    id: 'chocolates',
    title: 'LUXURY BOX',
    description: 'Swiss chocolates.',
    price: 15,
    icon: '🍫',
    tag: 'YUM',
    color: 'brown',
    type: 'gift'
  },
  {
    id: 'teddy',
    title: 'GIANT TEDDY',
    description: 'Maximum cuddles.',
    price: 40,
    icon: '🧸',
    tag: 'CUTE',
    color: 'orange',
    type: 'gift'
  },
  {
    id: 'mixtape',
    title: 'LO-FI MIXTAPE',
    description: 'A dedicated playlist.',
    price: 15,
    icon: '📼',
    tag: 'CHILL',
    color: 'yellow',
    type: 'gift'
  },
  {
    id: 'poem',
    title: 'EPIC POEM',
    description: 'AI-generated romance.',
    price: 25,
    icon: '📜',
    tag: 'ART',
    color: 'yellow',
    type: 'gift'
  }
]

export default function GiftModal({ onClose, onSendGift, credits }) {
  
  const handleGiftClick = (item) => {
    // Check credits
    if (credits < item.price) {
        alert("Not enough credits! Go refill your stash.");
        return;
    }
    // Call parent handler with ID (type) and Price
    onSendGift(item.id, item.price);
    onClose();
  }

  // Filter items into categories
  const effects = GIFT_ITEMS.filter(item => !item.type)
  const gifts = GIFT_ITEMS.filter(item => item.type === 'gift')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="neo-modal-container wide-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="neo-modal-header brand-gradient">
          <div className="header-content-punchy">
            <h2><i className="fas fa-gift"></i> SEND A GIFT</h2>
            <p>MAKE THEIR DAY EPIC!</p>
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

          {/* SECTION 1: EFFECTS (AWARDS) */}
          <div className="neo-section-title">
            <h3>⚡ SUPER AWARDS</h3>
            <p className="section-subtitle">Apply these effects to their card!</p>
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
                  onClick={() => handleGiftClick(item)}
                  disabled={credits < item.price}
                >
                  SEND ({item.price} <i className="fas fa-coins"></i>)
                </button>
              </div>
            ))}
          </div>

          {/* SECTION 2: VIRTUAL GIFTS */}
          <div className="neo-section-title" style={{ marginTop: '40px' }}>
            <h3>🎁 DIGITAL GOODIES</h3>
          </div>

          <div className="neo-items-grid gifts-grid">
            {gifts.map((item) => (
              <div key={item.id} className={`neo-item-card gift-layout color-${item.color}`}>
                <div className="item-icon-sm">{item.icon}</div>
                <div className="gift-info">
                  <h4>{item.title}</h4>
                  <button 
                    className="neo-buy-btn-sm"
                    onClick={() => handleGiftClick(item)}
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
