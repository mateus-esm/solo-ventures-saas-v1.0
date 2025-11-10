import { Header } from "@/components/Header";

const CRM = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex flex-col">
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

        <div className="flex-1 relative bg-soft-gray">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; camera *; microphone *"
            src="https://share.jestor.fun/mateussmaia/a07ec35c07d0ad4260f281d28b5de0be"
            className="w-full h-full border-0"
            title="Solo Ventures CRM"
          />
        </div>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          © 2025 Solo Ventures — Powering Intelligent Operations ⚡
        </div>
      </footer>
    </div>
  );
};

export default CRM;
