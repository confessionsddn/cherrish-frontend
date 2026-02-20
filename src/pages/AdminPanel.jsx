// COMPLETE ADMIN PANEL WITH ALL FEATURES INCLUDING REPORTS
// frontend/src/pages/AdminPanel.jsx

import { useState, useEffect } from 'react';
import './AdminPanel.css';
import { API_URL } from '../services/api';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [pendingConfessions, setPendingConfessions] = useState([]);
  const [reports, setReports] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      if (activeTab === 'dashboard') {
        const res = await fetch(`${API_URL}/api/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setStats(data);
      }
      
      if (activeTab === 'users') {
        const res = await fetch(`${API_URL}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(data.users || []);
      }
      
      if (activeTab === 'moderation') {
        const res = await fetch(`${API_URL}/api/admin/confessions/pending`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setPendingConfessions(data.confessions || []);
      }
      
      if (activeTab === 'reports') {
        const res = await fetch(`${API_URL}/api/admin/reports`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setReports(data.reports || []);
      }
      
      if (activeTab === 'access') {
        const res = await fetch(`${API_URL}/api/admin/access-requests`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setAccessRequests(data.requests || []);
      }
      
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // BAN USER
  const handleBan = async (userId, duration) => {
    if (!confirm(`Ban this user for ${duration}?`)) return;
    
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration })
      });
      
      const data = await res.json();
      if (data.success) {
        alert('✅ User banned successfully!');
        loadData();
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      alert('❌ Failed to ban user');
    }
  };

  // DELETE USER
  const handleDeleteUser = async (userId) => {
    if (!confirm('⚠️ PERMANENTLY DELETE this user?\n\nThis cannot be undone!')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      const data = await res.json();
      if (data.success) {
        alert('✅ User deleted!');
        loadData();
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      alert('❌ Failed to delete user');
    }
  };

  // APPROVE/REJECT CONFESSION
  const handleConfessionAction = async (confessionId, action) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/confessions/${confessionId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      const data = await res.json();
      if (data.success) {
        alert(`✅ Confession ${action}d!`);
        loadData();
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      alert('❌ Failed to ' + action);
    }
  };

  // HANDLE REPORT
  const handleReport = async (reportId, action) => {
    const actionText = action === 'dismiss' ? 'dismiss this report' : 'REMOVE the confession';
    if (!confirm(`Are you sure you want to ${actionText}?`)) return;
    
    try {
      const res = await fetch(`${API_URL}/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });
      
      const data = await res.json();
      if (data.success) {
        alert(`✅ Report ${action === 'dismiss' ? 'dismissed' : 'resolved and confession removed'}!`);
        loadData();
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      alert('❌ Failed to resolve report');
    }
  };

  // GENERATE ACCESS CODES
  const handleGenerateCodes = async () => {
    const count = prompt('How many access codes to generate? (1-1000)');
    if (!count || count < 1 || count > 1000) return;
    
    try {
      const res = await fetch(`${API_URL}/api/admin/codes/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ count: parseInt(count) })
      });
      
      const data = await res.json();
      if (data.success) {
        const codesText = data.codes.join('\n');
        const blob = new Blob([codesText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `access_codes_${Date.now()}.txt`;
        a.click();
        alert(`✅ Generated ${count} codes! Downloaded as text file.`);
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      alert('❌ Failed to generate codes');
    }
  };

  // APPROVE/REJECT ACCESS REQUEST
  const handleAccessRequest = async (requestId, action) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/access-requests/${requestId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      const data = await res.json();
      if (data.success) {
        alert(`✅ Request ${action}d!`);
        loadData();
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      alert('❌ Failed to ' + action);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🛡️ ADMIN PANEL</h1>
        <button onClick={() => window.location.href = '/'} className="btn-back">
          ← BACK TO APP
        </button>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''} 
          onClick={() => setActiveTab('dashboard')}
        >
          📊 DASHBOARD
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          👥 USERS
        </button>
        <button 
          className={activeTab === 'moderation' ? 'active' : ''} 
          onClick={() => setActiveTab('moderation')}
        >
          ⚖️ MODERATION
        </button>
        <button 
          className={activeTab === 'reports' ? 'active' : ''} 
          onClick={() => setActiveTab('reports')}
        >
          🚩 REPORTS ({reports.filter(r => r.status === 'pending').length})
        </button>
        <button 
          className={activeTab === 'access' ? 'active' : ''} 
          onClick={() => setActiveTab('access')}
        >
          🔑 ACCESS CODES
        </button>
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="loading">LOADING...</div>
        ) : (
          <>
            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div className="dashboard-grid">
                <div className="stat-card">
                  <h3>👥 TOTAL USERS</h3>
                  <p className="stat-number">{stats.total_users || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>💬 TOTAL CONFESSIONS</h3>
                  <p className="stat-number">{stats.total_confessions || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>⏳ PENDING MODERATION</h3>
                  <p className="stat-number">{stats.pending_confessions || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>🚩 PENDING REPORTS</h3>
                  <p className="stat-number">{stats.pending_reports || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>💰 CREDITS IN CIRCULATION</h3>
                  <p className="stat-number">{stats.total_credits || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>⭐ PREMIUM USERS</h3>
                  <p className="stat-number">{stats.premium_users || 0}</p>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="users-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>USERNAME</th>
                      <th>EMAIL</th>
                      <th>#</th>
                      <th>CREDITS</th>
                      <th>PREMIUM</th>
                      <th>BANNED</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>#{user.user_number}</td>
                        <td>{user.credits}</td>
                        <td>{user.is_premium ? '⭐ YES' : 'NO'}</td>
                        <td>{user.is_banned ? '🚫 YES' : 'NO'}</td>
                        <td>
                          <button onClick={() => handleBan(user.id, '3d')} className="btn-sm">
                            BAN 3D
                          </button>
                          <button onClick={() => handleBan(user.id, '7d')} className="btn-sm">
                            BAN 7D
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} className="btn-sm btn-danger">
                            DELETE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* MODERATION TAB */}
            {activeTab === 'moderation' && (
              <div className="moderation-list">
                {pendingConfessions.length === 0 ? (
                  <p className="empty-state">✅ No pending confessions!</p>
                ) : (
                  pendingConfessions.map(confession => (
                    <div key={confession.id} className="moderation-card">
                      <div className="confession-header">
                        <span className="mood-badge">{confession.mood_zone}</span>
                        <span className="user-info">
                          {confession.username} #{confession.user_number}
                        </span>
                      </div>
                      <p className="confession-content">{confession.content}</p>
                      {confession.audio_url && <p className="audio-badge">🎤 HAS VOICE NOTE</p>}
                      <div className="moderation-actions">
                        <button 
                          onClick={() => handleConfessionAction(confession.id, 'approve')}
                          className="btn-approve"
                        >
                          ✅ APPROVE
                        </button>
                        <button 
                          onClick={() => handleConfessionAction(confession.id, 'reject')}
                          className="btn-reject"
                        >
                          ❌ REJECT
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* REPORTS TAB */}
            {activeTab === 'reports' && (
              <div className="reports-list">
                {reports.filter(r => r.status === 'pending').length === 0 ? (
                  <p className="empty-state">✅ No pending reports!</p>
                ) : (
                  reports.filter(r => r.status === 'pending').map(report => (
                    <div key={report.id} className="report-card">
                      <div className="report-header">
                        <span className="report-reason">🚩 {report.reason.toUpperCase()}</span>
                        <span className="report-date">{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="report-details">
                        <p><strong>Reported by:</strong> {report.reporter_username} #{report.reporter_user_number}</p>
                        <p><strong>Confession author:</strong> {report.confession_username} #{report.confession_user_number}</p>
                        {report.details && <p><strong>Details:</strong> {report.details}</p>}
                      </div>

                      <div className="reported-confession">
                        <strong>Reported Confession:</strong>
                        <p className="confession-text">{report.confession_content}</p>
                        <span className="mood-badge">{report.confession_mood_zone}</span>
                      </div>

                      <div className="report-actions">
                        <button 
                          onClick={() => handleReport(report.id, 'dismiss')}
                          className="btn-dismiss"
                        >
                          ✅ DISMISS REPORT (Keep Confession)
                        </button>
                        <button 
                          onClick={() => handleReport(report.id, 'remove')}
                          className="btn-remove"
                        >
                          🗑️ REMOVE CONFESSION
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ACCESS CODES TAB */}
            {activeTab === 'access' && (
              <div className="access-section">
                <div className="access-actions">
                  <button onClick={handleGenerateCodes} className="btn-generate">
                    🎫 GENERATE ACCESS CODES
                  </button>
                </div>

                <h3>📧 PENDING ACCESS REQUESTS</h3>
                {accessRequests.filter(r => r.status === 'pending').length === 0 ? (
                  <p className="empty-state">✅ No pending requests!</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>EMAIL</th>
                        <th>REQUESTED</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accessRequests.filter(r => r.status === 'pending').map(req => (
                        <tr key={req.id}>
                          <td>{req.email}</td>
                          <td>{new Date(req.created_at).toLocaleDateString()}</td>
                          <td>
                            <button 
                              onClick={() => handleAccessRequest(req.id, 'approve')}
                              className="btn-sm btn-success"
                            >
                              ✅ APPROVE
                            </button>
                            <button 
                              onClick={() => handleAccessRequest(req.id, 'reject')}
                              className="btn-sm btn-danger"
                            >
                              ❌ REJECT
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
