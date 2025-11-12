import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Chat = () => {
  const { profile } = useAuth();

  if (!profile?.chat_link_base) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando chat...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="border-b border-border bg-gradient-to-r from-background to-soft-gray">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">
            AdvAI <span className="text-primary">— Assistente Jurídico</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {profile.nome_completo} • Powered by Solo Ventures ⚡
          </p>
        </div>
      </div>

      <div className="flex-1 relative">
        <iframe
          src={profile.chat_link_base}
          className="absolute inset-0 w-full h-full border-0"
          allow="camera *; microphone *"
          title="AdvAI Chat Interface"
        />
      </div>
    </div>

  
  );
};

export default Chat;
