import React, { useState } from 'react';
import { MessageSquare, Filter, Archive, Star } from 'lucide-react';
import ConversationList from '../../components/messaging/ConversationList';
import ChatInterface from '../../components/messaging/ChatInterface';
import { Conversation } from '../../services/messagingService';
import { useAuth } from '../../contexts/AuthContext';

const MessagingPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'open' | 'closed'>('all');

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <div className="h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex h-full">
        {/* Conversation List */}
        <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Messages
              </h2>
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <Filter className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'open', label: 'Open' },
                { key: 'closed', label: 'Closed' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversation?.id}
            />
          </div>
        </div>

        {/* Chat Interface */}
        <div className="hidden md:flex md:w-2/3 flex-col">
          {selectedConversation ? (
            <ChatInterface 
              conversation={selectedConversation}
              onClose={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Chat Overlay */}
      {selectedConversation && (
        <div className="md:hidden fixed inset-0 bg-white z-50">
          <ChatInterface 
            conversation={selectedConversation}
            onClose={() => setSelectedConversation(null)}
          />
        </div>
      )}
    </div>
  );
};

export default MessagingPage;