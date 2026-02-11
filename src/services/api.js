// src/services/api.js
// ============================================
// Global API base URL
// ============================================

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ✅ LOG API URL ON LOAD (for debugging)
console.log('🔧 API_URL configured:', API_URL);
console.log('🔧 Environment:', import.meta.env.MODE);

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  async getCurrentUser() {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (_) {}
      throw new Error(errorData.error || 'Failed to get user');
    }

    return response.json();
  },

  async logout() {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// ============================================
// CONFESSIONS API
// ============================================
export const confessionsAPI = {
  async getAll(params = {}) {
    const url = new URL(`${API_URL}/api/confessions`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch confessions');
    }

    return response.json();
  },

  async create(confession) {
    const formData = new FormData();
    formData.append('content', confession.content);
    formData.append('mood_zone', confession.mood_zone);

    if (confession.audioBlob) {
      formData.append('audio', confession.audioBlob, 'confession.webm');
      if (confession.voice_duration != null) {
        formData.append('voice_duration', confession.voice_duration);
      }
    }

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/api/confessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type; browser will set multipart boundary
      },
      body: formData
    });

    if (!response.ok) {
      let error = {};
      try {
        error = await response.json();
      } catch (_) {}
      throw new Error(error.error || 'Failed to create confession');
    }

    return response.json();
  },

  async react(confessionId, reactionType, action = 'add') {
    const response = await fetch(
      `${API_URL}/api/confessions/${confessionId}/react`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reaction_type: reactionType, action })
      }
    );

    if (!response.ok) {
      let error = {};
      try {
        error = await response.json();
      } catch (_) {}
      throw new Error(error.error || 'Failed to react');
    }

    return response.json();
  },

  async delete(confessionId) {
    const response = await fetch(
      `${API_URL}/api/confessions/${confessionId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete confession');
    }

    return response.json();
  }
};

// ============================================
// PAYMENTS API
// ============================================
export const paymentsAPI = {
  async createOrder(amount) {
    const response = await fetch(`${API_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount })
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    return response.json();
  },

  async verifyPayment(paymentData) {
    const response = await fetch(`${API_URL}/api/payments/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    return response.json();
  }
};

// ============================================
// POLLS API
// ============================================
export const pollsAPI = {
  async getAll(includeExpired = false) {
    const params = includeExpired ? '?includeExpired=true' : '';
    const response = await fetch(`${API_URL}/api/polls${params}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      let error = {};
      try {
        error = await response.json();
      } catch (_) {}
      throw new Error(error.error || 'Failed to fetch polls');
    }

    return response.json();
  },

  async create(pollData) {
    const response = await fetch(`${API_URL}/api/polls/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(pollData)
    });

    if (!response.ok) {
      let error = {};
      try {
        error = await response.json();
      } catch (_) {}
      throw new Error(error.error || 'Failed to create poll');
    }

    return response.json();
  },

  async vote(pollId, optionId) {
    const response = await fetch(`${API_URL}/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ optionId })
    });

    if (!response.ok) {
      let error = {};
      try {
        error = await response.json();
      } catch (_) {}
      throw new Error(error.error || 'Failed to vote');
    }

    return response.json();
  },

  async removeVote(pollId, optionId) {
    const response = await fetch(
      `${API_URL}/api/polls/${pollId}/vote/${optionId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      let error = {};
      try {
        error = await response.json();
      } catch (_) {}
      throw new Error(error.error || 'Failed to remove vote');
    }

    return response.json();
  },

  async pin(pollId, isPinned) {
    const response = await fetch(`${API_URL}/api/polls/${pollId}/pin`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isPinned })
    });

    if (!response.ok) {
      let error = {};
      try {
        error = await response.json();
      } catch (_) {}
      throw new Error(error.error || 'Failed to pin poll');
    }

    return response.json();
  },

  async delete(pollId) {
    const response = await fetch(`${API_URL}/api/polls/${pollId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      let error = {};
      try {
        error = await response.json();
      } catch (_) {}
      throw new Error(error.error || 'Failed to delete poll');
    }

    return response.json();
  },

  async getAnalytics(pollId) {
    const response = await fetch(
      `${API_URL}/api/polls/${pollId}/analytics`,
      {
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      let error = {};
      try {
        error = await response.json();
      } catch (_) {}
      throw new Error(error.error || 'Failed to get analytics');
    }

    return response.json();
  }
};

// ============================================
// MESSAGES API
// ============================================
export const messagesAPI = {
  async getAll() {
    const response = await fetch(`${API_URL}/api/messages`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      let error = {};
      try {
        error = await response.json();
      } catch (_) {}
      throw new Error(error.error || 'Failed to fetch messages');
    }

    return response.json();
  },

  async send(messageData) {
    const response = await fetch(`${API_URL}/api/messages/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData)
    });

    if (!response.ok) {
      let error = {};
      try {
        error = await response.json();
      } catch (_) {}
      throw new Error(error.error || 'Failed to send message');
    }

    return response.json();
  },

  async react(messageId, reactionType) {
    const response = await fetch(
      `${API_URL}/api/messages/${messageId}/react`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reactionType })
      }
    );

    if (!response.ok) {
      let error = {};
      try {
        error = await response.json();
      } catch (_) {}
      throw new Error(error.error || 'Failed to react');
    }

    return response.json();
  },

  async pin(messageId, isPinned) {
    const response = await fetch(`${API_URL}/api/messages/${messageId}/pin`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isPinned })
    });

    if (!response.ok) {
      let error = {};
      try {
        error = await response.json();
      } catch (_) {}
      throw new Error(error.error || 'Failed to pin message');
    }

    return response.json();
  },

  async delete(messageId) {
    const response = await fetch(`${API_URL}/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      let error = {};
      try {
        error = await response.json();
      } catch (_) {}
      throw new Error(error.error || 'Failed to delete message');
    }

    return response.json();
  }
};

// ============================================
// DEFAULT EXPORT + API_URL + getAuthHeaders
// ============================================
const api = {
  auth: authAPI,
  confessions: confessionsAPI,
  payments: paymentsAPI,
  polls: pollsAPI,
  messages: messagesAPI
};

export default api;
export { getAuthHeaders };
