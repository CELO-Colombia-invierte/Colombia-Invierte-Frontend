import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { ChatUser } from '@/types';
import { HomeHeader } from '@/components/home';
import { SearchBar, ChatList } from '@/components/chat';
import './MensajesPage.css';

const MensajesPage: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');

  const [chatUsers] = useState<ChatUser[]>([
    {
      id: '1',
      name: 'Azunyan U. Wu',
      location: 'País, provincia',
      isOnline: true,
      lastMessageTime: '12:30 PM',
      unreadCount: 8,
      avatar: '',
    },
    {
      id: '2',
      name: 'Azunyan U. Wu',
      location: 'País, provincia',
      isOnline: true,
      lastMessageTime: '12:30 PM',
      unreadCount: 8,
      avatar: '',
    },
    {
      id: '3',
      name: 'Azunyan U. Wu',
      location: 'País, provincia',
      isOnline: true,
      lastMessageTime: '12:30 PM',
      unreadCount: 8,
      avatar: '',
    },
    {
      id: '4',
      name: 'Azunyan U. Wu',
      location: 'País, provincia',
      isOnline: true,
      lastMessageTime: '12:30 PM',
      unreadCount: 8,
      avatar: '',
    },
    {
      id: '5',
      name: 'Azunyan U. Wu',
      location: 'País, provincia',
      isOnline: true,
      lastMessageTime: '12:30 PM',
      unreadCount: 8,
      avatar: '',
    },
    {
      id: '6',
      name: 'Azunyan U. Wu',
      location: 'País, provincia',
      isOnline: true,
      lastMessageTime: '12:30 PM',
      unreadCount: 8,
      avatar: '',
    },
    {
      id: '7',
      name: 'Azunyan U. Wu',
      location: 'País, provincia',
      isOnline: true,
      lastMessageTime: '12:30 PM',
      unreadCount: 8,
      avatar: '',
    },
    {
      id: '8',
      name: 'Azunyan U. Wu',
      location: 'País, provincia',
      isOnline: true,
      lastMessageTime: '12:30 PM',
      unreadCount: 8,
      avatar: '',
    },
  ]);

  const filteredUsers = chatUsers.filter((chatUser) =>
    chatUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserClick = (chatUser: ChatUser) => {
    history.push(`/mensajes/${chatUser.id}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="mensajes-page-content">
        <HomeHeader userName={user?.name || 'Carolina Machado'} />
        <SearchBar value={searchQuery} onChange={handleSearchChange} />
        <ChatList users={filteredUsers} onUserClick={handleUserClick} />
      </IonContent>
    </IonPage>
  );
};

export default MensajesPage;
