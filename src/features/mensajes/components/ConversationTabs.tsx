import React from 'react';
import './ConversationTabs.css';

type ConversationSection = 'chats' | 'grupos';

interface ConversationTabsProps {
  activeSection: ConversationSection;
  chatsCount: number;
  gruposCount: number;
  onSectionChange: (section: ConversationSection) => void;
}

export const ConversationTabs: React.FC<ConversationTabsProps> = ({
  activeSection,
  chatsCount,
  gruposCount,
  onSectionChange,
}) => {
  return (
    <div className="conversation-tabs">
      <button
        className={`conversation-tab-btn ${activeSection === 'chats' ? 'active' : ''}`}
        onClick={() => onSectionChange('chats')}
      >
        Chats {chatsCount}
      </button>
      <button
        className={`conversation-tab-btn ${activeSection === 'grupos' ? 'active' : ''}`}
        onClick={() => onSectionChange('grupos')}
      >
        Grupos {gruposCount}
      </button>
    </div>
  );
};
