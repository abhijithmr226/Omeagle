import { useState, useCallback, useRef } from 'react';
import type { ChatMessage } from '../types/chat';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStrangerTyping, setIsStrangerTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addSystemMessage = useCallback((text: string) => {
    setMessages(prev => [...prev, {
      id: `sys-${Date.now()}-${Math.random()}`,
      sender: 'system',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  }, []);

  const addMessage = useCallback((sender: 'you' | 'stranger', text: string) => {
    setMessages(prev => [...prev, {
      id: `${sender}-${Date.now()}-${Math.random()}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setIsStrangerTyping(false);
  }, []);

  const handleStrangerTyping = useCallback(() => {
    setIsStrangerTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsStrangerTyping(false), 3000);
  }, []);

  const handleStrangerStopTyping = useCallback(() => {
    setIsStrangerTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, []);

  return {
    messages, isStrangerTyping,
    addSystemMessage, addMessage, clearMessages,
    handleStrangerTyping, handleStrangerStopTyping,
  };
}
