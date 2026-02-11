// ============================================
// USER POLL VIEW (Read-Only with Voting)
// File: frontend/src/components/CommunityFeed/PollFeed.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { API_URL,pollsAPI } from '../../services/api';
import './PollFeed.css';

const PollFeed = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingPollId, setVotingPollId] = useState(null);

  useEffect(() => {
    fetchPolls();
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', { withCredentials: true });

    socket.on('poll_created', (newPoll) => setPolls(prev => [newPoll, ...prev]));
    socket.on('vote_cast', ({ pollId, updatedPoll }) => {
      setPolls(prev => prev.map(poll => poll.id === pollId ? { ...poll, ...updatedPoll } : poll));
    });
    socket.on('poll_pinned', (updatedPoll) => {
      setPolls(prev => prev.map(poll => poll.id === updatedPoll.id ? { ...poll, is_pinned: updatedPoll.is_pinned } : poll));
    });

    return () => socket.disconnect();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await pollsAPI.getAll(false);
      setPolls(response.polls || response.data?.polls || response);
    } catch (error) {
      console.error('Fetch polls error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId, optionId) => {
    try {
      setVotingPollId(pollId);
      const response = await pollsAPI.vote(pollId, optionId);
      const updatedPoll = response.poll || response.data?.poll || response;
      setPolls(prev => prev.map(poll => poll.id === pollId ? { ...poll, ...updatedPoll, user_voted_options: [...(poll.user_voted_options || []), optionId] } : poll));
    } catch (error) {
      alert(error.message || 'Failed to vote');
    } finally {
      setVotingPollId(null);
    }
  };

  const handleRemoveVote = async (pollId, optionId) => {
    try {
      setVotingPollId(pollId);
      await pollsAPI.removeVote(pollId, optionId);
      fetchPolls(); // Simple refetch to ensure accuracy
    } catch (error) {
      alert(error.message || 'Failed to remove vote');
    } finally {
      setVotingPollId(null);
    }
  };

  if (loading) return <div className="poll-feed"><div className="loading">LOADING...</div></div>;

  if (polls.length === 0) return (
    <div className="poll-feed">
      <div className="empty-state">
        <h3>GHOST TOWN 👻</h3>
        <p>No polls yet. Be the first to start a riot!</p>
      </div>
    </div>
  );

  return (
    <div className="poll-feed">
      <div className="feed-header">
        <h2>🗳️ PUBLIC OPINION</h2>
        <p className="feed-subtitle">// VOICE OF THE PEOPLE</p>
      </div>

      <div className="polls-list">
        {polls.map(poll => {
          const userHasVoted = poll.user_voted_options && poll.user_voted_options.length > 0;
          const isPollExpired = poll.expires_at && new Date(poll.expires_at) < new Date();

          return (
            <div key={poll.id} className={`poll-card ${poll.is_pinned ? 'pinned' : ''}`}>
              {poll.is_pinned && <div className="pin-badge">📌 PINNED</div>}
              {!userHasVoted && !isPollExpired && <div className="new-badge">VOTE NOW</div>}

              <div className="poll-question">
                <h3>{poll.question}</h3>
                {poll.created_by_is_admin && <span className="admin-badge">ADMIN POST</span>}
              </div>

              <div className="poll-meta-info">
                <span>{poll.total_votes} VOTES</span>
                {poll.allow_multiple_answers && <span className="multiple-badge">MULTI-SELECT</span>}
                {isPollExpired && <span className="expired-badge">CLOSED</span>}
              </div>

              <div className="poll-options">
                {poll.options.map(option => {
                  const isVoted = poll.user_voted_options?.includes(option.id);
                  const percentage = poll.total_votes > 0 ? ((option.vote_count / poll.total_votes) * 100).toFixed(1) : 0;

                  return (
                    <button
                      key={option.id}
                      className={`poll-option ${isVoted ? 'voted' : ''} ${isPollExpired ? 'disabled' : ''}`}
                      onClick={() => {
                        if (isPollExpired) return;
                        isVoted ? handleRemoveVote(poll.id, option.id) : handleVote(poll.id, option.id);
                      }}
                      disabled={votingPollId === poll.id || isPollExpired}
                    >
                      {/* Progress Bar Background */}
                      {userHasVoted && (
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${percentage}%` }} />
                        </div>
                      )}

                      <div className="option-content">
                        <div className="option-text">
                          {isVoted && <span className="check-mark">✓</span>}
                          {option.option_text}
                        </div>
                        {userHasVoted && <div className="option-percentage">{percentage}%</div>}
                      </div>

                      {userHasVoted && <div className="vote-count">{option.vote_count} votes</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PollFeed;