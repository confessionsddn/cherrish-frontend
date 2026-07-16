// components/ITMVotesBanner/ITMVotesBanner.jsx
export default function ITMVotesBanner() {
  const handleClick = () => {
    const token = localStorage.getItem('auth_token');
    window.open(`https://vote.cherrish.in?token=${token}`, '_blank');
  };

  return (
    <div onClick={handleClick} style={{
      background: 'linear-gradient(135deg, #ffd700 0%, #fc0082 100%)',
      border: '3px solid #000',
      borderRadius: '16px',
      padding: '1.2em 1.5em',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '1em',
      margin: '1em auto',
      maxWidth: '700px',
      boxShadow: '6px 6px 0 #000',
      transition: 'transform 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translate(0, 0)'}
    >
      <span style={{ fontSize: '2em' }}>🗳️</span>
      <div>
        <div style={{ fontWeight: 900, fontSize: '1.1em', color: '#000', fontFamily: 'var(--font-display)' }}>ITM VOTES LEAGUE</div>
        <div style={{ fontSize: '0.9em', color: '#1a1a1a', fontWeight: 600 }}>Vote for your fav teachers → Results on Teacher's Day!</div>
      </div>
      <span style={{ fontSize: '1.5em', marginLeft: 'auto' }}>→</span>
    </div>
  );
}
