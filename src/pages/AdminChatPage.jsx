// frontend/src/pages/AdminChatPage.jsx
import { useState, useEffect, useRef } from 'react';
import './AdminChatPage.css';

export default function AdminChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin-messages/conversation`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    
    try {
      const response = await fetch(`${API_URL}/api/admin-messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: newMessage.trim()
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNewMessage('');
        loadMessages();
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="chat-page-container">
        <div className="chat-loading">LOADING MESSAGES...</div>
      </div>
    );
  }

  return (
    <div className="chat-page-container">
      {/* Header */}
      <div className="chat-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="chat-header-info">
          <h2>ADMIN SUPPORT</h2>
          <p className="chat-status">Always active • Replies within 24h</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <i className="fas fa-comments"></i>
            <p>NO MESSAGES YET</p>
            <small>Send a message to get started!</small>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-bubble ${msg.sender_type === 'user' ? 'sent' : 'received'}`}
            >
              <div className="message-content">{msg.message}</div>
              <div className="message-time">{formatTime(msg.created_at)}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form className="chat-input-area" onSubmit={sendMessage}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e);
            }
          }}
        />
        <button 
          type="submit" 
          className="send-btn"
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <i className="fas fa-circle-notch fa-spin"></i>
          ) : (
            <i className="fas fa-paper-plane"></i>
          )}
        </button>
      </form>
    </div>
  );
}