import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Clock, Eye } from 'lucide-react';
import { messagingService, Conversation } from '../../services/messagingService';
import { useAuth } from '../../contexts/AuthContext';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedConversationId
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const userConversations = await messagingService.getUserConversations(user.id);
      setConversations(userConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUnreadCount = (conversation: Conversation): number => {
    return user?.id === conversation.customerId 
      ? conversation.customerUnreadCount 
      : conversation.vendorUnreadCount;
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return user?.id === conversation.customerId 
      ? conversation.vendor 
      : conversation.customer;
  };

  const formatLastMessageTime = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
        <p className="text-gray-600">Start a conversation by contacting a vendor</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => {
        const otherParticipant = getOtherParticipant(conversation);
        const unreadCount = getUnreadCount(conversation);
        const isSelected = selectedConversationId === conversation.id;

        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              isSelected ? 'bg-blue-50 border-r-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                {otherParticipant?.avatarUrl ? (
                  <img
                    src={otherParticipant.avatarUrl}
                    alt={otherParticipant.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-gray-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {otherParticipant?.name || 'Unknown User'}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                        {unreadCount}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatLastMessageTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 truncate mt-1">
                  {conversation.subject}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    {conversation.store && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {conversation.store.name}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      conversation.status === 'open' ? 'bg-green-100 text-green-700' :
                      conversation.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {conversation.status}
                    </span>
                  </div>

                  {conversation.priority !== 'normal' && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      conversation.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      conversation.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {conversation.priority}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;