import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { useParams } from 'react-router-dom';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon,
  FaceSmileIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojis = ['😀', '😊', '👍', '❤️', '😎', '🔥', '💪', '✨', '👌', '🙏', '😍', '🤩', '💯', '🎉', '✅'];

  useEffect(() => {
    loadChatData();
    scrollToBottom();
  }, [appointmentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async () => {
    try {
      // Load appointment details
      const appointmentResponse = await fetch(`/api/appointments/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (appointmentResponse.ok) {
        const appointmentData = await appointmentResponse.json();
        setAppointment(appointmentData);
      }

      // Load chat messages
      const messagesResponse = await fetch(`/api/appointments/${appointmentId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
      toast.error('Fehler beim Laden der Chat-Daten');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    const messageText = newMessage;
    setNewMessage('');

    try {
      const response = await fetch(`/api/appointments/${appointmentId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: messageText,
          type: 'text'
        })
      });

      if (response.ok) {
        const newMessageData = await response.json();
        setMessages(prev => [...prev, newMessageData]);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Fehler beim Senden der Nachricht');
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('appointmentId', appointmentId);

      try {
        const response = await fetch(`/api/appointments/${appointmentId}/messages/file`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (response.ok) {
          const newMessageData = await response.json();
          setMessages(prev => [...prev, newMessageData]);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('Fehler beim Hochladen der Datei');
      }
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Heute';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Gestern';
    } else {
      return date.toLocaleDateString('de-DE');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-4xl mx-auto">
          {appointment && (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">
                  {appointment.salon_name?.[0] || 'S'}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Chat: {appointment.salon_name}
                </h1>
                <p className="text-gray-400">
                  Termin am {new Date(appointment.date).toLocaleDateString('de-DE')} um {appointment.time}
                </p>
              </div>
              <div className="ml-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  appointment.status === 'confirmed' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                  appointment.status === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                  'bg-gray-500 bg-opacity-20 text-gray-400'
                }`}>
                  {appointment.status === 'confirmed' ? 'Bestätigt' : 
                   appointment.status === 'pending' ? 'Wartend' : 'Abgeschlossen'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaceSmileIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Noch keine Nachrichten
              </h3>
              <p className="text-gray-400">
                Beginne die Unterhaltung mit deinem Stylist!
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const showDate = index === 0 || formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);
              const isFromUser = message.sender_id === user.id;

              return (
                <div key={message.id}>
                  {/* Date Divider */}
                  {showDate && (
                    <div className="flex items-center justify-center my-6">
                      <div className="bg-gray-800 px-4 py-2 rounded-full">
                        <span className="text-gray-400 text-sm">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md ${isFromUser ? 'ml-12' : 'mr-12'}`}>
                      <div
                        className={`p-4 rounded-2xl ${
                          isFromUser
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                            : 'bg-gray-800 text-white'
                        }`}
                      >
                        {message.type === 'text' && (
                          <p className="break-words">{message.message}</p>
                        )}
                        
                        {message.type === 'image' && (
                          <div>
                            <img
                              src={message.file_url}
                              alt="Shared image"
                              className="rounded-lg max-w-full h-auto"
                            />
                            {message.message && (
                              <p className="mt-2 break-words">{message.message}</p>
                            )}
                          </div>
                        )}
                        
                        {message.type === 'file' && (
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <PaperClipIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium">{message.file_name}</p>
                              <p className="text-xs opacity-70">{message.file_size}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex items-center mt-1 text-xs text-gray-400 ${
                        isFromUser ? 'justify-end' : 'justify-start'
                      }`}>
                        <span>{formatTime(message.timestamp)}</span>
                        {isFromUser && (
                          <div className="ml-2">
                            {message.status === 'sent' && <ClockIcon className="w-3 h-3" />}
                            {message.status === 'delivered' && <CheckIcon className="w-3 h-3" />}
                            {message.status === 'read' && <CheckIcon className="w-3 h-3 text-blue-400" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-gray-800 border-t border-gray-700 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <div className="bg-gray-900 rounded-2xl border border-gray-600 focus-within:border-yellow-500 transition-colors">
                <div className="flex items-center p-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                  >
                    <PaperClipIcon className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                  >
                    <FaceSmileIcon className="w-5 h-5" />
                  </button>
                  
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nachricht eingeben..."
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 resize-none max-h-32 px-3 py-2"
                    rows={1}
                    style={{ minHeight: '40px' }}
                  />
                </div>
                
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-600 rounded-xl p-3 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">Emojis</span>
                      <button
                        onClick={() => setShowEmojiPicker(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-8 gap-2">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => addEmoji(emoji)}
                          className="text-xl hover:bg-gray-700 rounded p-1 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="btn-primary p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="spinner w-5 h-5"></div>
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;