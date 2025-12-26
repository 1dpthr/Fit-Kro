import React, { useEffect, useState, useRef } from 'react';
import { Button } from '../components/Button';
import { ArrowLeft, Send, Bot } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '../utils/supabase/client';
import { toast } from 'sonner';

interface Message {
  messageId: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface CoachScreenProps {
  onBack: () => void;
}

export function CoachScreen({ onBack }: CoachScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  
  useEffect(() => {
    loadChatHistory();
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const loadChatHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/coach/history`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };
  
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = inputMessage;
    setInputMessage('');
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to chat');
        return;
      }
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/coach/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ message: userMessage })
      });
      
      const data = await response.json();
      
      if (data.success && data.messages) {
        setMessages(prev => [...prev, ...data.messages]);
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const starterPrompts = [
    'What should I eat today?',
    'Recommend a workout',
    'How do I lose weight?',
    'I need motivation'
  ];
  
  const selectPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 shadow-xl" style={{ backgroundColor: '#0EA5E9' }}>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-surface-secondary rounded-2xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white">AI Fitness Coach</h1>
            <p className="text-white/80 text-sm">Ask me anything about fitness!</p>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl" style={{ backgroundColor: '#06B6D4' }}>
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-gray-900 mb-4 font-bold">Welcome to AI Coach!</h2>
              <p className="text-gray-700 mb-8 font-medium">
                I'm here to help with workouts, nutrition, and motivation. Try asking:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
                {starterPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectPrompt(prompt)}
                    className="bg-white text-left p-4 rounded-2xl border-2 hover:border-sky-500 hover:shadow-lg transition-all"
                  >
                    <p className="text-gray-900 font-medium">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.messageId}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] md:max-w-[70%] rounded-3xl p-4 ${
                    message.sender === 'user'
                      ? 'text-white'
                      : 'bg-white text-gray-900 border-2'
                  }`}
                  style={message.sender === 'user' ? { backgroundColor: '#0EA5E9' } : {}}
                >
                  {message.sender === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#06B6D4' }}>
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-gray-600 font-medium">AI Coach</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap font-medium">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-white/70' : 'text-gray-600'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-3xl p-4 border-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1 px-6 py-4 rounded-2xl border-2 focus:border-sky-500 focus:outline-none transition-colors disabled:bg-slate-50"
            />
            <Button
              variant="primary"
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              className="px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
