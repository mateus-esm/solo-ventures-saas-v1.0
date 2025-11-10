import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <div className="border-b border-border bg-gradient-to-r from-background to-soft-gray">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-foreground">
              AdvAI <span className="text-primary">— Assistente Jurídico</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Dr. Walter Inglez • Powered by Solo Ventures ⚡
            </p>
          </div>
        </div>

        <div className="flex-1 relative">
          <iframe
            src="https://www.monitora.chat/shared/SKSA4Y"
            className="w-full h-full border-0"
            allow="camera *; microphone *"
            title="AdvAI Chat Interface"
          />
        </div>
      </main>

      {/* Floating Support Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-[var(--shadow-elegant)] bg-gradient-to-br from-primary to-[hsl(45_100%_60%)] hover:opacity-90 hover:scale-110 transition-all duration-300"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Suporte e Feedback</DialogTitle>
            <DialogDescription>
              Envie suas dúvidas ou sugestões para nossa equipe
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 h-full">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; camera *; microphone *"
              src="https://share.jestor.fun/mateussmaia/b37d578b5487f00f0e3fcfaa17e11177"
              className="w-full h-full border-0 rounded"
              title="Formulário de Suporte"
            />
          </div>
        </DialogContent>
      </Dialog>

      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          © 2025 Solo Ventures — Powering Intelligent Operations ⚡
        </div>
      </footer>
    </div>
  );
};

export default Chat;
