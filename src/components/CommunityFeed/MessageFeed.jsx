// ============================================
// MESSAGE FEED WITH REACTIONS (NEO-BRUTALIST)
// File: frontend/src/components/CommunityFeed/MessageFeed.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { messagesAPI } from '../../services/api';
import './PollFeed.css'; // Updated CSS file import

const REACTION_EMOJIS = {
  thumbs_up: '👍',
  thumbs_down: '👎',
  heart: '❤️',
  fire: '🔥',
  celebrate: '🎉',
};

const MessageFeed = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reactingMessageId, setReactingMessageId] = useState(null);

  useEffect(() => {
    fetchMessages();

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', { withCredentials: true });

    socket.on('message_broadcast', (newMessage) => setMessages((prev) => [newMessage, ...prev]));
    socket.on('reaction_added', ({ messageId, reactions }) => {
      setMessages((prev) => prev.map((msg) => msg.id === messageId ? { ...msg, reactions } : msg));
    });
    socket.on('reaction_removed', ({ messageId, reactions }) => {
      setMessages((prev) => prev.map((msg) => msg.id === messageId ? { ...msg, reactions } : msg));
    });
    socket.on('message_pinned', (updatedMessage) => {
      setMessages((prev) => prev.map((msg) => msg.id === updatedMessage.id ? { ...msg, is_pinned: updatedMessage.is_pinned } : msg));
    });

    return () => socket.disconnect();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getAll();
      const data = response.messages || response.data?.messages || response;
      setMessages(data);
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (messageId, reactionType) => {
    try {
      setReactingMessageId(messageId);
      const response = await messagesAPI.react(messageId, reactionType);
      const action = response.action || response.data?.action;
      const reactions = response.reactions || response.data?.reactions || {};

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          const prevUserReactions = msg.user_reactions || [];
          const newUserReactions = action === 'added' ? [...prevUserReactions, reactionType] : prevUserReactions.filter((r) => r !== reactionType);
          const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

          return { ...msg, reactions, user_reactions: newUserReactions, total_reactions: totalReactions };
        })
      );
    } catch (error) {
      console.error('Reaction error:', error);
    } finally {
      setReactingMessageId(null);
    }
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const posted = new Date(timestamp);
    const diffMs = now - posted;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'JUST NOW';
    if (diffMins < 60) return `${diffMins} MINUTE${diffMins === 1 ? '' : 'S'} AGO`;
    if (diffHours < 24) return `${diffHours} HOUR${diffHours === 1 ? '' : 'S'} AGO`;
    if (diffDays < 7) return `${diffDays} DAY${diffDays === 1 ? '' : 'S'} AGO`;
    return posted.toLocaleDateString();
  };

  if (loading) return <div className="message-feed"><div className="loading">LOADING MESSAGES...</div></div>;

  if (messages.length === 0) return (
    <div className="message-feed">
      <div className="empty-state">
        <h3>SILENCE 🤫</h3>
        <p>No admin announcements yet. Stay tuned!</p>
      </div>
    </div>
  );

  return (
    <div className="message-feed">
      <div className="feed-header">
        <h2>📢 THE MEGAPHONE</h2>
        <p className="feed-subtitle">// OFFICIAL ADMIN BROADCASTS</p>
      </div>

      <div className="messages-list">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-card ${msg.is_pinned ? 'pinned' : ''}`}>
            {msg.is_pinned && <div className="pin-badge">📌 PINNED</div>}
            
            <div className="message-header">
              <div className="message-author">
                <span className="admin-badge">ADMIN</span>
                <span className="username">@{msg.created_by_username}</span>
              </div>
              <div className="message-timestamp">{getRelativeTime(msg.created_at)}</div>
            </div>

            <div className="message-content">
              <p>{msg.message_text}</p>
            </div>

            <div className="reactions-section">
              <div className="reaction-buttons">
                {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => {
                  const isReacted = msg.user_reactions?.includes(type);
                  const count = msg.reactions?.[type] || 0;

                  return (
                    <button
                      key={type}
                      className={`reaction-btn ${isReacted ? 'active' : ''}`}
                      onClick={() => handleReaction(msg.id, type)}
                      disabled={reactingMessageId === msg.id}
                      title={type.replace('_', ' ')}
                    >
                      <span className="emoji">{emoji}</span>
                      {count > 0 && <span className="count">{count}</span>}
                    </button>
                  );
                })}
              </div>
              
              {msg.total_reactions > 0 && (
                <div className="reaction-summary">
                  {msg.total_reactions} {msg.total_reactions === 1 ? 'reaction' : 'reactions'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageFeed;