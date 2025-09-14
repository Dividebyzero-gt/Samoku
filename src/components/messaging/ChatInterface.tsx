import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Image, X, Clock, Check, CheckCheck } from 'lucide-react';
import { messagingService, Conversation, Message, CreateMessageData } from '../../services/messagingService';
import { useAuth } from '../../contexts/AuthContext';

interface ChatInterfaceProps {
  conversation: Conversation;
  onClose?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversation, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    markMessagesAsRead();
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const conversationMessages = await messagingService.getConversationMessages(conversation.id);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user) return;
    try {
      await messagingService.markMessagesAsRead(conversation.id, user.id);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || sending) return;

    try {
      setSending(true);
      
      const messageData: CreateMessageData = {
        conversationId: conversation.id,
        messageText: newMessage.trim()
      };

      const sentMessage = await messagingService.sendMessage(messageData, user.id);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const isMyMessage = (message: Message): boolean => {
    return message.senderId === user?.id;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {conversation.subject}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>
                with {user?.id === conversation.customerId ? conversation.vendor?.name : conversation.customer?.name}
              </span>
              {conversation.store && (
                <span>• {conversation.store.name}</span>
              )}
              <span className={`px-2 py-1 rounded text-xs ${
                conversation.status === 'open' ? 'bg-green-100 text-green-700' :
                conversation.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {conversation.status}
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Product/Order Context */}
        {(conversation.product || conversation.orderId) && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            {conversation.product && (
              <div className="flex items-center space-x-3">
                <img
                  src={conversation.product.images[0]}
                  alt={conversation.product.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Re: {conversation.product.name}
                  </p>
                  {conversation.orderId && (
                    <p className="text-xs text-gray-600">Order related</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => {
          const isMyMsg = isMyMessage(message);
          
          return (
            <div
              key={message.id}
              className={`flex ${isMyMsg ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${isMyMsg ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    isMyMsg
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.messageText}</p>
                  
                  {/* Attachments */}
                  {message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block text-xs underline ${
                            isMyMsg ? 'text-blue-100' : 'text-blue-600'
                          }`}
                        >
                          📎 Attachment {index + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className={`flex items-center mt-1 space-x-2 ${
                  isMyMsg ? 'justify-end' : 'justify-start'
                }`}>
                  <span className="text-xs text-gray-500">
                    {formatMessageTime(message.createdAt)}
                  </span>
                  {isMyMsg && (
                    <div className="text-gray-400">
                      {message.isRead ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {!isMyMsg && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center order-1 mr-3">
                  {message.sender?.avatarUrl ? (
                    <img
                      src={message.sender.avatarUrl}
                      alt={message.sender.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-600">
                      {message.sender?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {conversation.status === 'open' && (
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Attach file"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {conversation.status === 'closed' && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 text-center">
          <p className="text-sm text-gray-600">This conversation has been closed</p>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;