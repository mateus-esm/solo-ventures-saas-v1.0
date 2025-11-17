import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import logoDark from "@/assets/solo-ventures-logo.png";
import logoLight from "@/assets/solo-ventures-logo-light.png";

interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo = ({ className = "h-8", alt = "Solo Ventures" }: LogoProps) => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <img src={logoDark} alt={alt} className={className} />;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc = currentTheme === "dark" ? logoLight : logoDark;

  return <img src={logoSrc} alt={alt} className={className} />;
};
