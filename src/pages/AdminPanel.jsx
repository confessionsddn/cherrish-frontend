// frontend/src/pages/AdminPanel.jsx - COMPLETE WITH ALL TABS
import { useState, useEffect } from 'react';
import { API_URL } from '../services/api';
import './AdminPanel.css';

export default function AdminPanel() {
  // ============================================
  // STATE
  // ============================================
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [confessions, setConfessions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });

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
        `${API_URL}/api/admin/users?page=${userPage}&limit=50&search=${userSearch}&filter=${userFilter}`,
        { headers }
      );
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination?.pages || 1);
        setTotalUsers(data.pagination?.total || data.users.length);
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
      const [dauRes, moodRes, topRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/analytics/dau?days=14`, { headers }),
        fetch(`${API_URL}/api/admin/analytics/mood-zones`, { headers }),
        fetch(`${API_URL}/api/admin/analytics/top-users`, { headers })
      ]);
      const dau = await dauRes.json();
      const mood = await moodRes.json();
      const top = await topRes.json();
      setAnalytics({
        dau: dau.data || [],
        moodZones: mood.data || [],
        topUsers: top.users || []
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/logs?limit=100`, { headers });
      const data = await res.json();
      if (data.success) setLogs(data.logs);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ============================================
  // USER ACTIONS
  // ============================================

  const banUser = async (userId, duration) => {
    const reason = prompt(`Reason for banning (${duration === 'permanent' ? 'permanent' : duration + ' days'}):`) || 'Violated rules';
    if (!confirm(`Ban this user ${duration === 'permanent' ? 'permanently' : 'for ' + duration + ' days'}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/ban`, {
        method: 'POST', headers,
        body: JSON.stringify({ duration, reason })
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
  // ANNOUNCEMENT
  // ============================================

  const sendAnnouncement = async () => {
    if (!announcement.title || !announcement.message) {
      showNotification('Title and message required!', 'error'); return;
    }
    try {
      const res = await fetch(`${API_URL}/api/notifications/announce`, {
        method: 'POST', headers,
        body: JSON.stringify({ ...announcement, target_audience: 'all' })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('📢 Announcement sent to all users!', 'success');
        setAnnouncement({ title: '', message: '' });
      } else showNotification(data.error, 'error');
    } catch (e) { showNotification('Failed to send', 'error'); }
  };

  // ============================================
  // UI HELPERS
  // ============================================

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const timeAgo = (date) => {
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
    const colors = { 'Crush': '#FFB3BA', 'Heartbreak': '#BAE1FF', 'Secret Admirer': '#FFD4E5', 'Love Stories': '#FFFFBA' };
    return colors[zone] || '#f0f0f0';
  };

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'confessions') fetchConfessions();
    else if (activeTab === 'analytics') fetchAnalytics();
    else if (activeTab === 'logs') fetchLogs();
  }, [activeTab, userPage, userFilter]);

  useEffect(() => {
    if (activeTab === 'users') {
      const timer = setTimeout(fetchUsers, 400);
      return () => clearTimeout(timer);
    }
  }, [userSearch]);

  // ============================================
  // RENDER: DASHBOARD
  // ============================================
  const renderDashboard = () => (
    <div className="tab-content">
      <h2 className="tab-title">DASHBOARD</h2>
      {stats ? (
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

          {/* Announcement Section */}
          <div className="announce-box">
            <h3>📢 SEND ANNOUNCEMENT</h3>
            <p>Notify all users instantly</p>
            <input
              className="announce-input"
              placeholder="ANNOUNCEMENT TITLE..."
              value={announcement.title}
              onChange={e => setAnnouncement({ ...announcement, title: e.target.value })}
            />
            <textarea
              className="announce-textarea"
              placeholder="Write your message to all users..."
              rows={3}
              value={announcement.message}
              onChange={e => setAnnouncement({ ...announcement, message: e.target.value })}
            />
            <button className="announce-btn" onClick={sendAnnouncement}>
              📢 SEND TO ALL USERS
            </button>
          </div>
        </>
      ) : (
        <div className="loading-state">Loading...</div>
      )}
    </div>
  );

  // ============================================
  // RENDER: USERS
  // ============================================
  const renderUsers = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2 className="tab-title">USERS ({totalUsers})</h2>
        <div className="controls-row">
          <input
            className="ctrl-input"
            placeholder="SEARCH USERNAME, EMAIL..."
            value={userSearch}
            onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
          />
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
                <span className="cell-activity">
                  {u.confession_count ?? 0} posts<br />
                  {u.reaction_count ?? 0} reactions
                </span>
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
  // RENDER: CONFESSIONS
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
          {loading ? <div className="loading-state">LOADING...</div> : normal.map(c => (
            <ConfessionRow key={c.id} c={c} onPin={pinConfession} onFeature={featureConfession} onDelete={deleteConfession} getMoodColor={getMoodColor} timeAgo={timeAgo} />
          ))}
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER: ANALYTICS
  // ============================================
  const renderAnalytics = () => (
    <div className="tab-content">
      <h2 className="tab-title">ANALYTICS</h2>
      {loading ? <div className="loading-state">LOADING...</div> : analytics ? (
        <div className="analytics-grid">

          {/* Mood Zones */}
          <div className="analytics-card wide">
            <h3>💕 MOOD ZONE BREAKDOWN</h3>
            <div className="mood-bars">
              {analytics.moodZones.map((zone, i) => (
                <div key={i} className="mood-bar-row">
                  <span className="mood-bar-label">{zone.mood_zone}</span>
                  <div className="mood-bar-track">
                    <div
                      className="mood-bar-fill"
                      style={{ width: `${zone.percentage}%`, background: getMoodColor(zone.mood_zone) }}
                    />
                  </div>
                  <span className="mood-bar-count">{zone.count} ({zone.percentage}%)</span>
                </div>
              ))}
              {analytics.moodZones.length === 0 && <p className="no-data-msg">No data yet</p>}
            </div>
          </div>

          {/* Top Users */}
          <div className="analytics-card wide">
            <h3>🏆 TOP USERS BY ACTIVITY</h3>
            <div className="top-users-list">
              {analytics.topUsers.slice(0, 10).map((u, i) => (
                <div key={u.id} className="top-user-row">
                  <span className="top-rank">#{i + 1}</span>
                  <span className="top-username">
                    {u.username}
                    {u.is_premium && '⭐'}
                  </span>
                  <div className="top-stats">
                    <span>{u.confession_count} posts</span>
                    <span>{u.reaction_count} reactions</span>
                    <span>{u.reply_count} replies</span>
                  </div>
                  <span className="top-total">{u.total_activity} total</span>
                </div>
              ))}
              {analytics.topUsers.length === 0 && <p className="no-data-msg">No data yet</p>}
            </div>
          </div>

          {/* DAU */}
          <div className="analytics-card wide">
            <h3>📈 DAILY ACTIVE USERS (LAST 14 DAYS)</h3>
            <div className="dau-chart">
              {analytics.dau.length > 0 ? (
                <div className="bar-chart">
                  {analytics.dau.slice(0, 14).reverse().map((d, i) => {
                    const maxVal = Math.max(...analytics.dau.map(x => x.active_users));
                    const height = maxVal > 0 ? (d.active_users / maxVal) * 120 : 0;
                    return (
                      <div key={i} className="bar-col">
                        <span className="bar-value">{d.active_users}</span>
                        <div className="bar-fill" style={{ height: `${height}px` }} />
                        <span className="bar-date">{new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="no-data-msg">No DAU data yet. IP tracking will populate this.</p>}
            </div>
          </div>

        </div>
      ) : <div className="loading-state">Failed to load analytics</div>}
    </div>
  );

  // ============================================
  // RENDER: LOGS
  // ============================================
  const renderLogs = () => (
    <div className="tab-content">
      <h2 className="tab-title">ADMIN ACTION LOGS</h2>
      {loading ? <div className="loading-state">LOADING...</div> : (
        <div className="logs-list">
          {logs.length === 0 ? (
            <div className="empty-state">
              <p>📋 No admin actions logged yet</p>
              <small>Actions like banning, pinning, featuring will appear here</small>
            </div>
          ) : logs.map(log => (
            <div key={log.id} className="log-row">
              <div className="log-left">
                <span className={`log-badge log-${log.action_type}`}>
                  {log.action_type.toUpperCase()}
                </span>
                <span className="log-admin">by {log.admin_username}</span>
              </div>
              <div className="log-middle">
                <span className="log-target">{log.target_type}: {log.target_id?.slice(0, 8)}...</span>
                {log.details && (
                  <span className="log-details">
                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details).slice(0, 80)}
                  </span>
                )}
              </div>
              <div className="log-right">
                <span className="log-time">{timeAgo(log.created_at)}</span>
                {log.ip_address && <span className="log-ip">{log.ip_address}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="admin-wrap">
      {notification && (
        <div className={`admin-notif ${notification.type}`}>{notification.message}</div>
      )}

      {/* Sidebar */}
      <aside className="admin-side">
        <div className="side-logo">
          <span>ADMIN</span>
        </div>
        <nav className="side-nav">
          {[
            { key: 'dashboard', icon: '📊', label: 'DASHBOARD' },
            { key: 'users', icon: '👥', label: 'USERS' },
            { key: 'confessions', icon: '💬', label: 'CONFESSIONS' },
            { key: 'analytics', icon: '📈', label: 'ANALYTICS' },
            { key: 'logs', icon: '📋', label: 'LOGS' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`side-btn ${activeTab === tab.key ? 'side-btn-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="side-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        <button className="back-btn" onClick={() => window.location.href = '/'}>← BACK TO APP</button>
      </aside>

      {/* Content */}
      <main className="admin-main">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'confessions' && renderConfessions()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'logs' && renderLogs()}
      </main>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-bg" onClick={() => setShowUserModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUserModal(false)}>✕</button>
            <h2>USER DETAILS</h2>

            <div className="modal-grid">
              <div className="modal-field"><b>Username</b> {selectedUser.user.username}</div>
              <div className="modal-field"><b>Email</b> {selectedUser.user.email}</div>
              <div className="modal-field"><b>User #</b> {selectedUser.user.user_number}</div>
              <div className="modal-field"><b>Credits</b> {selectedUser.user.credits}</div>
              <div className="modal-field"><b>Premium</b> {selectedUser.user.is_premium ? '⭐ Yes' : 'No'}</div>
              <div className="modal-field"><b>Banned</b> {selectedUser.user.is_banned ? '🚫 Yes' : 'No'}</div>
              <div className="modal-field"><b>Reg. IP</b> {selectedUser.user.registration_ip || 'N/A'}</div>
              <div className="modal-field"><b>Last IP</b> {selectedUser.user.last_ip || 'N/A'}</div>
              <div className="modal-field"><b>Joined</b> {new Date(selectedUser.user.created_at).toLocaleDateString()}</div>
              <div className="modal-field"><b>Last Login</b> {selectedUser.user.last_login ? new Date(selectedUser.user.last_login).toLocaleDateString() : 'N/A'}</div>
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
              {(!selectedUser.confessions || selectedUser.confessions.length === 0) && <p>No confessions</p>}
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
              {(!selectedUser.activity || selectedUser.activity.length === 0) && <p>No activity logged</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// CONFESSION ROW COMPONENT
// ============================================
function ConfessionRow({ c, onPin, onFeature, onDelete, getMoodColor, timeAgo }) {
  return (
    <div className={`conf-row ${c.is_pinned ? 'conf-pinned' : ''} ${c.is_featured ? 'conf-featured' : ''}`}>
      <div className="conf-left">
        <span className="conf-mood" style={{ background: getMoodColor(c.mood_zone) }}>{c.mood_zone}</span>
        {c.is_pinned && <span className="conf-tag conf-tag-pin">📌 PINNED</span>}
        {c.is_featured && <span className="conf-tag conf-tag-feature">⭐ FEATURED</span>}
        <p className="conf-text">{c.content?.slice(0, 120)}{c.content?.length > 120 ? '...' : ''}</p>
        <div className="conf-meta">
          <span>{c.username} #{c.user_number}</span>
          <span>{timeAgo(c.created_at)}</span>
          <span>❤️{c.heart_count} 👍{c.like_count} 😢{c.cry_count} 😂{c.laugh_count}</span>
        </div>
      </div>
      <div className="conf-actions">
        <button
          className={`conf-btn ${c.is_pinned ? 'conf-btn-active' : ''}`}
          onClick={() => onPin(c.id, c.is_pinned)}
          title={c.is_pinned ? 'Unpin' : 'Pin to top'}
        >
          {c.is_pinned ? '📌 UNPIN' : '📌 PIN'}
        </button>
        <button
          className={`conf-btn ${c.is_featured ? 'conf-btn-gold' : ''}`}
          onClick={() => onFeature(c.id, c.is_featured)}
          title={c.is_featured ? 'Remove feature' : 'Feature this'}
        >
          {c.is_featured ? '⭐ UNFEATURE' : '⭐ FEATURE'}
        </button>
        <button className="conf-btn conf-btn-delete" onClick={() => onDelete(c.id)}>🗑️ DELETE</button>
      </div>
    </div>
  );
}
