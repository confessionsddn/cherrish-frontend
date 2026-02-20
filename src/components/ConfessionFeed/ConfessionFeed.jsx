import { useState } from 'react'
import ConfessionCard from './ConfessionCard'
import './ConfessionFeed.css'

export default function ConfessionFeed({ 
  confessions, 
  onReaction, 
  onGiftClick,
  onCreditsUpdate,
  currentUserId,
  isPremium,
  premiumData,
  isAdmin
}) {
  if (!confessions || confessions.length === 0) {
    return (
      <div className="empty-feed">
        <div className="empty-icon">💔</div>
        <h3>NO CONFESSIONS YET</h3>
        <p>Be the first to share your heart!</p>
      </div>
    )
  }

  return (
    <div className="feed-grid">
      {confessions.map((confession, index) => (
        <ConfessionCard
          key={confession.id}
          confession={confession}
          onReaction={onReaction}
          onGiftClick={onGiftClick}
          onCreditsUpdate={onCreditsUpdate}
          currentUserId={currentUserId}
          isPremium={isPremium}
          premiumData={premiumData}
          isAdmin={isAdmin} 
          style={{
            animationDelay: `${index * 0.05}s`
            
          }}
        />
      ))}
    </div>
  )
}
