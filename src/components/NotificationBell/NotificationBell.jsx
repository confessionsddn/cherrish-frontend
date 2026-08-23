// components/NotificationBell/NotificationBell.jsx
import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../services/api';
import { io } from 'socket.io-client';
import './NotificationBell.css';

const NOTIF_ICONS = {
  reactions: '🔥',
  gift: '🎁',
  theme_unlock: '🎨',
  reply: '💬',
  reply_like: '❤️',
  announcement: '📢',
  poll: '📊',
  premium: '⭐',
  account_status: '🔔'
};

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount();

    // Connect socket for real-time updates
    const socket = io(API_URL, { withCredentials: true });
    socketRef.current = socket;

    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        socket.emit('join_user_room', payload.id);
      } catch (e) {}
    }

    socket.on('new_notification', (notif) => {
      setUnreadCount(prev => prev + 1);
      setNotifications(prev => [notif, ...prev].slice(0, 50));
    });

    socket.on('notification_count', ({ unread_count }) => {
      setUnreadCount(unread_count);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/unread-count`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await res.json();
      if (data.success) setUnreadCount(data.unread_count);
    } catch (e) {}
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications/?limit=50`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await res.json();
      if (data.success) setNotifications(data.notifications);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_URL}/api/notifications/mark-read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {}
  };

  const handleBellClick = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) {
      fetchNotifications();
      if (unreadCount > 0) markAllRead();
    }
  };

  const handleNotifClick = (notif) => {
    const url = notif.data?.url;
    if (url) window.location.href = url;
    setIsOpen(false);
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'now';
    if (m < 60) return `${m}m`;
    if (h < 24) return `${h}h`;
    return `${d}d`;
  };

  return (
    <div className="notif-bell-wrap" ref={dropdownRef}>
      <button className="notif-bell-btn" onClick={handleBellClick} title="Notifications">
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span>NOTIFICATIONS</span>
            {unreadCount > 0 && (
              <button className="notif-mark-read" onClick={markAllRead}>Mark all read</button>
            )}
          </div>

          <div className="notif-dropdown-list">
            {loading ? (
              <div className="notif-loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">
                <span>🔔</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotifClick(n)}
                >
                  <span className="notif-icon">{NOTIF_ICONS[n.type] || '🔔'}</span>
                  <div className="notif-content">
                    <span className="notif-title">{n.title}</span>
                    <span className="notif-message">{n.message}</span>
                  </div>
                  <span className="notif-time">{timeAgo(n.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
