import './Animations.css'

export function ConfettiContainer() {
  return <div className="confetti-container" id="confetti-container"></div>
}

export function MoodTransitionOverlay() {
  return (
    <>
      <div className="mood-transition-overlay hidden" id="mood-transition-overlay"></div>
      <div className="mood-transition-overlay hidden" id="mood-broken-hearts-cover"></div>
    </>
  )
}

export function FullscreenHearts() {
  return <div id="fullscreen-hearts"></div>
}

export function BrutalNotification({ message, type }) {
  const bgColors = {
    success: '#B8E6B8',
    error: '#FFCCCB',
    info: '#E6E6FA'
  }

  return (
    <div 
      className="brutal-notification"
      style={{ backgroundColor: bgColors[type] || '#ADD8E6' }}
    >
      {message}
    </div>
  )
}

export default {
  ConfettiContainer,
  MoodTransitionOverlay,
  FullscreenHearts,
  BrutalNotification
}
