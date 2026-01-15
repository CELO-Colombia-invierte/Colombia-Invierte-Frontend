import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { ChatUser } from '@/types';
import { Message } from '@/models/Message.model';
import { ChatHeader, MessageList, MessageInput } from '@/components/chat';
import { useAuth } from '@/hooks/use-auth';
import './ChatConversationPage.css';

const ChatConversationPage: React.FC = () => {
  const history = useHistory();
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();

  const [currentUser] = useState<ChatUser>({
    id: userId,
    name: 'Azunyan U. Wu',
    location: 'País, provincia',
    isOnline: true,
    avatar: '',
  });

  const [messages, setMessages] = useState<Message[]>([
    new Message({
      id: '1',
      conversationId: 'conv-1',
      senderId: userId,
      text: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.',
      createdAt: new Date(Date.now() - 3600000),
    }),
    new Message({
      id: '2',
      conversationId: 'conv-1',
      senderId: user?.id || 'me',
      text: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour,',
      createdAt: new Date(Date.now() - 3000000),
    }),
  ]);

  const handleBack = () => {
    history.goBack();
  };

  const handleMenuClick = () => {
    console.log('Menu clicked');
  };

  const handleSendMessage = (text: string) => {
    if (!user) return;

    const newMessage = new Message({
      id: Date.now().toString(),
      conversationId: 'conv-1',
      senderId: user.id,
      text,
      createdAt: new Date(),
    });
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
          <MessageList messages={messages} currentUserId={user?.id || ''} />
          <MessageInput onSend={handleSendMessage} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ChatConversationPage;
