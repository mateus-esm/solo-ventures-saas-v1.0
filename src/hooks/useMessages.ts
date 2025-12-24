import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Message {
  id: string;
  lead_id: string;
  sender_type: 'customer' | 'ai' | 'agent' | 'system';
  sender_id: string | null;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  read_at: string | null;
  external_id: string | null;
}

export function useMessages(leadId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch messages for a lead
  const fetchMessages = useCallback(async () => {
    if (!leadId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as Message[]) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  // Send a new message
  const sendMessage = useCallback(async (content: string, type: string = 'text', mediaUrl?: string) => {
    if (!leadId || !content.trim()) return null;

    try {
      const { data, error } = await supabase.functions.invoke('send-chat-message', {
        body: {
          lead_id: leadId,
          content: content.trim(),
          type,
          media_url: mediaUrl,
          sender_id: user?.id
        }
      });

      if (error) throw error;
      return data as Message;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
      return null;
    }
  }, [leadId, user?.id]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!leadId) return;

    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('lead_id', leadId)
        .is('read_at', null)
        .eq('sender_type', 'customer');
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [leadId]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!leadId) return;

    const channel = supabase
      .channel(`messages-${leadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `lead_id=eq.${leadId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  return {
    messages,
    isLoading,
    sendMessage,
    markAsRead,
    refetch: fetchMessages
  };
}
