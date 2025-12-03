export type TenantId = 'advai' | 'solon' | 'cb' | 'nutria' | 'imob' | 'default';

export interface TenantConfig {
  id: TenantId;
  name: string;
  nicho: string;
  domain: string;
  logo: string;
  logoLight: string;
  primaryColor: string;
  description: string;
}

export const tenants: Record<TenantId, TenantConfig> = {
  advai: {
    id: 'advai',
    name: 'AdvAI',
    nicho: 'juridico',
    domain: 'advai.soloventures.com.br',
    logo: '/tenants/advai/logo.png',
    logoLight: '/tenants/advai/logo-light.png',
    primaryColor: '220 70% 50%', // Blue
    description: 'Agente SDR para Escritórios de Advocacia',
  },
  solon: {
    id: 'solon',
    name: 'Solon',
    nicho: 'energia_solar',
    domain: 'solon.soloventures.com.br',
    logo: '/tenants/solon/logo.png',
    logoLight: '/tenants/solon/logo-light.png',
    primaryColor: '45 100% 50%', // Solar Yellow/Orange
    description: 'Agente SDR para Energia Solar',
  },
  cb: {
    id: 'cb',
    name: 'CB',
    nicho: 'contabil',
    domain: 'cb.soloventures.com.br',
    logo: '/tenants/cb/logo.png',
    logoLight: '/tenants/cb/logo-light.png',
    primaryColor: '160 60% 45%', // Green
    description: 'Agente SDR para Contabilidade',
  },
  nutria: {
    id: 'nutria',
    name: 'NutriA',
    nicho: 'nutricao',
    domain: 'nutria.soloventures.com.br',
    logo: '/tenants/nutria/logo.png',
    logoLight: '/tenants/nutria/logo-light.png',
    primaryColor: '140 70% 45%', // Healthy Green
    description: 'Agente SDR para Nutricionistas',
  },
  imob: {
    id: 'imob',
    name: 'Imob',
    nicho: 'imobiliario',
    domain: 'imob.soloventures.com.br',
    logo: '/tenants/imob/logo.png',
    logoLight: '/tenants/imob/logo-light.png',
    primaryColor: '200 80% 50%', // Real Estate Blue
    description: 'Agente SDR para Mercado Imobiliário',
  },
  default: {
    id: 'default',
    name: 'Solo Ventures',
    nicho: 'geral',
    domain: 'soloventures.com.br',
    logo: '/solo-ventures-icon-512.png',
    logoLight: '/solo-ventures-icon-512.png',
    primaryColor: '262 83% 58%', // Original Purple
    description: 'Plataforma SoloAI SaaS',
  },
};

export function getTenantByHostname(hostname: string): TenantConfig {
  // Remove port for local development
  const cleanHostname = hostname.split(':')[0];
  
  // Check for subdomain match
  for (const tenant of Object.values(tenants)) {
    if (tenant.id !== 'default' && cleanHostname.includes(tenant.id)) {
      return tenant;
    }
  }
  
  // Check for exact domain match
  const found = Object.values(tenants).find(t => t.domain === cleanHostname);
  if (found) return found;
  
  // Default fallback
  return tenants.default;
}

export function getTenantById(id: TenantId): TenantConfig {
  return tenants[id] || tenants.default;
}
