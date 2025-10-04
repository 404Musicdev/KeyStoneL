import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  MessageSquare, 
  Users, 
  Send,
  Clock,
  Search,
  User
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Messaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.contact.id);
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/messages`);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const response = await axios.get(`${API_BASE}/messages/${contactId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversation) {
      return;
    }
    
    try {
      await axios.post(`${API_BASE}/messages`, {
        recipient_id: activeConversation.contact.id,
        content: newMessage.trim()
      });
      
      setNewMessage('');
      fetchMessages(activeConversation.contact.id);
      fetchConversations(); // Refresh to update last message
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="messaging">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
        <p className="text-slate-400">Communicate with your students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        {/* Conversations List */}
        <Card className="glass-effect border-slate-700 slide-up">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center text-lg">
              <Users className="w-5 h-5 mr-2" />
              Conversations
            </CardTitle>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400 text-sm"
                data-testid="search-conversations-input"
              />
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="max-h-80 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                <div className="space-y-1 p-4 pt-0">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.contact.id}
                      onClick={() => setActiveConversation(conversation)}
                      className={`
                        w-full p-3 rounded-lg text-left transition-all duration-200 border
                        ${activeConversation?.contact.id === conversation.contact.id
                          ? 'bg-blue-600/20 border-blue-500/50 text-white'
                          : 'border-transparent hover:bg-slate-700/50 text-slate-300 hover:text-white'
                        }
                      `}
                      data-testid={`conversation-${conversation.contact.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium truncate">{conversation.contact.name}</p>
                            {conversation.last_message && (
                              <span className="text-xs text-slate-400">
                                {formatTime(conversation.last_message.sent_at)}
                              </span>
                            )}
                          </div>
                          
                          {conversation.last_message && (
                            <p className="text-sm text-slate-400 truncate">
                              {conversation.last_message.sender_id === user?.id ? 'You: ' : ''}
                              {conversation.last_message.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">No conversations</p>
                  <p className="text-slate-500 text-sm">Start a conversation by selecting a student</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {activeConversation ? (
            <Card className="glass-effect border-slate-700 slide-up h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="pb-4 border-b border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      {activeConversation.contact.name}
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-sm">
                      {activeConversation.contact.type === 'student' ? 'Student' : 'Teacher'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              {/* Messages */}
              <CardContent className="flex-1 flex flex-col p-4 min-h-0">
                <div className="flex-1 overflow-y-auto mb-4 space-y-3" data-testid="messages-container">
                  {messages.length > 0 ? (
                    messages.map((message) => {
                      const isSent = message.sender_id === user?.id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                          data-testid={`message-${message.id}`}
                        >
                          <div
                            className={`
                              max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                              ${isSent
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-700 text-slate-200'
                              }
                            `}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${isSent ? 'text-blue-200' : 'text-slate-400'}`}>
                              {formatTime(message.sent_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-400">No messages yet</p>
                        <p className="text-slate-500 text-sm">Start the conversation below</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <form onSubmit={sendMessage} className="flex space-x-2" data-testid="message-form">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-800 border-slate-600 text-white placeholder-slate-400 resize-none min-h-12 max-h-24"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                    data-testid="message-input"
                  />
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    data-testid="send-message-button"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-effect border-slate-700 slide-up h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a Conversation</h3>
                <p className="text-slate-400">Choose a student from the list to start messaging</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;