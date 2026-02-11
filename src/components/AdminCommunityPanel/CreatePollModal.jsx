// frontend/src/components/AdminCommunityPanel/CreatePollModal.jsx

import React, { useState } from 'react';
import { API_URL,pollsAPI } from '../../services/api';
import './AdminCommunityPanel.css';

const CreatePollModal = ({ onClose, onPollCreated }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addOption = () => {
    if (options.length < 12) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!question.trim()) {
      setError('Question is required');
      return;
    }

    const validOptions = options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      setError('At least 2 options required');
      return;
    }

    try {
      setLoading(true);

      const response = await pollsAPI.create({
        question: question.trim(),
        options: validOptions,
        allowMultipleAnswers,
        isPinned,
        expiresAt: expiresAt || null
      });

      const newPoll = response.poll || response.data?.poll || response;
      onPollCreated(newPoll);
      onClose();

    } catch (error) {
      console.error('Create poll error:', error);
      setError(error.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-poll-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 CREATE POLL</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>POLL QUESTION *</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What's your favorite mood zone?"
              maxLength={500}
              required
            />
            <small>{question.length}/500 characters</small>
          </div>

          <div className="form-group">
            <label>OPTIONS (2-12) *</label>
            {options.map((option, index) => (
              <div key={index} className="option-input-group">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={200}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="btn-remove-option"
                    onClick={() => removeOption(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {options.length < 12 && (
              <button
                type="button"
                className="btn-add-option"
                onClick={addOption}
              >
                + ADD OPTION
              </button>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={allowMultipleAnswers}
                onChange={(e) => setAllowMultipleAnswers(e.target.checked)}
              />
              <span>Allow multiple answers (users can vote for more than one option)</span>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
              />
              <span>Pin this poll (appears at the top)</span>
            </label>
          </div>

          <div className="form-group">
            <label>EXPIRATION DATE (optional)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <small>Leave empty for no expiration</small>
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
              {loading ? 'CREATING...' : 'CREATE POLL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;