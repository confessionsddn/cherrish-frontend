// frontend/src/pages/AdminPanel.jsx - ULTIMATE ADMIN PANEL
import { useState, useEffect } from 'react';
import { API_URL } from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  // ============================================
  // STATE
  // ============================================
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [confessions, setConfessions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // Pagination & Filters
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [totalPages, setTotalPages] = useState(1);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Selected user details
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // ============================================
  // API CALLS
  // ============================================
  
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/admin/users?page=${userPage}&search=${userSearch}&filter=${userFilter}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } }
      );
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchConfessions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/confessions?sort=recent&limit=100`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await response.json();
      setConfessions(data.confessions || []);
    } catch (error) {
      console.error('Fetch confessions error:', error);
    }
  };
  
  const fetchAnalytics = async () => {
    try {
      const [dauRes, moodRes, topUsersRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/analytics/dau?days=30`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        }),
        fetch(`${API_URL}/api/admin/analytics/mood-zones`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        }),
        fetch(`${API_URL}/api/admin/analytics/top-users`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        })
      ]);
      
      const dau = await dauRes.json();
      const mood = await moodRes.json();
      const topUsers = await topUsersRes.json();
      
      setAnalytics({
        dau: dau.data || [],
        moodZones: mood.data || [],
        topUsers: topUsers.users || []
      });
    } catch (error) {
      console.error('Fetch analytics error:', error);
    }
  };
  
  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/logs?limit=100`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Fetch logs error:', error);
    }
  };
  
  // ============================================
  // USER ACTIONS
  // ============================================
  
  const banUser = async (userId, duration, reason) => {
    if (!confirm(`Ban user for ${duration === 'permanent' ? 'permanently' : duration + ' days'}?`)) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration, reason })
      });
      
      const data = await response.json();
      if (data.success) {
        showNotification('User banned successfully', 'success');
        fetchUsers();
      } else {
        showNotification(data.error, 'error');
      }
    } catch (error) {
      showNotification('Failed to ban user', 'error');
    }
  };
  
  const unbanUser = async (userId) => {
    if (!confirm('Unban this user?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/unban`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      const data = await response.json();
      if (data.success) {
        showNotification('User unbanned successfully', 'success');
        fetchUsers();
      }
    } catch (error) {
      showNotification('Failed to unban user', 'error');
    }
  };
  
  const deleteUser = async (userId) => {
    if (!confirm('DELETE this user permanently? This cannot be undone!')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      const data = await response.json();
      if (data.success) {
        showNotification('User deleted successfully', 'success');
        fetchUsers();
      }
    } catch (error) {
      showNotification('Failed to delete user', 'error');
    }
  };
  
  const viewUserDetails = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedUser(data);
        setShowUserModal(true);
      }
    } catch (error) {
      showNotification('Failed to load user details', 'error');
    }
  };
  
  // ============================================
  // CONFESSION ACTIONS
  // ============================================
  
  const pinConfession = async (confessionId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/confessions/${confessionId}/pin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      const data = await response.json();
      if (data.success) {
        showNotification('Confession pinned!', 'success');
        fetchConfessions();
      } else {
        showNotification(data.error || data.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to pin confession', 'error');
    }
  };
  
  const unpinConfession = async (confessionId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/confessions/${confessionId}/unpin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      const data = await response.json();
      if (data.success) {
        showNotification('Confession unpinned!', 'success');
        fetchConfessions();
      }
    } catch (error) {
      showNotification('Failed to unpin confession', 'error');
    }
  };
  
  const featureConfession = async (confessionId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/confessions/${confessionId}/feature`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      const data = await response.json();
      if (data.success) {
        showNotification('Confession featured!', 'success');
        fetchConfessions();
      }
    } catch (error) {
      showNotification('Failed to feature confession', 'error');
    }
  };
  
  const deleteConfession = async (confessionId) => {
    if (!confirm('Delete this confession?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/confessions/${confessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      const data = await response.json();
      if (data.success) {
        showNotification('Confession deleted!', 'success');
        fetchConfessions();
      }
    } catch (error) {
      showNotification('Failed to delete confession', 'error');
    }
  };
  
  // ============================================
  // UI HELPERS
  // ============================================
  
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  // ============================================
  // EFFECTS
  // ============================================
  
  useEffect(() => {
    fetchStats();
    fetchConfessions();
  }, []);
  
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab, userPage, userSearch, userFilter]);
  
  // ============================================
  // RENDER: DASHBOARD TAB
  // ============================================
  
  const renderDashboard = () => (
    <div className="admin-dashboard">
      <h2>DASHBOARD</h2>
      
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.total_users}</div>
            <div className="stat-label">TOTAL USERS</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-value">{stats.total_confessions}</div>
            <div className="stat-label">CONFESSIONS</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-value">{stats.active_users_24h}</div>
            <div className="stat-label">ACTIVE (24H)</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{stats.premium_users}</div>
            <div className="stat-label">PREMIUM</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-value">{stats.total_reactions}</div>
            <div className="stat-label">REACTIONS</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">{stats.credits_in_circulation}</div>
            <div className="stat-label">CREDITS</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎁</div>
            <div className="stat-value">{stats.total_gifts}</div>
            <div className="stat-label">GIFTS</div>
          </div>
          
          <div className="stat-card alert">
            <div className="stat-icon">🚫</div>
            <div className="stat-value">{stats.banned_users}</div>
            <div className="stat-label">BANNED</div>
          </div>
        </div>
      )}
    </div>
  );
  
  // ============================================
  // RENDER: USERS TAB
  // ============================================
  
  const renderUsers = () => (
    <div className="admin-users">
      <div className="users-header">
        <h2>USER MANAGEMENT</h2>
        
        <div className="users-controls">
          <input
            type="text"
            placeholder="SEARCH USERS..."
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              setUserPage(1);
            }}
            className="search-input"
          />
          
          <select
            value={userFilter}
            onChange={(e) => {
              setUserFilter(e.target.value);
              setUserPage(1);
            }}
            className="filter-select"
          >
            <option value="all">ALL USERS</option>
            <option value="premium">PREMIUM</option>
            <option value="banned">BANNED</option>
            <option value="active">ACTIVE (7D)</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">LOADING...</div>
      ) : (
        <>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>USERNAME</th>
                  <th>EMAIL</th>
                  <th>CREDITS</th>
                  <th>STATUS</th>
                  <th>ACTIVITY</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={user.is_banned ? 'banned-row' : ''}>
                    <td>#{user.user_number}</td>
                    <td>
                      {user.username}
                      {user.is_premium && <span className="badge premium">⭐</span>}
                      {user.is_admin && <span className="badge admin">👑</span>}
                    </td>
                    <td>{user.email}</td>
                    <td>{user.credits}</td>
                    <td>
                      {user.is_banned ? (
                        <span className="status banned">BANNED</span>
                      ) : user.is_premium ? (
                        <span className="status premium">PREMIUM</span>
                      ) : (
                        <span className="status free">FREE</span>
                      )}
                    </td>
                    <td>
                      {user.confession_count} posts<br/>
                      {user.reaction_count} reactions
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => viewUserDetails(user.id)}
                          className="btn-view"
                        >
                          VIEW
                        </button>
                        
                        {!user.is_banned ? (
                          <button 
                            onClick={() => {
                              const duration = prompt('Ban duration (3, 7, or permanent):');
                              if (duration) {
                                const reason = prompt('Reason:') || 'No reason provided';
                                banUser(user.id, duration, reason);
                              }
                            }}
                            className="btn-ban"
                          >
                            BAN
                          </button>
                        ) : (
                          <button 
                            onClick={() => unbanUser(user.id)}
                            className="btn-unban"
                          >
                            UNBAN
                          </button>
                        )}
                        
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="btn-delete"
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="pagination">
            <button 
              onClick={() => setUserPage(p => Math.max(1, p - 1))}
              disabled={userPage === 1}
            >
              PREV
            </button>
            <span>PAGE {userPage} / {totalPages}</span>
            <button 
              onClick={() => setUserPage(p => Math.min(totalPages, p + 1))}
              disabled={userPage === totalPages}
            >
              NEXT
            </button>
          </div>
        </>
      )}
    </div>
  );
  
  // Continued in next part...
  
  return (
    <div className="admin-panel">
      {/* Notification */}
      {notification && (
        <div className={`admin-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h1>ADMIN</h1>
        </div>
        
        <nav className="admin-nav">
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
            className={activeTab === 'confessions' ? 'active' : ''}
            onClick={() => setActiveTab('confessions')}
          >
            💬 CONFESSIONS
          </button>
          <button 
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            📈 ANALYTICS
          </button>
          <button 
            className={activeTab === 'logs' ? 'active' : ''}
            onClick={() => setActiveTab('logs')}
          >
            📋 LOGS
          </button>
        </nav>
        
        <button 
          className="back-to-app"
          onClick={() => window.location.href = '/'}
        >
          ← BACK TO APP
        </button>
      </div>
      
      {/* Main content */}
      <div className="admin-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'confessions' && <div>CONFESSIONS (Rendering...)</div>}
        {activeTab === 'analytics' && <div>ANALYTICS (Rendering...)</div>}
        {activeTab === 'logs' && <div>LOGS (Rendering...)</div>}
      </div>
      
      {/* User details modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowUserModal(false)}>✕</button>
            <h2>USER DETAILS</h2>
            <div className="user-details">
              <p><strong>Username:</strong> {selectedUser.user.username}</p>
              <p><strong>Email:</strong> {selectedUser.user.email}</p>
              <p><strong>User #:</strong> {selectedUser.user.user_number}</p>
              <p><strong>Credits:</strong> {selectedUser.user.credits}</p>
              <p><strong>Registration IP:</strong> {selectedUser.user.registration_ip}</p>
              <p><strong>Last IP:</strong> {selectedUser.user.last_ip}</p>
              
              <h3>RECENT ACTIVITY</h3>
              <div className="activity-list">
                {selectedUser.activity.slice(0, 10).map((log, i) => (
                  <div key={i} className="activity-item">
                    {log.action_type} - {new Date(log.created_at).toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
