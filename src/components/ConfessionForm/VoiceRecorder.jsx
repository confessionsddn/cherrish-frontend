import { useState, useRef, useEffect } from 'react'
import './VoiceRecorder.css'

export default function VoiceRecorder({ onRecordingComplete, onNotification }) {
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const [timer, setTimer] = useState(0)
  const [recordingDuration, setRecordingDuration] = useState(0)
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const audioRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(timerIntervalRef.current)
      setTimer(0)
    }
    return () => clearInterval(timerIntervalRef.current)
  }, [isRecording])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      startTimeRef.current = Date.now()
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const duration = Math.ceil((Date.now() - startTimeRef.current) / 1000)
        
        setRecordingDuration(duration)
        onRecordingComplete(audioBlob, duration) // PASS DURATION
        audioRef.current = URL.createObjectURL(audioBlob)
        setHasRecording(true)
        onNotification(`VOICE CAPTURED! ${duration}s 🎤`, 'success')
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      
    } catch (error) {
      console.error('Recording error:', error)
      onNotification('MIC ACCESS DENIED! 🚫', 'error')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const playRecording = () => {
    if (audioRef.current) {
      const audio = new Audio(audioRef.current)
      audio.play()
    }
  }

  const resetRecording = () => {
    setHasRecording(false)
    setRecordingDuration(0)
    onRecordingComplete(null, 0)
    audioRef.current = null
  }

  return (
    <div className="voice-recorder-module">
      
      <div className={`recorder-screen ${isRecording ? 'state-recording' : hasRecording ? 'state-ready' : 'state-idle'}`}>
        <div className="screen-header">
          <span className="rec-dot"></span>
          <span className="status-text">
            {isRecording ? 'REC ●' : hasRecording ? 'READY' : 'STANDBY'}
          </span>
        </div>
        
        <div className="screen-main">
          {isRecording ? (
            <div className="recording-visual">
              <span className="time-display">{formatTime(timer)}</span>
              <div className="wave-bars">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
            </div>
          ) : hasRecording ? (
            <div className="playback-visual">
              <i className="fas fa-music"></i>
              <span>VOICE {recordingDuration}s CAPTURED</span>
            </div>
          ) : (
            <div className="idle-visual">
              TAP RECORD TO START
            </div>
          )}
        </div>
      </div>

      <div className="recorder-controls">
        {!isRecording && !hasRecording && (
          <button className="control-btn btn-record" onClick={startRecording}>
            <div className="inner-circle"></div>
          </button>
        )}

        {isRecording && (
          <button className="control-btn btn-stop" onClick={stopRecording}>
            <div className="inner-square"></div>
          </button>
        )}

        {hasRecording && (
          <div className="playback-group">
            <button className="control-btn btn-play" onClick={playRecording}>
              <i className="fas fa-play"></i>
            </button>
            <button className="control-btn btn-reset" onClick={resetRecording}>
              <i className="fas fa-trash"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}