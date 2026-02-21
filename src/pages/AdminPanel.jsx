// frontend/src/pages/AdminPanel.jsx - COMPLETE v3
// NEW: Create Poll, User Activity Logs, Top Buyers, Streak (commented), horizontal scroll fix
import { useState, useEffect } from 'react';
import { API_URL } from '../services/api';
import './AdminPanel.css';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [confessions, setConfessions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });
  const [polls, setPolls] = useState([]);

  // Poll creation state
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollForm, setPollForm] = useState({
    question: '',
    options: ['', ''],
    allowMultiple: false,
    isPinned: false,
    expiresAt: ''
  });

  // Pagination & filters
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const headers = {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Content-Type': 'application/json'
  };

  // ============================================
  // FETCH FUNCTIONS
  // ============================================
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`, { headers });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/admin/users?page=${userPage}&limit=50&search=${encodeURIComponent(userSearch)}&filter=${userFilter}`,
        { headers }
      );
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination?.pages || 1);
        setTotalUsers(data.pagination?.total || data.users?.length || 0);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchConfessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/confessions?sort=recent&limit=100`, { headers });
      const data = await res.json();
      setConfessions(data.confessions || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [dauRes, moodRes, topRes, buyersRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/analytics/dau?days=14`, { headers }),
        fetch(`${API_URL}/api/admin/analytics/mood-zones`, { headers }),
        fetch(`${API_URL}/api/admin/analytics/top-users`, { headers }),
        fetch(`${API_URL}/api/admin/analytics/top-buyers`, { headers })
      ]);
      const dau = await dauRes.json();
      const mood = await moodRes.json();
      const top = await topRes.json();
      const buyers = await buyersRes.json();
      setAnalytics({
        dau: dau.data || [],
        moodZones: mood.data || [],
        topUsers: top.users || [],
        topBuyers: buyers.buyers || []
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/user-activity-logs?limit=100`, { headers });
      const data = await res.json();
      if (data.success) setLogs(data.logs);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchPolls = async () => {
    try {
      const res = await fetch(`${API_URL}/api/polls?includeExpired=true`, { headers });
      const data = await res.json();
      setPolls(data.polls || []);
    } catch (e) { console.error(e); }
  };

  // ============================================
  // USER ACTIONS
  // ============================================
  const banUser = async (userId, duration) => {
    const reason = prompt(`Reason for banning (${duration === 'permanent' ? 'permanent' : duration + ' days'}):`) || 'Violated rules';
    if (!confirm(`Ban this user ${duration === 'permanent' ? 'permanently' : 'for ' + duration + ' days'}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/ban`, {
        method: 'POST', headers, body: JSON.stringify({ duration, reason })
      });
      const data = await res.json();
      if (data.success) { showNotification('🚫 User banned!', 'success'); fetchUsers(); }
      else showNotification(data.error, 'error');
    } catch (e) { showNotification('Failed to ban', 'error'); }
  };

  const unbanUser = async (userId) => {
    if (!confirm('Unban this user?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/unban`, { method: 'POST', headers });
      const data = await res.json();
      if (data.success) { showNotification('✅ User unbanned!', 'success'); fetchUsers(); }
    } catch (e) { showNotification('Failed to unban', 'error'); }
  };

  const deleteUser = async (userId) => {
    if (!confirm('⚠️ DELETE this user permanently?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (data.success) { showNotification('🗑️ User deleted!', 'success'); fetchUsers(); }
    } catch (e) { showNotification('Failed to delete', 'error'); }
  };

  const viewUser = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, { headers });
      const data = await res.json();
      if (data.success) { setSelectedUser(data); setShowUserModal(true); }
    } catch (e) { showNotification('Failed to load user', 'error'); }
  };

  // ============================================
  // CONFESSION ACTIONS
  // ============================================
  const pinConfession = async (id, isPinned) => {
    const endpoint = isPinned ? 'unpin' : 'pin';
    try {
      const res = await fetch(`${API_URL}/api/admin/confessions/${id}/${endpoint}`, { method: 'POST', headers });
      const data = await res.json();
      if (data.success) { showNotification(isPinned ? '📌 Unpinned!' : '📌 Pinned!', 'success'); fetchConfessions(); }
      else showNotification(data.error || data.message, 'error');
    } catch (e) { showNotification('Failed', 'error'); }
  };

  const featureConfession = async (id, isFeatured) => {
    const endpoint = isFeatured ? 'unfeature' : 'feature';
    try {
      const res = await fetch(`${API_URL}/api/admin/confessions/${id}/${endpoint}`, { method: 'POST', headers });
      const data = await res.json();
      if (data.success) { showNotification(isFeatured ? 'Unfeatured!' : '⭐ Featured!', 'success'); fetchConfessions(); }
    } catch (e) { showNotification('Failed', 'error'); }
  };

  const deleteConfession = async (id) => {
    if (!confirm('Delete this confession?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/confessions/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (data.success) { showNotification('🗑️ Deleted!', 'success'); fetchConfessions(); }
    } catch (e) { showNotification('Failed to delete', 'error'); }
  };

  // ============================================
  // POLL ACTIONS
  // ============================================
  const addPollOption = () => {
    if (pollForm.options.length < 12)
      setPollForm({ ...pollForm, options: [...pollForm.options, ''] });
  };

  const removePollOption = (i) => {
    if (pollForm.options.length > 2)
      setPollForm({ ...pollForm, options: pollForm.options.filter((_, idx) => idx !== i) });
  };

  const updatePollOption = (i, val) => {
    const opts = [...pollForm.options];
    opts[i] = val;
    setPollForm({ ...pollForm, options: opts });
  };

  const createPoll = async () => {
    if (!pollForm.question.trim()) { showNotification('Question required!', 'error'); return; }
    const validOpts = pollForm.options.filter(o => o.trim());
    if (validOpts.length < 2) { showNotification('At least 2 options required!', 'error'); return; }
    try {
      const res = await fetch(`${API_URL}/api/polls/create`, {
        method: 'POST', headers,
        body: JSON.stringify({
          question: pollForm.question.trim(),
          options: validOpts,
          allowMultipleAnswers: pollForm.allowMultiple,
          isPinned: pollForm.isPinned,
          expiresAt: pollForm.expiresAt || null
        })
      });
      const data = await res.json();
      if (data.poll) {
        showNotification('📊 Poll created!', 'success');
        setShowPollForm(false);
        setPollForm({ question: '', options: ['', ''], allowMultiple: false, isPinned: false, expiresAt: '' });
        fetchPolls();
      } else showNotification(data.error || 'Failed', 'error');
    } catch (e) { showNotification('Failed to create poll', 'error'); }
  };

  const deletePoll = async (pollId) => {
    if (!confirm('Delete this poll?')) return;
    try {
      const res = await fetch(`${API_URL}/api/polls/${pollId}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (data.message) { showNotification('🗑️ Poll deleted!', 'success'); fetchPolls(); }
    } catch (e) { showNotification('Failed', 'error'); }
  };

  const togglePinPoll = async (pollId, isPinned) => {
    try {
      const res = await fetch(`${API_URL}/api/polls/${pollId}/pin`, {
        method: 'PATCH', headers, body: JSON.stringify({ isPinned: !isPinned })
      });
      const data = await res.json();
      if (data.poll) { showNotification(!isPinned ? '📌 Poll pinned!' : 'Unpinned', 'success'); fetchPolls(); }
    } catch (e) { showNotification('Failed', 'error'); }
  };

  // ============================================
  // ANNOUNCEMENT
  // ============================================
  const sendAnnouncement = async () => {
    if (!announcement.title || !announcement.message) { showNotification('Title and message required!', 'error'); return; }
    try {
      const res = await fetch(`${API_URL}/api/notifications/announce`, {
        method: 'POST', headers, body: JSON.stringify({ ...announcement, target_audience: 'all' })
      });
      const data = await res.json();
      if (data.success) { showNotification('📢 Sent to all users!', 'success'); setAnnouncement({ title: '', message: '' }); }
      else showNotification(data.error, 'error');
    } catch (e) { showNotification('Failed to send', 'error'); }
  };

  // ============================================
  // HELPERS
  // ============================================
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const timeAgo = (date) => {
    if (!date) return 'N/A';
    const diff = Date.now() - new Date(date);
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  };

  const getMoodColor = (zone) => {
    const c = { 'Crush': '#FFB3BA', 'Heartbreak': '#BAE1FF', 'Secret Admirer': '#FFD4E5', 'Love Stories': '#FFFFBA' };
    return c[zone] || '#f0f0f0';
  };

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'confessions') fetchConfessions();
    else if (activeTab === 'analytics') fetchAnalytics();
    else if (activeTab === 'logs') fetchLogs();
    else if (activeTab === 'polls') fetchPolls();
    else if (activeTab === 'reports') fetchReports();
    else if (activeTab === 'access') fetchAccessRequests();
  }, [activeTab, userPage, userFilter]);

  useEffect(() => {
    if (activeTab === 'users') {
      const t = setTimeout(fetchUsers, 400);
      return () => clearTimeout(t);
    }
  }, [userSearch]);

  // ============================================
  // TAB: DASHBOARD
  // ============================================
  const renderDashboard = () => (
    <div className="tab-content">
      <h2 className="tab-title">DASHBOARD</h2>
      {stats && (
        <>
          <div className="stats-grid">
            {[
              { icon: '👥', value: stats.total_users, label: 'TOTAL USERS' },
              { icon: '💬', value: stats.total_confessions, label: 'CONFESSIONS' },
              { icon: '🔥', value: stats.active_users_24h, label: 'ACTIVE (24H)' },
              { icon: '⭐', value: stats.premium_users, label: 'PREMIUM' },
              { icon: '❤️', value: stats.total_reactions, label: 'REACTIONS' },
              { icon: '💰', value: stats.credits_in_circulation, label: 'CREDITS' },
              { icon: '🎁', value: stats.total_gifts, label: 'GIFTS' },
              { icon: '🚫', value: stats.banned_users, label: 'BANNED', alert: true },
            ].map((s, i) => (
              <div key={i} className={`stat-card ${s.alert ? 'stat-alert' : ''}`}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value?.toLocaleString() ?? 0}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="announce-box">
            <h3>📢 SEND ANNOUNCEMENT</h3>
            <p>Notify all users instantly</p>
            <input className="announce-input" placeholder="TITLE..."
              value={announcement.title} onChange={e => setAnnouncement({ ...announcement, title: e.target.value })} />
            <textarea className="announce-textarea" placeholder="Message to all users..." rows={3}
              value={announcement.message} onChange={e => setAnnouncement({ ...announcement, message: e.target.value })} />
            <button className="announce-btn" onClick={sendAnnouncement}>📢 SEND TO ALL USERS</button>
          </div>
        </>
      )}
    </div>
  );

  // ============================================
  // TAB: USERS
  // ============================================
  const renderUsers = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2 className="tab-title">USERS ({totalUsers})</h2>
        <div className="controls-row">
          <input className="ctrl-input" placeholder="SEARCH USERNAME, EMAIL..."
            value={userSearch} onChange={e => { setUserSearch(e.target.value); setUserPage(1); }} />
          <select className="ctrl-select" value={userFilter} onChange={e => { setUserFilter(e.target.value); setUserPage(1); }}>
            <option value="all">ALL USERS</option>
            <option value="premium">PREMIUM</option>
            <option value="banned">BANNED</option>
            <option value="active">ACTIVE (7D)</option>
          </select>
        </div>
      </div>

      {loading ? <div className="loading-state">LOADING...</div> : (
        <>
          <div className="table-scroll-wrap">
            <div className="data-table">
              <div className="table-head">
                <span>#</span>
                <span>USERNAME</span>
                <span>EMAIL</span>
                <span>CREDITS</span>
                <span>STATUS</span>
                <span>ACTIVITY</span>
                <span>ACTIONS</span>
              </div>
              {users.map(u => (
                <div key={u.id} className={`table-row ${u.is_banned ? 'row-banned' : ''}`}>
                  <span className="cell-num">#{u.user_number}</span>
                  <span className="cell-user">
                    {u.username}
                    {u.is_premium && <span className="tag tag-premium">⭐</span>}
                    {u.is_admin && <span className="tag tag-admin">👑</span>}
                  </span>
                  <span className="cell-email">{u.email}</span>
                  <span className="cell-credits">{u.credits}</span>
                  <span className="cell-status">
                    <span className={`status-pill ${u.is_banned ? 'pill-banned' : u.is_premium ? 'pill-premium' : 'pill-free'}`}>
                      {u.is_banned ? 'BANNED' : u.is_premium ? 'PREMIUM' : 'FREE'}
                    </span>
                  </span>
                  <span className="cell-activity">{u.confession_count ?? 0} posts<br />{u.reaction_count ?? 0} reactions</span>
                  <span className="cell-actions">
                    <button className="act-btn act-view" onClick={() => viewUser(u.id)}>VIEW</button>
                    {u.is_banned ? (
                      <button className="act-btn act-unban" onClick={() => unbanUser(u.id)}>UNBAN</button>
                    ) : !u.is_admin && (
                      <div className="ban-group">
                        <button className="act-btn act-ban" onClick={() => banUser(u.id, '3')}>3D</button>
                        <button className="act-btn act-ban" onClick={() => banUser(u.id, '7')}>7D</button>
                        <button className="act-btn act-ban" onClick={() => banUser(u.id, 'permanent')}>PERM</button>
                      </div>
                    )}
                    {!u.is_admin && <button className="act-btn act-delete" onClick={() => deleteUser(u.id)}>DEL</button>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pagination">
            <button className="page-btn" onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1}>← PREV</button>
            <span className="page-info">PAGE {userPage} / {totalPages}</span>
            <button className="page-btn" onClick={() => setUserPage(p => Math.min(totalPages, p + 1))} disabled={userPage === totalPages}>NEXT →</button>
          </div>
        </>
      )}
    </div>
  );

  // ============================================
  // TAB: CONFESSIONS
  // ============================================
  const renderConfessions = () => {
    const pinned = confessions.filter(c => c.is_pinned);
    const featured = confessions.filter(c => c.is_featured && !c.is_pinned);
    const normal = confessions.filter(c => !c.is_pinned && !c.is_featured);
    return (
      <div className="tab-content">
        <h2 className="tab-title">CONFESSIONS ({confessions.length})</h2>
        {pinned.length > 0 && (
          <div className="conf-section">
            <h3 className="section-label pinned-label">📌 PINNED ({pinned.length}/3)</h3>
            {pinned.map(c => <ConfessionRow key={c.id} c={c} onPin={pinConfession} onFeature={featureConfession} onDelete={deleteConfession} getMoodColor={getMoodColor} timeAgo={timeAgo} />)}
          </div>
        )}
        {featured.length > 0 && (
          <div className="conf-section">
            <h3 className="section-label featured-label">⭐ FEATURED BY ADMIN</h3>
            {featured.map(c => <ConfessionRow key={c.id} c={c} onPin={pinConfession} onFeature={featureConfession} onDelete={deleteConfession} getMoodColor={getMoodColor} timeAgo={timeAgo} />)}
          </div>
        )}
        <div className="conf-section">
          <h3 className="section-label">ALL CONFESSIONS</h3>
          {loading ? <div className="loading-state">LOADING...</div> :
            normal.map(c => <ConfessionRow key={c.id} c={c} onPin={pinConfession} onFeature={featureConfession} onDelete={deleteConfession} getMoodColor={getMoodColor} timeAgo={timeAgo} />)}
        </div>
      </div>
    );
  };

  // ============================================
  // TAB: POLLS (NEW)
  // ============================================
  const renderPolls = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2 className="tab-title">POLLS ({polls.length})</h2>
        <button className="announce-btn" style={{ marginTop: 0 }} onClick={() => setShowPollForm(!showPollForm)}>
          {showPollForm ? '✕ CANCEL' : '+ CREATE POLL'}
        </button>
      </div>

      {/* POLL CREATION FORM */}
      {showPollForm && (
        <div className="poll-create-box">
          <h3>📊 NEW POLL</h3>

          <div className="poll-field">
            <label>QUESTION *</label>
            <input
              className="announce-input"
              placeholder="Ask your question..."
              maxLength={500}
              value={pollForm.question}
              onChange={e => setPollForm({ ...pollForm, question: e.target.value })}
            />
            <small style={{ color: '#888' }}>{pollForm.question.length}/500</small>
          </div>

          <div className="poll-field">
            <label>OPTIONS (2–12) *</label>
            {pollForm.options.map((opt, i) => (
              <div key={i} className="poll-option-row">
                <input
                  className="announce-input"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  maxLength={200}
                  onChange={e => updatePollOption(i, e.target.value)}
                  style={{ marginBottom: 8 }}
                />
                {pollForm.options.length > 2 && (
                  <button className="poll-remove-opt" onClick={() => removePollOption(i)}>✕</button>
                )}
              </div>
            ))}
            {pollForm.options.length < 12 && (
              <button className="poll-add-opt" onClick={addPollOption}>+ ADD OPTION</button>
            )}
          </div>

          <div className="poll-toggles">
            <label className="poll-toggle-label">
              <input type="checkbox" checked={pollForm.allowMultiple}
                onChange={e => setPollForm({ ...pollForm, allowMultiple: e.target.checked })} />
              Allow multiple votes per user
            </label>
            <label className="poll-toggle-label">
              <input type="checkbox" checked={pollForm.isPinned}
                onChange={e => setPollForm({ ...pollForm, isPinned: e.target.checked })} />
              Pin this poll (appears at top)
            </label>
          </div>

          <div className="poll-field">
            <label>EXPIRY DATE (optional)</label>
            <input type="datetime-local" className="announce-input"
              value={pollForm.expiresAt} onChange={e => setPollForm({ ...pollForm, expiresAt: e.target.value })} />
          </div>

          <button className="announce-btn" onClick={createPoll}>📊 CREATE POLL</button>
        </div>
      )}

      {/* POLLS LIST */}
      <div className="polls-admin-list">
        {polls.length === 0 ? (
          <div className="empty-state"><p>📊 No polls yet</p><small>Create your first poll above</small></div>
        ) : polls.map(poll => {
          const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();
          return (
            <div key={poll.id} className={`poll-admin-card ${poll.is_pinned ? 'poll-pinned' : ''} ${isExpired ? 'poll-expired' : ''}`}>
              <div className="poll-admin-header">
                <div className="poll-admin-meta">
                  {poll.is_pinned && <span className="conf-tag conf-tag-pin">📌 PINNED</span>}
                  {isExpired && <span className="conf-tag" style={{ background: '#ccc' }}>EXPIRED</span>}
                  {poll.allow_multiple_answers && <span className="conf-tag" style={{ background: '#BAE1FF' }}>MULTI-SELECT</span>}
                </div>
                <span className="poll-votes-badge">{poll.total_votes || 0} VOTES</span>
              </div>

              <p className="poll-admin-question">{poll.question}</p>

              <div className="poll-admin-options">
                {poll.options?.map(opt => {
                  const pct = poll.total_votes > 0 ? ((opt.vote_count / poll.total_votes) * 100).toFixed(1) : 0;
                  return (
                    <div key={opt.id} className="poll-opt-bar">
                      <div className="poll-opt-track">
                        <div className="poll-opt-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="poll-opt-text">{opt.option_text}</span>
                      <span className="poll-opt-pct">{pct}%</span>
                    </div>
                  );
                })}
              </div>

              <div className="conf-actions" style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <button className={`conf-btn ${poll.is_pinned ? 'conf-btn-active' : ''}`}
                  onClick={() => togglePinPoll(poll.id, poll.is_pinned)}>
                  {poll.is_pinned ? '📌 UNPIN' : '📌 PIN'}
                </button>
                <button className="conf-btn conf-btn-delete" onClick={() => deletePoll(poll.id)}>🗑️ DELETE</button>
                {poll.expires_at && (
                  <span style={{ fontSize: '0.75rem', color: '#888', alignSelf: 'center' }}>
                    {isExpired ? 'Expired' : `Expires ${timeAgo(poll.expires_at)}`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ============================================
  // TAB: ANALYTICS
  // ============================================
  const renderAnalytics = () => (
    <div className="tab-content">
      <h2 className="tab-title">ANALYTICS</h2>
      {loading ? <div className="loading-state">LOADING...</div> : analytics ? (
        <div className="analytics-grid">

          {/* Mood Zones */}
          <div className="analytics-card">
            <h3>💕 MOOD ZONE BREAKDOWN</h3>
            <div className="mood-bars">
              {analytics.moodZones.map((zone, i) => (
                <div key={i} className="mood-bar-row">
                  <span className="mood-bar-label">{zone.mood_zone}</span>
                  <div className="mood-bar-track">
                    <div className="mood-bar-fill" style={{ width: `${zone.percentage}%`, background: getMoodColor(zone.mood_zone) }} />
                  </div>
                  <span className="mood-bar-count">{zone.count} ({zone.percentage}%)</span>
                </div>
              ))}
              {analytics.moodZones.length === 0 && <p className="no-data-msg">No data yet</p>}
            </div>
          </div>

          {/* TOP BUYERS - NEW */}
          <div className="analytics-card">
            <h3>💳 TOP 10 BUYERS</h3>
            <div className="top-users-list">
              {analytics.topBuyers?.slice(0, 10).map((b, i) => (
                <div key={b.user_id} className="top-user-row">
                  <span className="top-rank">#{i + 1}</span>
                  <span className="top-username">{b.username} {b.is_premium ? '⭐' : ''}</span>
                  <div className="top-stats">
                    <span>{b.purchase_count} purchases</span>
                    <span>{b.total_credits_bought} credits</span>
                  </div>
                  <span className="top-total" style={{ color: '#4CAF50' }}>₹{b.total_spent}</span>
                </div>
              ))}
              {(!analytics.topBuyers || analytics.topBuyers.length === 0) && (
                <p className="no-data-msg">No purchases yet</p>
              )}
            </div>
          </div>

          {/* Top Users by Activity */}
          <div className="analytics-card">
            <h3>🏆 TOP USERS BY ACTIVITY</h3>
            <div className="top-users-list">
              {analytics.topUsers.slice(0, 10).map((u, i) => (
                <div key={u.id} className="top-user-row">
                  <span className="top-rank">#{i + 1}</span>
                  <span className="top-username">{u.username}{u.is_premium && '⭐'}</span>
                  <div className="top-stats">
                    <span>{u.confession_count} posts</span>
                    <span>{u.reaction_count} reactions</span>
                    <span>{u.reply_count} replies</span>
                  </div>
                  <span className="top-total">{u.total_activity}</span>
                </div>
              ))}
              {analytics.topUsers.length === 0 && <p className="no-data-msg">No data yet</p>}
            </div>
          </div>

          {/* DAU Chart */}
          <div className="analytics-card">
            <h3>📈 DAILY ACTIVE USERS (14 DAYS)</h3>
            <div className="dau-chart">
              {analytics.dau.length > 0 ? (
                <div className="bar-chart">
                  {analytics.dau.slice(0, 14).reverse().map((d, i) => {
                    const maxVal = Math.max(...analytics.dau.map(x => x.active_users), 1);
                    const height = (d.active_users / maxVal) * 120;
                    return (
                      <div key={i} className="bar-col">
                        <span className="bar-value">{d.active_users}</span>
                        <div className="bar-fill" style={{ height: `${height}px` }} />
                        <span className="bar-date">{new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="no-data-msg">No DAU data yet</p>}
            </div>
          </div>

        </div>
      ) : <div className="loading-state">Failed to load</div>}
    </div>
  );

  // ============================================
  // TAB: LOGS (USER ACTIVITY - not admin)
  // ============================================
  const renderLogs = () => (
    <div className="tab-content">
      <h2 className="tab-title">USER ACTIVITY LOGS</h2>
      <p style={{ color: '#888', marginBottom: 20, fontSize: '0.9rem' }}>
        Recent actions by all users — confessions posted, replies, credit purchases
      </p>
      {loading ? <div className="loading-state">LOADING...</div> : (
        <div className="logs-list">
          {logs.length === 0 ? (
            <div className="empty-state">
              <p>📋 No activity logged yet</p>
              <small>User actions will appear here as they use the platform</small>
            </div>
          ) : logs.map(log => (
            <div key={log.id} className="log-row">
              <div className="log-left">
                <span className={`log-badge log-${log.action_type}`}>
                  {LOG_LABELS[log.action_type] || log.action_type.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
              <div className="log-middle">
                <span className="log-user-name">
                  {log.username} <span style={{ color: '#aaa' }}>#{log.user_number}</span>
                </span>
                <span className="log-desc">{formatLogDescription(log)}</span>
              </div>
              <div className="log-right">
                <span className="log-time">{timeAgo(log.created_at)}</span>
                {log.credits_change !== 0 && log.credits_change != null && (
                  <span className={`credit-delta ${log.credits_change > 0 ? 'delta-pos' : 'delta-neg'}`}>
                    {log.credits_change > 0 ? '+' : ''}{log.credits_change} cr
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const LOG_LABELS = {
    post_confession: '💬 POSTED',
    reply: '↩️ REPLIED',
    bought_credits: '💳 BOUGHT CREDITS',
    bought_premium: '⭐ WENT PREMIUM',
    banned: '🚫 BANNED',
    unbanned: '✅ UNBANNED',
  };

  const formatLogDescription = (log) => {
    switch (log.action_type) {
      case 'post_confession': return `Posted a confession in ${log.meta?.mood_zone || 'a mood zone'}`;
      case 'reply': return `Replied to a confession`;
      case 'bought_credits': return `Purchased ${log.meta?.credits || ''} credits`;
      case 'bought_premium': return `Subscribed to Premium`;
      case 'banned': return `Was banned (${log.meta?.duration || 'permanent'})`;
      case 'unbanned': return `Was unbanned by admin`;
      default: return log.action_type.replace(/_/g, ' ');
    }
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="admin-wrap">
      {notification && (
        <div className={`admin-notif ${notification.type}`}>{notification.message}</div>
      )}

      <aside className="admin-side">
        <div className="side-logo"><span>ADMIN</span></div>
        <nav className="side-nav">
          {[
            { key: 'dashboard', icon: '📊', label: 'DASHBOARD' },
            { key: 'users', icon: '👥', label: 'USERS' },
            { key: 'confessions', icon: '💬', label: 'CONFESSIONS' },
            { key: 'polls', icon: '📊', label: 'POLLS' },
            { key: 'analytics', icon: '📈', label: 'ANALYTICS' },
            { key: 'logs', icon: '📋', label: 'USER LOGS' },
            { key: 'reports', icon: '🚩', label: 'REPORTS' },
            { key: 'access', icon: '🎫', label: 'ACCESS CODES' },
            { key: 'credits', icon: '💰', label: 'CREDIT MANAGER' },
            { key: 'premium', icon: '⭐', label: 'PREMIUM MANAGER' },
          ].map(tab => (
            <button key={tab.key}
              className={`side-btn ${activeTab === tab.key ? 'side-btn-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}>
              <span className="side-icon">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </nav>
        <button className="back-btn" onClick={() => window.location.href = '/'}>← BACK TO APP</button>
      </aside>

      <main className="admin-main">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'confessions' && renderConfessions()}
        {activeTab === 'polls' && renderPolls()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'logs' && renderLogs()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'access' && renderAccessCodes()}
        {activeTab === 'credits' && renderCreditManager()}
        {activeTab === 'premium' && renderPremiumManager()}

      </main>

      {/* User detail modal */}
      {showUserModal && selectedUser && (
        <div className="modal-bg" onClick={() => setShowUserModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUserModal(false)}>✕</button>
            <h2>USER DETAILS</h2>
            <div className="modal-grid">
              {[
                ['Username', selectedUser.user.username],
                ['Email', selectedUser.user.email],
                ['User #', selectedUser.user.user_number],
                ['Credits', selectedUser.user.credits],
                ['Premium', selectedUser.user.is_premium ? '⭐ Yes' : 'No'],
                ['Banned', selectedUser.user.is_banned ? '🚫 Yes' : 'No'],
                ['Reg. IP', selectedUser.user.registration_ip || 'N/A'],
                ['Last IP', selectedUser.user.last_ip || 'N/A'],
                ['Joined', new Date(selectedUser.user.created_at).toLocaleDateString()],
                ['Last Login', selectedUser.user.last_login ? new Date(selectedUser.user.last_login).toLocaleDateString() : 'N/A'],
              ].map(([label, value]) => (
                <div key={label} className="modal-field"><b>{label}</b>{value}</div>
              ))}
            </div>

            <h3>RECENT CONFESSIONS</h3>
            <div className="modal-list">
              {selectedUser.confessions?.slice(0, 5).map(c => (
                <div key={c.id} className="modal-list-item">
                  <span className="modal-list-mood" style={{ background: getMoodColor(c.mood_zone) }}>{c.mood_zone}</span>
                  <span className="modal-list-text">{c.content?.slice(0, 80)}...</span>
                  <span className="modal-list-time">{timeAgo(c.created_at)}</span>
                </div>
              ))}
              {(!selectedUser.confessions || selectedUser.confessions.length === 0) && <p style={{ padding: 12, color: '#888' }}>No confessions</p>}
            </div>

            <h3>IP ACTIVITY LOG</h3>
            <div className="modal-list">
              {selectedUser.activity?.slice(0, 8).map((a, i) => (
                <div key={i} className="modal-list-item">
                  <span className="modal-list-mood">{a.action_type}</span>
                  <span className="modal-list-ip">{a.ip_address}</span>
                  <span className="modal-list-time">{timeAgo(a.created_at)}</span>
                </div>
              ))}
              {(!selectedUser.activity || selectedUser.activity.length === 0) && <p style={{ padding: 12, color: '#888' }}>No activity logged</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// TAB: REPORTS (NEW)
// ============================================
const [reports, setReports] = useState([]);

const fetchReports = async () => {
  setLoading(true);
  try {
    const res = await fetch(`${API_URL}/api/admin/reports`, { headers });
    const data = await res.json();
    setReports(data.reports || []);
  } catch (e) { console.error(e); }
  finally { setLoading(false); }
};

const handleReport = async (reportId, action) => {
  const msg = action === 'dismiss' ? 'DISMISS this report?' : 'REMOVE the confession?';
  if (!confirm(msg)) return;
  
  try {
    const res = await fetch(`${API_URL}/api/admin/reports/${reportId}/resolve`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    if (data.success) {
      showNotification(action === 'dismiss' ? '✅ Report dismissed' : '🗑️ Confession removed', 'success');
      fetchReports();
    } else {
      showNotification(data.error, 'error');
    }
  } catch (e) {
    showNotification('Failed to resolve report', 'error');
  }
};

const renderReports = () => (
  <div className="tab-content">
    <h2 className="tab-title">REPORTS ({reports.filter(r => r.status === 'pending').length})</h2>
    {loading ? <div className="loading-state">LOADING...</div> : (
      <div className="reports-list">
        {reports.filter(r => r.status === 'pending').length === 0 ? (
          <div className="empty-state">
            <p>✅ No pending reports!</p>
            <small>Reported confessions will appear here</small>
          </div>
        ) : (
          reports.filter(r => r.status === 'pending').map(report => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <span className="report-reason">🚩 {report.reason.toUpperCase()}</span>
                <span className="report-date">{new Date(report.created_at).toLocaleDateString()}</span>
              </div>
              
              <div className="report-details">
                <p><strong>Reported by:</strong> {report.reporter_username} #{report.reporter_user_number}</p>
                <p><strong>Confession by:</strong> {report.confession_username} #{report.confession_user_number}</p>
                {report.details && <p><strong>Details:</strong> {report.details}</p>}
              </div>

              <div className="reported-confession-box">
                <strong>📝 Reported Confession:</strong>
                <p className="conf-text" style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
                  {report.confession_content}
                </p>
                <span className="conf-mood" style={{ marginTop: 8, display: 'inline-block', background: getMoodColor(report.confession_mood_zone) }}>
                  {report.confession_mood_zone}
                </span>
              </div>

              <div className="report-actions" style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button 
                  className="conf-btn" 
                  style={{ background: '#4CAF50', color: '#fff' }}
                  onClick={() => handleReport(report.id, 'dismiss')}
                >
                  ✅ DISMISS (Keep Confession)
                </button>
                <button 
                  className="conf-btn conf-btn-delete" 
                  onClick={() => handleReport(report.id, 'remove')}
                >
                  🗑️ REMOVE CONFESSION
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    )}
  </div>
);

// ============================================
// TAB: ACCESS CODES (NEW)
// ============================================
const [accessRequests, setAccessRequests] = useState([]);
const [generatedCodes, setGeneratedCodes] = useState([]);

const fetchAccessRequests = async () => {
  setLoading(true);
  try {
    const res = await fetch(`${API_URL}/api/admin/access-requests`, { headers });
    const data = await res.json();
    setAccessRequests(data.requests || []);
  } catch (e) { console.error(e); }
  finally { setLoading(false); }
};

const generateAccessCodes = async () => {
  const count = prompt('How many access codes? (1-1000)');
  if (!count || count < 1 || count > 1000) return;
  
  try {
    const res = await fetch(`${API_URL}/api/admin/codes/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ count: parseInt(count) })
    });
    const data = await res.json();
    if (data.success) {
      setGeneratedCodes(data.codes);
      
      // Download as text file
      const blob = new Blob([data.codes.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `access_codes_${Date.now()}.txt`;
      a.click();
      
      showNotification(`✅ Generated ${count} codes! Downloaded as file.`, 'success');
    } else {
      showNotification(data.error, 'error');
    }
  } catch (e) {
    showNotification('Failed to generate codes', 'error');
  }
};

const handleAccessRequest = async (requestId, action) => {
  try {
    const res = await fetch(`${API_URL}/api/admin/access-requests/${requestId}/${action}`, {
      method: 'POST',
      headers
    });
    const data = await res.json();
    if (data.success) {
      showNotification(`✅ Request ${action}d!`, 'success');
      fetchAccessRequests();
    } else {
      showNotification(data.error, 'error');
    }
  } catch (e) {
    showNotification('Failed', 'error');
  }
};

const renderAccessCodes = () => (
  <div className="tab-content">
    <h2 className="tab-title">ACCESS CODES</h2>
    
    <div className="access-actions" style={{ marginBottom: 32 }}>
      <button className="announce-btn" onClick={generateAccessCodes}>
        🎫 GENERATE ACCESS CODES
      </button>
    </div>

    {generatedCodes.length > 0 && (
      <div className="generated-codes-box" style={{ marginBottom: 32, padding: 20, background: '#f9f9f9', borderRadius: 12, border: '3px solid #000' }}>
        <h3>✅ RECENTLY GENERATED CODES</h3>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: 12 }}>
          These codes were just generated. They've been downloaded as a text file.
        </p>
        <div style={{ maxHeight: 200, overflow: 'auto', background: '#fff', padding: 12, borderRadius: 8, fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {generatedCodes.map((code, i) => (
            <div key={i}>{code}</div>
          ))}
        </div>
      </div>
    )}

    <h3 style={{ marginBottom: 16 }}>📧 PENDING ACCESS REQUESTS</h3>
    {loading ? <div className="loading-state">LOADING...</div> : (
      accessRequests.filter(r => r.status === 'pending').length === 0 ? (
        <div className="empty-state">
          <p>✅ No pending requests!</p>
        </div>
      ) : (
        <div className="table-scroll-wrap">
          <div className="data-table">
            <div className="table-head">
              <span>EMAIL</span>
              <span>REQUESTED</span>
              <span>ACTIONS</span>
            </div>
            {accessRequests.filter(r => r.status === 'pending').map(req => (
              <div key={req.id} className="table-row">
                <span className="cell-email">{req.email}</span>
                <span className="cell-activity">{timeAgo(req.created_at)}</span>
                <span className="cell-actions">
                  <button 
                    className="act-btn" 
                    style={{ background: '#4CAF50', color: '#fff' }}
                    onClick={() => handleAccessRequest(req.id, 'approve')}
                  >
                    ✅ APPROVE
                  </button>
                  <button 
                    className="act-btn act-delete" 
                    onClick={() => handleAccessRequest(req.id, 'reject')}
                  >
                    ❌ REJECT
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    )}
  </div>
);

// ============================================
// TAB: CREDIT MANAGER (NEW)
// ============================================
const [creditUser, setCreditUser] = useState('');
const [creditAmount, setCreditAmount] = useState('');

const adjustCredits = async (operation) => {
  if (!creditUser || !creditAmount) {
    showNotification('Enter user ID/email and amount', 'error');
    return;
  }

  const amount = parseInt(creditAmount);
  if (isNaN(amount) || amount <= 0) {
    showNotification('Invalid amount', 'error');
    return;
  }

  const finalAmount = operation === 'add' ? amount : -amount;
  
  if (!confirm(`${operation === 'add' ? 'ADD' : 'REMOVE'} ${amount} credits ${operation === 'add' ? 'to' : 'from'} user ${creditUser}?`)) return;

  try {
    const res = await fetch(`${API_URL}/api/admin/users/adjust-credits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userIdentifier: creditUser, // can be user_id, email, or username
        amount: finalAmount,
        reason: `Admin adjustment: ${operation === 'add' ? 'added' : 'removed'} ${amount} credits`
      })
    });
    const data = await res.json();
    if (data.success) {
      showNotification(`✅ ${operation === 'add' ? 'Added' : 'Removed'} ${amount} credits! New balance: ${data.new_balance}`, 'success');
      setCreditUser('');
      setCreditAmount('');
    } else {
      showNotification(data.error, 'error');
    }
  } catch (e) {
    showNotification('Failed to adjust credits', 'error');
  }
};

const renderCreditManager = () => (
  <div className="tab-content">
    <h2 className="tab-title">CREDIT MANAGER</h2>
    <p style={{ color: '#888', marginBottom: 24, fontSize: '0.9rem' }}>
      Manually add or remove credits from any user's account
    </p>

    <div className="credit-manager-box" style={{ maxWidth: 600, padding: 24, background: '#f9f9f9', borderRadius: 12, border: '3px solid #000' }}>
      <div className="poll-field">
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>USER (Email, Username, or User #)</label>
        <input
          className="announce-input"
          placeholder="user@example.com OR username OR #123"
          value={creditUser}
          onChange={e => setCreditUser(e.target.value)}
        />
      </div>

      <div className="poll-field">
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>AMOUNT</label>
        <input
          type="number"
          className="announce-input"
          placeholder="100"
          value={creditAmount}
          onChange={e => setCreditAmount(e.target.value)}
          min="1"
        />
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button 
          className="announce-btn" 
          style={{ flex: 1, background: '#4CAF50' }}
          onClick={() => adjustCredits('add')}
        >
          ➕ ADD CREDITS
        </button>
        <button 
          className="announce-btn" 
          style={{ flex: 1, background: '#FF5722' }}
          onClick={() => adjustCredits('remove')}
        >
          ➖ REMOVE CREDITS
        </button>
      </div>
    </div>

    <div className="info-box" style={{ marginTop: 24, padding: 16, background: '#FFF9C4', borderRadius: 8, border: '2px solid #000' }}>
      <strong>💡 TIP:</strong> You can use email, username, or user number (e.g., #123) to identify users.
    </div>
  </div>
);

// ============================================
// TAB: PREMIUM MANAGER (NEW)
// ============================================
const [premiumUser, setPremiumUser] = useState('');
const [premiumDuration, setPremiumDuration] = useState('30');

const togglePremium = async (action) => {
  if (!premiumUser) {
    showNotification('Enter user ID/email', 'error');
    return;
  }

  if (action === 'activate') {
    const days = parseInt(premiumDuration);
    if (isNaN(days) || days <= 0) {
      showNotification('Invalid duration', 'error');
      return;
    }

    if (!confirm(`Activate PREMIUM for ${days} days for user ${premiumUser}?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/users/grant-premium`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userIdentifier: premiumUser,
          days: days
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`✅ Premium activated for ${days} days!`, 'success');
        setPremiumUser('');
      } else {
        showNotification(data.error, 'error');
      }
    } catch (e) {
      showNotification('Failed to activate premium', 'error');
    }
  } else {
    // Deactivate
    if (!confirm(`REMOVE premium from user ${premiumUser}?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/users/revoke-premium`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userIdentifier: premiumUser
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('❌ Premium deactivated!', 'success');
        setPremiumUser('');
      } else {
        showNotification(data.error, 'error');
      }
    } catch (e) {
      showNotification('Failed to deactivate premium', 'error');
    }
  }
};

const renderPremiumManager = () => (
  <div className="tab-content">
    <h2 className="tab-title">PREMIUM MANAGER</h2>
    <p style={{ color: '#888', marginBottom: 24, fontSize: '0.9rem' }}>
      Grant or revoke premium subscription for any user
    </p>

    <div className="premium-manager-box" style={{ maxWidth: 600, padding: 24, background: '#f9f9f9', borderRadius: 12, border: '3px solid #000' }}>
      <div className="poll-field">
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>USER (Email, Username, or User #)</label>
        <input
          className="announce-input"
          placeholder="user@example.com OR username OR #123"
          value={premiumUser}
          onChange={e => setPremiumUser(e.target.value)}
        />
      </div>

      <div className="poll-field">
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>DURATION (Days)</label>
        <select 
          className="ctrl-select"
          value={premiumDuration}
          onChange={e => setPremiumDuration(e.target.value)}
        >
          <option value="7">7 Days</option>
          <option value="15">15 Days</option>
          <option value="30">30 Days (1 Month)</option>
          <option value="90">90 Days (3 Months)</option>
          <option value="180">180 Days (6 Months)</option>
          <option value="365">365 Days (1 Year)</option>
          <option value="730">730 Days (2 Years)</option>
          <option value="3650">3650 Days (10 Years)</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button 
          className="announce-btn" 
          style={{ flex: 1, background: '#FFD700', color: '#000' }}
          onClick={() => togglePremium('activate')}
        >
          ⭐ ACTIVATE PREMIUM
        </button>
        <button 
          className="announce-btn" 
          style={{ flex: 1, background: '#666' }}
          onClick={() => togglePremium('deactivate')}
        >
          ❌ DEACTIVATE PREMIUM
        </button>
      </div>
    </div>

    <div className="info-box" style={{ marginTop: 24, padding: 16, background: '#FFE0E0', borderRadius: 8, border: '2px solid #000' }}>
      <strong>⚠️ WARNING:</strong> Manually granted premium will override any active subscription. Deactivating will cancel premium immediately without refund.
    </div>
  </div>
);

// ============================================
// CONFESSION ROW COMPONENT
// ============================================
function ConfessionRow({ c, onPin, onFeature, onDelete, getMoodColor, timeAgo }) {
  return (
    <div className={`conf-row ${c.is_pinned ? 'conf-pinned' : ''} ${c.is_featured ? 'conf-featured' : ''}`}>
      <div className="conf-left">
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
          <span className="conf-mood" style={{ background: getMoodColor(c.mood_zone) }}>{c.mood_zone}</span>
          {c.is_pinned && <span className="conf-tag conf-tag-pin">📌 PINNED</span>}
          {c.is_featured && <span className="conf-tag conf-tag-feature">⭐ FEATURED</span>}
        </div>
        <p className="conf-text">{c.content?.slice(0, 120)}{c.content?.length > 120 ? '...' : ''}</p>
        <div className="conf-meta">
          <span>{c.username} #{c.user_number}</span>
          <span>{timeAgo(c.created_at)}</span>
          <span>❤️{c.heart_count} 👍{c.like_count} 😢{c.cry_count} 😂{c.laugh_count}</span>
        </div>
      </div>
      <div className="conf-actions">
        <button className={`conf-btn ${c.is_pinned ? 'conf-btn-active' : ''}`} onClick={() => onPin(c.id, c.is_pinned)}>
          {c.is_pinned ? '📌 UNPIN' : '📌 PIN'}
        </button>
        <button className={`conf-btn ${c.is_featured ? 'conf-btn-gold' : ''}`} onClick={() => onFeature(c.id, c.is_featured)}>
          {c.is_featured ? '⭐ UNFEATURE' : '⭐ FEATURE'}
        </button>
        <button className="conf-btn conf-btn-delete" onClick={() => onDelete(c.id)}>🗑️ DELETE</button>
      </div>
    </div>
  );
}
