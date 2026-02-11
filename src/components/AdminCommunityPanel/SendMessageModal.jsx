// frontend/src/components/AdminCommunityPanel/SendMessageModal.jsx

import React, { useState } from 'react';
import { API_URL,messagesAPI } from '../../services/api';
import './AdminCommunityPanel.css';

const SendMessageModal = ({ onClose, onMessageSent }) => {
  const [messageText, setMessageText] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!messageText.trim()) {
      setError('Message text is required');
      return;
    }

    try {
      setLoading(true);

      const response = await messagesAPI.send({
        messageText: messageText.trim(),
        isPinned
      });

      const newMessage = response.message || response.data?.message || response;
      onMessageSent(newMessage);
      onClose();

    } catch (error) {
      console.error('Send message error:', error);
      setError(error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content send-message-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📢 SEND COMMUNITY MESSAGE</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>MESSAGE *</label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Announce something to all users..."
              maxLength={2000}
              rows={6}
              required
            />
            <small>{messageText.length}/2000 characters</small>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
              />
              <span>Pin this message (appears at the top)</span>
            </label>
          </div>

          <div className="message-preview">
            <div className="preview-label">PREVIEW:</div>
            <div className="preview-content">
              <div className="preview-badge">ADMIN</div>
              <p>{messageText || 'Your message will appear here...'}</p>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'SENDING...' : 'SEND MESSAGE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendMessageModal; 