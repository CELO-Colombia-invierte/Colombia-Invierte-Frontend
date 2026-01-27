import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { chatApiService } from '@/services/chat';
import { Conversation } from '@/models/Conversation.model';
import { HomeHeader } from '@/components/home';
import { SearchBar } from '@/components/chat';
import { ConversationList } from '@/components/chat/ConversationList';
import './MensajesPage.css';

const MensajesPage: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await chatApiService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;
    const title = conversation.getTitle(user?.id || '');
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleConversationClick = (conversation: Conversation) => {
    history.push(`/mensajes/${conversation.id}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="mensajes-page-content">
        <HomeHeader userName={user?.getDisplayName() || 'Usuario'} />
        <SearchBar value={searchQuery} onChange={handleSearchChange} />
        
        {loading ? (
          <div className="mensajes-loading">
            <IonSpinner name="crescent" />
          </div>
        ) : (
          <ConversationList 
            conversations={filteredConversations} 
            currentUserId={user?.id || ''}
            onConversationClick={handleConversationClick} 
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default MensajesPage;
