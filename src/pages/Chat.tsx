import { useState, useRef, useEffect } from "react";
import { ChatSession, Message, Task } from "@/types/chat";
import { mockChatSessions, mockTasks } from "@/data/mockChatData";
import { InboxSidebar } from "@/components/inbox/InboxSidebar";
import { ConversationHeader } from "@/components/inbox/ConversationHeader";
import { MessageBubble } from "@/components/inbox/MessageBubble";
import { ChatInput } from "@/components/inbox/ChatInput";
import { CRMContextPanel } from "@/components/inbox/CRMContextPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";

const Chat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(mockChatSessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    mockChatSessions[0]?.id || null
  );
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || null;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedSession?.messages]);

  const handleSendMessage = (content: string) => {
    if (!selectedSession) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      content,
      type: "text",
      sender: selectedSession.status === "human_handling" ? "agent" : "customer",
      senderName: selectedSession.status === "human_handling" ? "Você" : undefined,
      timestamp: new Date(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSessionId
          ? {
              ...s,
              messages: [...s.messages, newMessage],
              lastMessage: content,
              lastMessageTime: new Date(),
            }
          : s
      )
    );
  };

  const handleToggleHandoff = () => {
    if (!selectedSession) return;

    const newStatus =
      selectedSession.status === "bot_handling" ? "human_handling" : "bot_handling";

    // Add system message
    const systemMessage: Message = {
      id: `m-${Date.now()}`,
      content:
        newStatus === "human_handling"
          ? "Você assumiu o atendimento"
          : "Conversa devolvida para a IA",
      type: "text",
      sender: "system",
      timestamp: new Date(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSessionId
          ? {
              ...s,
              status: newStatus,
              messages: [...s.messages, systemMessage],
            }
          : s
      )
    );
  };

  const handleUpdateCRM = (data: Partial<ChatSession["crmData"]>) => {
    if (!selectedSession) return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSessionId
          ? {
              ...s,
              crmData: { ...s.crmData, ...data },
            }
          : s
      )
    );
  };

  const handleAddTask = (title: string) => {
    const newTask: Task = {
      id: `t-${Date.now()}`,
      title,
      completed: false,
      createdAt: new Date(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };

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
        {selectedSession ? (
          <>
            {/* Header */}
            <ConversationHeader
              session={selectedSession}
              onToggleHandoff={handleToggleHandoff}
            />

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-muted/30">
              <div className="max-w-3xl mx-auto">
                {selectedSession.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <ChatInput
              onSend={handleSendMessage}
              disabled={selectedSession.status === "bot_handling"}
              placeholder={
                selectedSession.status === "bot_handling"
                  ? "Assuma o atendimento para enviar mensagens"
                  : "Digite sua mensagem..."
              }
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Selecione uma conversa</p>
              <p className="text-sm">Escolha um contato para iniciar</p>
            </div>
          </div>
        )}
      </div>

      {/* Column 3: CRM Context (25%) */}
      <div className="w-1/4 min-w-[280px] max-w-[360px] bg-card">
        <CRMContextPanel
          session={selectedSession}
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
