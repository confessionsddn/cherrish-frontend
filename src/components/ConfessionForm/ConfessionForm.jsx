  import { useState } from 'react'
  import MoodSelector from './MoodSelector'
  import VoiceRecorder from './VoiceRecorder'
  import './ConfessionForm.css'

  // --- IMPORTANT: Add this link to your index.html head ---
  // <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Patrick+Hand&family=Fredoka:wght@500;700&display=swap" rel="stylesheet">

  export default function ConfessionForm({ onSubmit, onNotification }) {
    const [content, setContent] = useState('')
    const [selectedMood, setSelectedMood] = useState('Crush')
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
    const [audioBlob, setAudioBlob] = useState(null)
    const [voiceDuration, setVoiceDuration] = useState(0)

    const handleRecordingComplete = (blob, duration) => {
      setAudioBlob(blob)
      setVoiceDuration(duration || 0)
    }

    const handleSubmit = (e) => {
      e.preventDefault()
      if (!content.trim()) {
        onNotification('🍬 HEY! THE WRAPPER IS EMPTY!', 'error')
        return
      }

      onSubmit({
        content: content.trim(),
        mood_zone: selectedMood,
        audioBlob: audioBlob,
        voice_duration: voiceDuration
      })

      setContent('')
      setAudioBlob(null)
      setVoiceDuration(0)
      setShowVoiceRecorder(false)
    }

    return (
      <div className="confession-candy-shop">
        {/* Decorative Tape */}
        <div className="masking-tape">
          CONFIDENTIAL • TOP SECRET • 24/7
        </div>

        <div className="shop-header">
          <h2 className="shop-title">
            <span className="title-outline">SPILL THE</span>
            <span className="title-solid">TEA ☕</span>
          </h2>
          <p className="shop-subtitle">no names. no judgment. just sweet vibes.</p>
        </div>

        <form onSubmit={handleSubmit} className="shop-form">
          
          {/* New "Sticker" Style Vibe Label */}
          <div className="vibe-sticker-container">
            <div className="vibe-sticker">
              ✨ SELECT YOUR FLAVOR ✨
            </div>
          </div>

          <div className="section-mood">
            <MoodSelector 
              selectedMood={selectedMood}
              onMoodChange={setSelectedMood}
            />
          </div>

          {/* The "Note Paper" Text Area */}
          <div className="input-zone">
            <div className="paper-stack">
              <textarea
                className="candy-textarea"
                placeholder="Start typing... Don't hold back!"
                rows="5"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            <div className="chars-count">{content.length} chars of sugar</div>
          </div>

          {/* Voice Section */}
          <div className="voice-zone">
              {!audioBlob && (
                  <button
                      type="button"
                      className={`btn-pill btn-voice ${showVoiceRecorder ? 'active' : ''}`}
                      onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                  >
                      <span className="icon">🎙️</span>
                      {showVoiceRecorder ? 'CLOSE MIC' : 'ADD VOICE NOTE'}
                  </button>
              )}

              {showVoiceRecorder && !audioBlob && (
                  <div className="recorder-pop">
                      <VoiceRecorder 
                          onRecordingComplete={handleRecordingComplete}
                          onNotification={onNotification}
                      />
                  </div>
              )}

              {/* Aesthetic Cassette Player */}
              {audioBlob && (
                  <div className="candy-cassette">
                      <div className="cassette-details">
                          <span className="track-name">🎵 my_secret.mp3</span>
                          <span className="track-time">{voiceDuration}s</span>
                      </div>
                      <button 
                          type="button" 
                          className="btn-eject-round"
                          onClick={() => {
                              setAudioBlob(null)
                              setVoiceDuration(0)
                          }}
                          title="Remove Audio"
                      >
                          ✕
                      </button>
                  </div>
              )}
          </div>

          {/* Submit Button */}
          <div className="action-zone">
            <button type="submit" className="btn-pill btn-submit">
              SEND INTO THE VOID 🚀
            </button>
          </div>
        </form>
      </div>
    )
  }