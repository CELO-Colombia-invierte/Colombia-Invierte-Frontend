import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { ChatUser, Message } from '@/types';
import {
  ChatHeader,
  MessageList,
  MessageInput,
} from '@/components/chat';
import './ChatConversationPage.css';

const ChatConversationPage: React.FC = () => {
  const history = useHistory();
  const { userId } = useParams<{ userId: string }>();

  // En producción, estos datos vendrían de una API
  const [currentUser] = useState<ChatUser>({
    id: userId,
    name: 'Azunyan U. Wu',
    location: 'País, provincia',
    isOnline: true,
    avatar: '',
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.',
      timestamp: '6.30 pm',
      isMine: false,
      userId: userId,
    },
    {
      id: '2',
      text: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour,',
      timestamp: '6.34 pm',
      isMine: true,
      userId: 'me',
    },
  ]);

  const handleBack = () => {
    history.goBack();
  };

  const handleMenuClick = () => {
    console.log('Menu clicked');
  };

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).toLowerCase(),
      isMine: true,
      userId: 'me',
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="chat-conversation-page">
        <div className="chat-conversation-container">
          <ChatHeader
            user={currentUser}
            onBack={handleBack}
            onMenuClick={handleMenuClick}
          />
          <MessageList messages={messages} />
          <MessageInput onSend={handleSendMessage} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ChatConversationPage;
