import { useState, useEffect, useRef } from 'react'
import './FilterBar.css'

const FILTERS = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'Crush', label: 'Crush', icon: '💕' },
  { id: 'Heartbreak', label: 'Heartbreak', icon: '💔' },
  { id: 'Secret Admirer', label: 'Secret', icon: '🫣' },
  { id: 'Love Stories', label: 'Story', icon: '💌' },
  { id: 'spotlight', label: 'Spotlight', icon: '⭐' },
  { id: 'boosted', label: 'Boosted', icon: '🚀' },
  { id: 'my-posts', label: 'My Posts', icon: '👤' }
]

export default function FilterBar({ currentFilter, onFilterChange, onSortChange, onRefresh }) {
  const [sortBy, setSortBy] = useState('recent')
  const [isVisible, setIsVisible] = useState(false)
  const barRef = useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    if (barRef.current) {
      observer.observe(barRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    if (onSortChange) {
      onSortChange(newSort)
    }
  }
  
  return (
    <div 
      ref={barRef} 
      className={`filter-bar-container ${isVisible ? 'visible' : ''}`}
    >
      <div className="filters-scroll-area">
        {/* REFRESH BUTTON */}
        <button
          className="filter-pill refresh-pill"
          onClick={() => {
            onFilterChange('all')
            handleSortChange('recent')
            if (onRefresh) {
              onRefresh()
            }
          }}
          title="Refresh feed"
        >
          <span className="filter-icon">↺</span>
        </button>
        
        {FILTERS.map(filter => (
          <button
            key={filter.id}
            className={`filter-pill ${currentFilter === filter.id ? 'active' : ''} ${filter.id === 'my-posts' ? 'my-posts-pill' : ''}`}
            onClick={() => onFilterChange(filter.id)}
          >
            <span className="filter-icon">{filter.icon}</span>
            <span className="filter-label">{filter.label}</span>
          </button>
        ))}
      </div>
      
      <div className="sort-group">
        <div className="sort-capsule">
          <button 
            className={`sort-option ${sortBy === 'recent' ? 'active' : ''}`}
            onClick={() => handleSortChange('recent')}
          >
            <i className="fas fa-clock"></i>
            <span className="sort-text">Recent</span>
          </button>
          <div className="sort-divider"></div>
          <button 
            className={`sort-option ${sortBy === 'trending' ? 'active' : ''}`}
            onClick={() => handleSortChange('trending')}
          >
            <i className="fas fa-fire"></i>
            <span className="sort-text">Top</span>
          </button>
        </div>
      </div>
    </div>
  )
}