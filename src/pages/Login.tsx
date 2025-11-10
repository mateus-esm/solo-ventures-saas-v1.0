import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/solo-ventures-logo.png";
import icon from "@/assets/solo-ventures-icon.png";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation for MVP
    if (email && password) {
      toast.success("Login bem-sucedido!");
      navigate("/chat");
    } else {
      toast.error("Por favor, preencha todos os campos.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-soft-gray to-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(28_100%_50%/0.1),transparent_50%)]" />
      
      <Card className="w-full max-w-md relative shadow-[var(--shadow-elegant)] border-primary/20">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <img src={icon} alt="Solo Ventures Icon" className="h-16 w-16" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl" />
            </div>
          </div>
          <img src={logo} alt="Solo Ventures" className="h-8 mx-auto" />
          <div>
            <CardTitle className="text-2xl font-bold">AdvAI Portal</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Assistente Jurídico Inteligente
              <br />
              <span className="text-xs text-primary font-medium">Powered by Solo Ventures ⚡</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-border focus:border-primary focus:ring-primary"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-[hsl(45_100%_60%)] hover:opacity-90 text-primary-foreground font-medium shadow-[var(--shadow-elegant)]"
            >
              Acessar Portal
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Ao acessar, você concorda com nossos termos de uso
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
