import { useAuth } from "@/contexts/AuthContext";

const Suporte = () => {
  const { equipe } = useAuth();

  if (!equipe?.suporte_link) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando suporte...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="border-b border-border bg-gradient-to-r from-background to-soft-gray">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">
            Suporte <span className="text-primary">AdvAI</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envie suas dúvidas e feedbacks
          </p>
        </div>
      </div>

      <div className="flex-1 relative">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; camera *; microphone *"
          src={equipe.suporte_link}
          className="absolute inset-0 w-full h-full border-0"
          title="Formulário de Suporte"
        />
      </div>
    </div>
  );
};

export default Suporte;
