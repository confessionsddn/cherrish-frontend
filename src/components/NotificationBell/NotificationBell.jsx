// components/NotificationBell/NotificationBell.jsx
import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../services/api';
import { io } from 'socket.io-client';
import { playNotifFeedback, isNotifMuted, setNotifMuted } from '../../services/notifFeedback';
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [toast, setToast] = useState(null); // { title, message } | null
  const [muted, setMuted] = useState(isNotifMuted());
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);
  const toastTimerRef = useRef(null);

  const PAGE_SIZE = 20;

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

      // In-app feedback: sound + vibration (respects mute), and a transient
      // toast so the user sees it without opening the dropdown.
      playNotifFeedback();
      setToast({ title: notif.title, message: notif.message, data: notif.data });
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(null), 5000);
    });

    socket.on('notification_count', ({ unread_count }) => {
      setUnreadCount(unread_count);
    });

    return () => {
      socket.disconnect();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleToastClick = () => {
    const url = toast?.data?.url;
    setToast(null);
    if (url) window.location.href = url;
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setNotifMuted(next);
  };

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
      const res = await fetch(`${API_URL}/api/notifications/?limit=${PAGE_SIZE}&offset=0`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setHasMore(data.notifications.length === PAGE_SIZE);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `${API_URL}/api/notifications/?limit=${PAGE_SIZE}&offset=${notifications.length}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } }
      );
      const data = await res.json();
      if (data.success) {
        // De-dup against any live socket inserts that may overlap the page.
        setNotifications(prev => {
          const seen = new Set(prev.map(n => n.id));
          const fresh = data.notifications.filter(n => !seen.has(n.id));
          return [...prev, ...fresh];
        });
        setHasMore(data.notifications.length === PAGE_SIZE);
      }
    } catch (e) {
      console.error('Failed to load more notifications:', e);
    } finally {
      setLoadingMore(false);
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

  const markOneRead = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await res.json();
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      if (data.success && typeof data.unread_count === 'number') {
        setUnreadCount(data.unread_count);
      }
    } catch (e) {
      console.error('Failed to mark notification read:', e);
    }
  };

  const deleteOne = async (id) => {
    // Optimistic removal for snappy UX; reconcile count from server response.
    const prevList = notifications;
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await res.json();
      if (data.success && typeof data.unread_count === 'number') {
        setUnreadCount(data.unread_count);
      } else if (!res.ok) {
        setNotifications(prevList); // rollback on failure
      }
    } catch (e) {
      console.error('Failed to delete notification:', e);
      setNotifications(prevList); // rollback on failure
    }
  };

  const handleNotifClick = (notif) => {
    if (!notif.is_read) markOneRead(notif.id);
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

      {toast && (
        <div className="notif-toast" onClick={handleToastClick} role="alert">
          <span className="notif-toast-icon">{NOTIF_ICONS[toast.data?.type] || '🔔'}</span>
          <div className="notif-toast-body">
            <span className="notif-toast-title">{toast.title}</span>
            <span className="notif-toast-message">{toast.message}</span>
          </div>
          <button
            className="notif-toast-close"
            aria-label="Dismiss"
            onClick={(e) => { e.stopPropagation(); setToast(null); }}
          >
            ✕
          </button>
        </div>
      )}

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span>NOTIFICATIONS</span>
            <div className="notif-header-actions">
              <button
                className="notif-mute-btn"
                onClick={toggleMute}
                title={muted ? 'Unmute sound' : 'Mute sound'}
                aria-label={muted ? 'Unmute notification sound' : 'Mute notification sound'}
              >
                <i className={`fas ${muted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
              </button>
              {unreadCount > 0 && (
                <button className="notif-mark-read" onClick={markAllRead}>Mark all read</button>
              )}
            </div>
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
                  <button
                    className="notif-dismiss"
                    aria-label="Delete notification"
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); deleteOne(n.id); }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}

            {!loading && hasMore && (
              <button className="notif-load-more" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
