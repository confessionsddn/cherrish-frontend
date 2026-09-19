import { useState, useRef, useEffect } from 'react';
import './MoodSelector.css';

const MOOD_OPTIONS = [
  { name: 'Crush',        color: 'var(--candy-pink)' },
  { name: 'Heartbreak',   color: 'var(--candy-blue)' },
  { name: 'Secret Admirer', color: 'var(--candy-purple)' }, 
  { name: 'Love Stories', color: 'var(--candy-orange)' }
];

// Explicit mapping from mood name to video file in /public
const MOOD_VIDEO_FILES = {
  'Crush': 'crush.mp4',
  'Heartbreak': 'hbreak.mp4',
  'Secret Admirer': 'secret.mp4',    // ✅ Fixed key name
  'Love Stories': 'stories.mp4',     // ✅ Fixed video file
};

const MoodVideoLoop = ({ moodName }) => {
  const videoRef = useRef(null);
  const fileName = MOOD_VIDEO_FILES[moodName] || 'crush.mp4';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let loopTimeout;
    let observer;

    const playVideo = () => {
      video.currentTime = 0;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise) playPromise.catch(() => {});
    };

    const pauseVideo = () => {
      video.pause();
    };

    const handleEnded = () => {
      loopTimeout = setTimeout(() => playVideo(), 5000);
    };

    // Only play when video is visible in viewport (avoids power-saving abort)
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          playVideo();
        } else {
          pauseVideo();
          clearTimeout(loopTimeout);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(video);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('ended', handleEnded);
      clearTimeout(loopTimeout);
      observer?.disconnect();
    };
  }, [moodName]);

  return (
    <video
      ref={videoRef}
      className="mood-video-bg"
      src={`/${fileName}`}
      muted
      playsInline
    />
  );
};

export default function MoodSelector({ selectedMood, onMoodChange }) {
  const [prevMood, setPrevMood] = useState(selectedMood);
  const currentPath = window.location.pathname;

  const handleMoodClick = (mood) => {
    setPrevMood(selectedMood);
    onMoodChange(mood);

    if (prevMood === 'Crush' && mood === 'Heartbreak') {
      triggerHeartbreakTransition();
    } else {
      triggerGenericMoodTransition(mood);
    }
  };

  const triggerHeartbreakTransition = () => {
    const overlay = document.getElementById('mood-broken-hearts-cover');
    if (!overlay) return;

    overlay.innerHTML = '';
    overlay.style.display = 'block';

    const hearts = ['💔', '🥀', '🩹'];

    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        const el = document.createElement('span');
        el.className = 'broken-heart-float';
        el.textContent = hearts[i % hearts.length];

        const size = 15 + Math.random() * 30;
        el.style.fontSize = `${size}px`;
        el.style.left = `${5 + Math.random() * 90}vw`;
        el.style.setProperty('--float-x', `${-60 + Math.random() * 120}px`);
        el.style.setProperty('--float-rot', `${Math.random() * 60 - 30}deg`);

        overlay.appendChild(el);
        setTimeout(() => el.remove(), 4200);
      }, i * 80 + Math.random() * 100);
    }

    setTimeout(() => {
      overlay.style.opacity = 0;
      setTimeout(() => {
        overlay.style.display = 'none';
        overlay.innerHTML = '';
        overlay.style.opacity = 1;
      }, 600);
    }, 4000);
  };

  const triggerGenericMoodTransition = (mood) => {
    const overlay = document.getElementById('mood-transition-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    overlay.classList.add('active');
    overlay.innerHTML = '';

    const moodIcons = {
      Crush: ['💕', '💖', '✨', '💗', '😊'],
      Heartbreak: ['💔', '💧', '☔', '😢', '✈️'],
      Secret: ['💌', '⭐', '💭', '❓', '🤫'],
      'Love Stories': ['🌹', '✨', '📖', '💬', '❤️'],
    };

    const icons = moodIcons[mood] || ['💕'];

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const icon = document.createElement('div');
        icon.className = 'mood-transition-icon';
        icon.textContent = icons[Math.floor(Math.random() * icons.length)];
        icon.style.top = `${10 + Math.random() * 60}vh`;
        icon.style.left = `-40px`;
        overlay.appendChild(icon);
        setTimeout(() => icon.remove(), 1800);
      }, 120 * i);
    }

    setTimeout(() => {
      overlay.classList.remove('active');
      overlay.classList.add('hidden');
      overlay.innerHTML = '';
    }, 1800);
  };

  return (
    <div className="form-group mood-selector-container">
      <div className="mood-zones">
        {MOOD_OPTIONS.map(({ name, color }) => {
          const isActive = selectedMood === name;
          return (
            <button
              key={name}
              type="button"
              className={`mood-zone ${isActive ? 'active' : ''}`}
              onClick={() => handleMoodClick(name)}
              style={{ '--mood-color': color }}
              data-mood={name}
            >
              <div className="video-container">
                <MoodVideoLoop moodName={name} />
                <div className="scanline-overlay"></div>
              </div>

              <div className="mood-content">
                <span className="mood-title">{name}</span>
                <div className="mood-badge">
                  {isActive ? 'SELECTED' : 'PICK ME'}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
