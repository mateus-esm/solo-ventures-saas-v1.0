import { Link } from "react-router-dom";
import logo from "@/assets/solo-ventures-logo.png";

export const Header = () => {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/chat" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src={logo} alt="Solo Ventures" className="h-8" />
        </Link>
        <nav className="flex items-center gap-4">
          <Link 
            to="/chat" 
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Chat
          </Link>
          <Link 
            to="/crm" 
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            CRM
          </Link>
        </nav>
      </div>
    </header>
  );
};
