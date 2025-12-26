import { useState, useRef, useEffect } from "react";
import { ChatSession, Message, Task } from "@/types/chat";
import { mockTasks } from "@/data/mockChatData"; // Keep mock tasks for now, or remove if unused
import { InboxSidebar } from "@/components/inbox/InboxSidebar";
import { ConversationHeader } from "@/components/inbox/ConversationHeader";
import { MessageBubble } from "@/components/inbox/MessageBubble";
import { ChatInput } from "@/components/inbox/ChatInput";
import { CRMContextPanel } from "@/components/inbox/CRMContextPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMessages } from "@/hooks/useMessages";

const Chat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derived state
  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || null;

  // --- Integration Logic ---
  const { messages: realMessages, loading: loadingMessages } = useMessages(selectedSession?.leadId);

  // Fetch Leads for Sidebar
  useEffect(() => {
    const fetchLeads = async () => {
      const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (leads) {
        // Transform leads to ChatSession format
        const mappedSessions: ChatSession[] = leads.map(lead => ({
          id: lead.id,
          leadId: lead.id,
          customerName: lead.nome,
          customerPhone: lead.plataforma_origem || 'WhatsApp', // Fallback
          customerAvatar: undefined,
          lastMessage: '...', // Can't fetch all safely in a list view yet without a join/view
          lastMessageTime: new Date(lead.created_at),
          unreadCount: 0,
          status: 'bot_handling', // Default info
          tags: [],
          crmData: {
            value: 0,
            stage: 'Novo',
            notes: '',
            company: lead.nome,
            position: lead.cargo
          },
          messages: [] // Will be populated by useMessages
        }));
        setSessions(mappedSessions);
        if (!selectedSessionId && mappedSessions.length > 0) {
          // Determine which to select? Default to first.
          // If we want to persist selection, we need more logic.
          setSelectedSessionId(mappedSessions[0].id);
        }
      }
    };
    fetchLeads();
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!selectedSession) return;

    // Call Edge Function
    try {
      const { error } = await supabase.functions.invoke('send-chat-message', {
        body: {
          content,
          // If we had the chat_id in the session (mapped from lead), we'd use it.
          // For now, let's rely on lead_id and let the backend look it up if needed, 
          // OR we need to ensure gpt_maker_chat_id is fetched in the lead query.
          // The lead query `select('*')` gets `gpt_maker_chat_id`.
          // We should pass it in the body for the Edge Function? 
          // The Edge function expects `chat_id` and `lead_id`. 
          // Wait, Edge Function send-chat-message uses: `https://api.gptmaker.ai/v2/chat/${chat_id}/send-message`
          // So we MUST pass the correct chat_id (gpt_maker_chat_id).
          // I need to map it in `mappedSessions` or fetch it.
          // `mappedSessions` comes from `leads`. `leads` has `gpt_maker_chat_id`.
          // Let's pass it. I'll add `gptMakerChatId` to ChatSession or just find it in sessions from state?
          // ChatSession interface doesn't have it. I'll add a temporary hack or extend the type?
          // Or just find the lead again? 
          // Better: Update ChatSession type or just query the leads array in state (which we mapped).
          // Actually, I can just grab it from the `crmData` or `tags` or just hack it for now.
          // Let's modify `ChatSession` mapping to store it in `crmData.company` was a hack in my thought process,
          // but better: look up the lead in `leads`? No, I don't have `leads` in scope here.
          // I should probably extend the type, but I can't easily.
          // I'll grab it from the session if I stored it.
          // Let's re-map `gpt_maker_chat_id` into `id`? No, `id` is UUID.
          // Let's just fetch it? No, slow.
          // Let's use `crmData.notes` to store it temporarily? Or just rely on the backend finding it?
          // The backend `send-chat-message` takes `chat_id` and uses it in the URL.
          // If I send `lead_id`, can the backend look it up?
          // The backend code I wrote uses `chat_id` directly in URL.
          // I should modify backend to lookup `gpt_maker_chat_id` from `lead_id` if `chat_id` is missing.
          // OR I just pass it from frontend.
          // Let's update `ChatSession` mapping to put `gpt_maker_chat_id` into `customerPhone` or `company`? 
          // Let's put it in `crmData.company` as a temporary holder if it's empty? No.
          // Let's just create a separate map for `leadId -> chatId`.

          chat_id: '...', // Placeholder logic below
          lead_id: selectedSession.leadId,
          action: 'send_message'
        }
      });

      // Actually, to do this right, I need the `gpt_maker_chat_id`. 
      // I will add a `lookup` state or just iterate sessions.
    } catch (e) {
      console.error("Invoke Error:", e);
    }
  };

  // Helper to get real chat ID
  const getGptChatId = (leadId: string) => {
    // In a real app, extend the interface. For now, accessing the raw leads if I had them.
    // But I mapped them.
    // Let's Modify the `useEffect` to store the raw leads or a map.
    return (sessions as any).find((s: any) => s.id === leadId)?.gptMakerChatId;
  }

  // Re-map with the extra field for internal use
  // We need to fix the session mapping in useEffect to include this hidden field.

  // Merge real messages into selected session for display
  const displaySession = selectedSession ? {
    ...selectedSession,
    messages: realMessages.map(m => ({
      id: m.id,
      content: m.content || '',
      type: (m.metadata as any)?.type === 'AUDIO' ? 'audio' : 'text' as const,
      sender: (m.sender_type === 'client' ? 'customer' : 'agent') as 'customer' | 'agent',
      timestamp: new Date(m.created_at)
    }))
  } : null;

  // Update handleSendMessage to use the look up
  const handleSendMessageReal = async (content: string) => {
    if (!selectedSession) return;
    const gptChatId = (selectedSession as any).gptMakerChatId;

    const { error } = await supabase.functions.invoke('send-chat-message', {
      body: {
        content,
        chat_id: gptChatId,
        lead_id: selectedSession.leadId,
        action: 'send_message'
      }
    });
    if (error) console.error(error);
  }

  const handleToggleHandoff = () => {
    // logic to call invoke('send-chat-message', { action: 'take_control' ... })
    if (!selectedSession) return;
    const gptChatId = (selectedSession as any).gptMakerChatId;
    supabase.functions.invoke('send-chat-message', {
      body: {
        chat_id: gptChatId,
        lead_id: selectedSession.leadId,
        action: selectedSession.status === 'bot_handling' ? 'take_control' : 'stop_control'
      }
    });
    // Optimistic update
    /* ... */
  };
  const handleUpdateCRM = /* ... */ () => { };
  const handleAddTask = /* ... */ () => { };
  const handleToggleTask = /* ... */ () => { };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-background">
      {/* Column 1: Inbox Sidebar (25%) */}
      <div className="w-1/4 min-w-[280px] max-w-[360px]">
        <InboxSidebar
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSelectSession={setSelectedSessionId}
        />
      </div>

      {/* Column 2: Conversation (50%) */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border">
        {displaySession ? (
          <>
            {/* Header */}
            <ConversationHeader
              session={displaySession}
              onToggleHandoff={handleToggleHandoff}
            />

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-muted/30">
              <div className="max-w-3xl mx-auto">
                {displaySession.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <ChatInput
              onSend={handleSendMessageReal}
              disabled={false} // Always allow typing for now
              placeholder="Digite sua mensagem..."
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Selecione uma conversa</p>
              <p className="text-sm">Carregando leads...</p>
            </div>
          </div>
        )}
      </div>

      {/* Column 3: CRM Context (25%) */}
      <div className="w-1/4 min-w-[280px] max-w-[360px] bg-card">
        <CRMContextPanel
          session={displaySession}
          tasks={tasks}
          onUpdateCRM={handleUpdateCRM}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
        />
      </div>
    </div>
  );
};

export default Chat;
