import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { chatApiService } from '@/services/chat';
import { Conversation } from '@/models/Conversation.model';
import { Message } from '@/models/Message.model';
import {
  GroupChatHeader,
  GroupMessageList,
  MessageInput,
  GroupOptionsModal,
  ChatInfoModal,
} from '@/components/chat';
import { useAuth } from '@/hooks/use-auth';
import { useChatWebSocket } from '@/hooks/use-chat-websocket';
import { MessageMapper } from '@/mappers/MessageMapper';
import { NewMessageSocketEvent } from '@/types/chat';
import './ChatConversationPage.css';

interface TypingUser {
  id: string;
  name: string;
}

const ChatConversationPage: React.FC = () => {
  const history = useHistory();
  const { userId: conversationId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingUsersTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const markAsReadRef = useRef<((conversationId: string) => void) | null>(null);

  const handleNewMessage = useCallback(
    (event: NewMessageSocketEvent) => {
      if (event.conversationId === conversationId) {
        const messageDto = event.message as any;
        const newMessage = MessageMapper.fromDto(messageDto);

        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });

        setTypingUsers((prev) =>
          prev.filter((u) => u.id !== messageDto.sender_user_id)
        );

        if (markAsReadRef.current) {
          markAsReadRef.current(conversationId);
        }

        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    },
    [conversationId]
  );

  const handleUserTyping = useCallback(
    (event: { conversationId: string; userId: string; userName: string }) => {
      if (
        event.conversationId === conversationId &&
        event.userId !== user?.id
      ) {
        setTypingUsers((prev) => {
          if (prev.some((u) => u.id === event.userId)) {
            return prev;
          }
          return [
            ...prev,
            { id: event.userId, name: event.userName || 'Usuario' },
          ];
        });

        const existingTimeout = typingUsersTimeoutRef.current.get(event.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        const timeout = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u.id !== event.userId));
          typingUsersTimeoutRef.current.delete(event.userId);
        }, 3000);

        typingUsersTimeoutRef.current.set(event.userId, timeout);
      }
    },
    [conversationId, user?.id]
  );

  const handleUserStoppedTyping = useCallback(
    (event: { conversationId: string; userId: string }) => {
      if (event.conversationId === conversationId) {
        setTypingUsers((prev) => prev.filter((u) => u.id !== event.userId));

        const existingTimeout = typingUsersTimeoutRef.current.get(event.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          typingUsersTimeoutRef.current.delete(event.userId);
        }
      }
    },
    [conversationId]
  );

  const {
    connected,
    sendMessage: sendWsMessage,
    typing: wsTyping,
    stopTyping: wsStopTyping,
    joinConversation,
    markAsRead,
  } = useChatWebSocket({
    onNewMessage: handleNewMessage,
    onUserTyping: handleUserTyping,
    onUserStoppedTyping: handleUserStoppedTyping,
    onConnected: () => {
      if (conversationId) {
        joinConversation(conversationId);
      }
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
  });

  useEffect(() => {
    markAsReadRef.current = markAsRead;
  }, [markAsRead]);

  useEffect(() => {
    if (conversationId) {
      fetchConversationAndMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    if (connected && conversationId) {
      joinConversation(conversationId);
      markAsRead(conversationId);
    }
  }, [connected, conversationId, joinConversation, markAsRead]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingUsersTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
      typingUsersTimeoutRef.current.clear();
    };
  }, []);

  const fetchConversationAndMessages = async () => {
    try {
      setLoading(true);
      const conversations = await chatApiService.getConversations();
      const currentConversation = conversations.find(
        (c) => c.id === conversationId
      );
      if (currentConversation) {
        setConversation(currentConversation);
      }
      const msgs = await chatApiService.getMessages(conversationId);
      setMessages(msgs);
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    contentRef.current?.scrollToBottom(300);
  };

  const handleBack = () => {
    history.goBack();
  };

  const handleMenuClick = () => {
    setShowOptionsModal(true);
  };

  const handleHeaderClick = () => {
    setShowInfoModal(true);
  };

  const handleSendMessage = async (text: string) => {
    if (!user || !text.trim() || sending) return;

    try {
      setSending(true);

      if (connected) {
        sendWsMessage(conversationId, text);
      } else {
        const newMessage = await chatApiService.sendMessage(
          conversationId,
          text
        );
        setMessages((prev) => [...prev, newMessage]);
      }

      wsStopTyping(conversationId);

      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = useCallback(() => {
    if (!connected || !conversationId) return;

    wsTyping(conversationId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      wsStopTyping(conversationId);
    }, 2000);
  }, [connected, conversationId, wsTyping, wsStopTyping]);

  const handleNameChanged = () => {
    fetchConversationAndMessages();
  };

  const handleLeaveGroup = () => {
    history.replace('/mensajes');
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="chat-conversation-page">
          <div className="chat-loading">
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const isGroup = conversation?.isGroup() || false;
  const title = conversation?.getTitle(user?.id || '') || 'Conversacion';
  const subtitle = isGroup
    ? conversation?.members
      .map((m) => m.user?.getDisplayName() || m.user?.username)
      .filter(Boolean)
      .join(', ')
    : undefined;

  // Verificar si el usuario es admin del grupo
  const isAdmin =
    conversation?.members.find((m) => m.userId === user?.id)?.role === 'admin';

  return (
    <IonPage>
      <IonContent
        ref={contentRef}
        fullscreen
        className="chat-conversation-page"
      >
        <div className="chat-conversation-container">
          <GroupChatHeader
            title={title}
            subtitle={subtitle}
            isGroup={isGroup}
            avatarUrl={conversation?.getAvatarUrl(user?.id || '')}
            initials={conversation?.getAvatarInitials(user?.id || '') || 'GR'}
            membersCount={conversation?.members.length}
            onBack={handleBack}
            onMenuClick={handleMenuClick}
            onHeaderClick={handleHeaderClick}
          />
          <GroupMessageList
            messages={messages}
            currentUserId={user?.id || ''}
            isGroup={isGroup}
            conversation={conversation}
            typingUsers={typingUsers}
          />
          <MessageInput
            onSend={handleSendMessage}
            onTyping={handleTyping}
            disabled={sending}
          />
        </div>

        <GroupOptionsModal
          isOpen={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
          conversationId={conversationId}
          conversationTitle={title}
          isAdmin={isAdmin}
          onNameChanged={handleNameChanged}
          onLeave={handleLeaveGroup}
        />

        <ChatInfoModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          conversation={conversation}
          currentUserId={user?.id || ''}
        />
      </IonContent>
    </IonPage>
  );
};

export default ChatConversationPage;
