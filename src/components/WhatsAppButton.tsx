import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WhatsAppButton = () => {
  const handleClick = () => {
    window.open("https://wa.me/5585996487923", "_blank");
  };

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-6 left-6 h-auto py-3 px-4 rounded-full shadow-[var(--shadow-elegant)] bg-[#25D366] hover:bg-[#20BA59] text-white font-medium flex items-center gap-2 z-50"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline text-sm">
        Gostaria de conversar sobre melhorias no AdvAI
      </span>
      <span className="sm:hidden text-sm">Melhorias AdvAI</span>
    </Button>
  );
};
