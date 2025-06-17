import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { connectToChatRoom, disconnectChatRoom } from '@/redux/slices/sliceWebSocket';
import { useGetMessagesQuery, useSendMessageMutation } from '@/redux/api/chatAPI';
import './ChatPanel.css';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

const ChatPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // RTK Query хуки
  const { data: messages = [], refetch } = useGetMessagesQuery(undefined, {
    pollingInterval: 0, // Отключаем polling, так как используем WebSocket
    refetchOnMountOrArgChange: true, // Обновляем при монтировании
  });
  const [sendMessage] = useSendMessageMutation();

  useEffect(() => {
    if (isOpen && user?.id) {
      // Подключаемся к WebSocket для получения real-time сообщений
      dispatch(connectToChatRoom(user.id))
        .then((room: any) => {
          // Подписываемся на новые сообщения
          room.onMessage('message', () => {
            // При получении нового сообщения обновляем список
            refetch();
          });
        })
        .catch(console.error);

      return () => {
        dispatch(disconnectChatRoom());
      };
    }
  }, [isOpen, user?.id, dispatch, refetch]);

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id) return;

    try {
      await sendMessage({
        text: newMessage,
        sender: user.nikName || 'Anonymous',
        timestamp: new Date().toISOString(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
      <div className="chat-header">
        <h3>Chat</h3>
        <button onClick={onClose}>×</button>
      </div>
      <div className="chat-messages">
        {messages.map((message: Message) => (
          <div key={message.id} className={`message ${message.sender === user?.nikName ? 'own' : ''}`}>
            <span className="sender">{message.sender}:</span>
            <span className="text">{message.text}</span>
            <span className="timestamp">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatPanel;
