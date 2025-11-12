import { useAuth } from "@/contexts/AuthContext";

const CRM = () => {
  const { equipe } = useAuth();

  if (!equipe?.crm_link) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando CRM...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="border-b border-border bg-gradient-to-r from-background to-soft-gray">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">
            CRM <span className="text-primary">Solo Ventures</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestão de Projetos e Clientes
          </p>
        </div>
      </div>

      <div className="flex-1 relative">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; camera *; microphone *"
          src={equipe.crm_link}
          className="absolute inset-0 w-full h-full border-0"
          title="Solo Ventures CRM"
        />
      </div>
    </div>
  );
};

export default CRM;
