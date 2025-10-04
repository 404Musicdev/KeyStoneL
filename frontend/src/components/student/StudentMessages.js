import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { 
  MessageSquare, 
  Send,
  User,
  Clock
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StudentMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (teacher) {
      fetchMessages(teacher.id);
    }
  }, [teacher]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/messages`);
      const conversationsData = response.data;
      setConversations(conversationsData);
      
      // For students, there should be only one conversation with their teacher
      if (conversationsData.length > 0) {
        setTeacher(conversationsData[0].contact);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (teacherId) => {
    try {
      const response = await axios.get(`${API_BASE}/messages/${teacherId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !teacher) {
      return;
    }
    
    try {
      await axios.post(`${API_BASE}/messages`, {
        recipient_id: teacher.id,
        content: newMessage.trim()
      });
      
      setNewMessage('');
      fetchMessages(teacher.id);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="student-messages">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
        <p className="text-slate-400">Communicate with your teacher</p>
      </div>

      {teacher ? (
        <Card className="glass-effect border-slate-700 slide-up h-96 flex flex-col">
          {/* Chat Header */}
          <CardHeader className="pb-4 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">
                  {teacher.name}
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Your Teacher
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
                    <p className="text-slate-500 text-sm">Start a conversation with your teacher</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <form onSubmit={sendMessage} className="flex space-x-2" data-testid="message-form">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message to your teacher..."
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
        <Card className="glass-effect border-slate-700 slide-up">
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Teacher Assigned</h3>
            <p className="text-slate-400">
              You don't have a teacher assigned yet. Contact your administrator if this seems incorrect.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card className="glass-effect border-slate-700 slide-up">
        <CardHeader>
          <CardTitle className="text-white text-lg">Communication Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-slate-300">Ask questions about assignments or concepts you don't understand</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-slate-300">Share your progress or any challenges you're facing</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-slate-300">Be respectful and clear in your communication</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-slate-300">Check your messages regularly for updates from your teacher</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMessages;