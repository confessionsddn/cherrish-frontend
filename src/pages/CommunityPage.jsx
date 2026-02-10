import React, { useState } from 'react';
import PollFeed from '../components/CommunityFeed/PollFeed';
import MessageFeed from '../components/CommunityFeed/MessageFeed';
import './CommunityPage.css';

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('polls');

  return (
    <div className="community-page">
      <div className="community-tabs">
        <button
          className={`tab ${activeTab === 'polls' ? 'active' : ''}`}
          onClick={() => setActiveTab('polls')}
        >
          📊 POLLS
        </button>
        <button
          className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          📢 MESSAGES
        </button>
      </div>

      {activeTab === 'polls' && <PollFeed />}
      {activeTab === 'messages' && <MessageFeed />}
    </div>
  );
};

export default CommunityPage;