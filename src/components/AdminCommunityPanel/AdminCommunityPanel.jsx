// frontend/src/components/AdminCommunityPanel/AdminCommunityPanel.jsx

import React, { useState, useEffect } from 'react';
import {API_URL, pollsAPI, messagesAPI } from '../../services/api';
import CreatePollModal from './CreatePollModal';
import SendMessageModal from './SendMessageModal';
import './AdminCommunityPanel.css';

const AdminCommunityPanel = () => {
  const [polls, setPolls] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('polls'); // 'polls' or 'messages'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [pollsRes, messagesRes] = await Promise.all([
  pollsAPI.getAll(true),
  messagesAPI.getAll(),
]);
const msgs = (messagesRes.messages || messagesRes.data?.messages || messagesRes).map(m => ({
  ...m,
  reactions: m.reactions || {
    thumbs_up: 0,
    thumbs_down: 0,
    heart: 0,
    fire: 0,
    celebrate: 0,
  },
}));

setMessages(msgs);

      // Adjust according to your backend response shape
      setPolls(pollsRes.polls || pollsRes.data?.polls || []);
      setMessages(messagesRes.messages || messagesRes.data?.messages || []);

    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePollCreated = (newPoll) => {
    setPolls([newPoll, ...polls]);
    setShowPollModal(false);
  };

  const handleMessageSent = (newMessage) => {
    setMessages([newMessage, ...messages]);
    setShowMessageModal(false);
  };

  const togglePinPoll = async (pollId, currentPinStatus) => {
    try {
      await pollsAPI.pin(pollId, !currentPinStatus);
      setPolls(polls.map(poll =>
        poll.id === pollId ? { ...poll, is_pinned: !currentPinStatus } : poll
      ));
    } catch (error) {
      console.error('Pin error:', error);
      alert('Failed to pin/unpin poll');
    }
  };

  const deletePoll = async (pollId) => {
    if (!window.confirm('Delete this poll? This cannot be undone.')) return;

    try {
      await pollsAPI.delete(pollId);
      setPolls(polls.filter(poll => poll.id !== pollId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete poll');
    }
  };

  const togglePinMessage = async (messageId, currentPinStatus) => {
    try {
      await messagesAPI.pin(messageId, !currentPinStatus);
      setMessages(messages.map(msg =>
        msg.id === messageId ? { ...msg, is_pinned: !currentPinStatus } : msg
      ));
    } catch (error) {
      console.error('Pin error:', error);
      alert('Failed to pin/unpin message');
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message? This cannot be undone.')) return;

    try {
      await messagesAPI.delete(messageId);
      setMessages(messages.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete message');
    }
  };

  if (loading) {
    return (
      <div className="admin-community-panel">
        <div className="loading">LOADING COMMUNITY PANEL...</div>
      </div>
    );
  }


  return (
    <div className="admin-community-panel">
      <div className="panel-header">
        <h1>COMMUNITY MANAGEMENT</h1>
        <div className="action-buttons">
          <button 
            className="btn-create-poll" 
            onClick={() => setShowPollModal(true)}
          >
            📊 CREATE POLL
          </button>
          <button 
            className="btn-send-message" 
            onClick={() => setShowMessageModal(true)}
          >
            📢 SEND MESSAGE
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'polls' ? 'active' : ''}`}
          onClick={() => setActiveTab('polls')}
        >
          POLLS ({polls.length})
        </button>
        <button
          className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          MESSAGES ({messages.length})
        </button>
      </div>

      {activeTab === 'polls' && (
        <div className="polls-section">
          {polls.length === 0 ? (
            <div className="empty-state">
              <p>NO POLLS YET</p>
              <button onClick={() => setShowPollModal(true)}>
                CREATE FIRST POLL
              </button>
            </div>
          ) : (
            <div className="polls-list">
              {polls.map(poll => (
                <div key={poll.id} className="poll-card">
                  <div className="poll-header">
                    <div className="poll-title">
                      {poll.is_pinned && <span className="pin-badge">📌 PINNED</span>}
                      <h3>{poll.question}</h3>
                    </div>
                    <div className="poll-actions">
                      <button
                        className="btn-pin"
                        onClick={() => togglePinPoll(poll.id, poll.is_pinned)}
                        title={poll.is_pinned ? 'Unpin' : 'Pin'}
                      >
                        {poll.is_pinned ? '📌' : '📍'}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deletePoll(poll.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="poll-stats">
                    <span>Total Votes: <strong>{poll.total_votes}</strong></span>
                    <span>Options: <strong>{poll.options.length}</strong></span>
                    <span>Multiple Answers: <strong>{poll.allow_multiple_answers ? 'YES' : 'NO'}</strong></span>
                  </div>

                  <div className="poll-options">
                    {poll.options.map(option => {
                      const percentage = poll.total_votes > 0 
                        ? ((option.vote_count / poll.total_votes) * 100).toFixed(1)
                        : 0;
                      
                      return (
                        <div key={option.id} className="option-analytics">
                          <div className="option-text">{option.option_text}</div>
                          <div className="option-stats">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="option-percentage">{percentage}%</span>
                            <span className="option-votes">({option.vote_count} votes)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="poll-meta">
                    <small>
                      Created: {new Date(poll.created_at).toLocaleString()}
                      {poll.expires_at && ` | Expires: ${new Date(poll.expires_at).toLocaleString()}`}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="messages-section">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>NO MESSAGES YET</p>
              <button onClick={() => setShowMessageModal(true)}>
                SEND FIRST MESSAGE
              </button>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map(msg => (
                <div key={msg.id} className="message-card">
                  <div className="message-header">
                    <div className="message-title">
                      {msg.is_pinned && <span className="pin-badge">📌 PINNED</span>}
                      <span className="admin-badge">ADMIN</span>
                    </div>
                    <div className="message-actions">
                      <button
                        className="btn-pin"
                        onClick={() => togglePinMessage(msg.id, msg.is_pinned)}
                        title={msg.is_pinned ? 'Unpin' : 'Pin'}
                      >
                        {msg.is_pinned ? '📌' : '📍'}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deleteMessage(msg.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="message-content">
                    <p>{msg.message_text}</p>
                  </div>

                  <div className="message-reactions">
                  <div className="reaction-item">
                    <span>👍</span>
                    <span>{msg.reactions?.thumbs_up ?? 0}</span>
                  </div>
                  <div className="reaction-item">
                    <span>👎</span>
                    <span>{msg.reactions?.thumbs_down ?? 0}</span>
                  </div>
                  <div className="reaction-item">
                    <span>❤️</span>
                    <span>{msg.reactions?.heart ?? 0}</span>
                  </div>
                  <div className="reaction-item">
                    <span>🔥</span>
                    <span>{msg.reactions?.fire ?? 0}</span>
                  </div>
                  <div className="reaction-item">
                    <span>🎉</span>
                    <span>{msg.reactions?.celebrate ?? 0}</span>
                  </div>
                </div>


                  <div className="message-meta">
                    <small>
                      Sent: {new Date(msg.created_at).toLocaleString()}
                      {' '} | Total Reactions: {msg.total_reactions}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showPollModal && (
        <CreatePollModal
          onClose={() => setShowPollModal(false)}
          onPollCreated={handlePollCreated}
        />
      )}

      {showMessageModal && (
        <SendMessageModal
          onClose={() => setShowMessageModal(false)}
          onMessageSent={handleMessageSent}
        />
      )}
    </div>
  );
};

export default AdminCommunityPanel;