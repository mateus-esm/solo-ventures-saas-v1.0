# 🪐 ANTIGRAVITY MANIFESTO: Visão Estratégica do SoloAI

**Confidencialidade:** Documento Mestre de Arquitetura e Negócios.
**Operador:** Google Antigravity Agent.

---

## 1. A Visão do Produto (The "Why")
Não estamos construindo um simples CRM. Estamos construindo uma **Máquina de Vendas Autônoma (Revenue Engine)**.

O mercado atual sofre de "Fragmentação de Vendas":
1.  O Marketing traz o lead (Meta Ads).
2.  O Atendimento acontece no WhatsApp (Desconectado).
3.  O CRM é um cemitério de dados (Ninguém preenche).

**O SoloAI resolve isso unificando a tríade:**
* **SDR Digital (IA):** Qualifica e engaja o lead instantaneamente (via GPT Maker).
* **Inbox Unificado (Humano):** O vendedor fecha o negócio com contexto total (CRM + Chat na mesma tela).
* **Gestão Invisível (Dados):** Dashboards e KPIs são gerados automaticamente pelas interações, sem planilhas manuais.

---

## 2. Pilares Estratégicos de Desenvolvimento

### 🏛️ O Conceito "Multi-Vertical" (Tenants)
O SoloAI é um camaleão. A mesma infraestrutura serve nichos radicalmente diferentes.
* **Regra de Ouro:** NUNCA "chumbar" (hardcode) regras de negócio no Frontend. Tudo deve ser configurável via `src/config/tenants.ts` ou banco de dados.
* **Exemplos Ativos:**
    * `AdvAI` (Jurídico): Fala de "Processos" e "Audiências".
    * `Solon` (Solar): Fala de "kWh" e "Vistoria".
    * `NutriA`, `Imob`, `CB`: Cada um com seus campos customizados (`customFields`).

### 🤖 O Cérebro Híbrido (IA + Humano)
A IA não substitui o vendedor, ela **empodera** o vendedor.
* **Fluxo:** O `gpt-maker-webhook` recebe a mensagem -> IA Analisa -> Se for qualificado, move no Kanban -> Vendedor assume no `SoloAI Inbox`.
* **Tecnologia:** Usamos a API do GPT Maker para a inteligência conversacional, mas o **Supabase** é a fonte da verdade do histórico (`messages` table).

### 💸 A Máquina de Monetização (Billing)
O sistema foi desenhado para escalar receita recorrente (MRR) e upsell (Créditos).
* **Integração:** Asaas (Gateway de Pagamento Brasileiro).
* **Modelo:** Assinatura Mensal (SaaS) + Consumo de Créditos de IA (Usage-based).
* **Tabelas Críticas:** `planos`, `equipes` (limites), `consumo_creditos`.

---

## 3. Arquitetura de Sistemas Integrados

O Antigravity deve operar orquestrando estas 3 entidades externas:

| Sistema | Função Estratégica | Pontos de Integração (Codebase) |
| :--- | :--- | :--- |
| **Supabase** | **O Coração (Dados & Auth)** | Autenticação, Banco de Dados Relacional, Realtime (Chat), Edge Functions. |
| **GPT Maker** | **A Boca & Ouvidos (Comunicação)** | `send-chat-message` (Envio), `gpt-maker-webhook` (Recebimento/IA). |
| **Asaas** | **O Bolso (Financeiro)** | `asaas-subscribe` (Checkout), Webhooks de pagamento (Liberação de acesso). |

---

## 4. Diretrizes Operacionais para o Agente

Ao escrever código ou sugerir refatorações, siga estas 4 Leis:

1.  **Database First:** Se a funcionalidade não tem tabela, ela não existe. Comece sempre pela Migration SQL. O Frontend é apenas um reflexo do Banco.
2.  **Security by Design (RLS):** Estamos lidando com dados de múltiplos concorrentes no mesmo banco. A política Row Level Security (RLS) baseada em `equipe_id` é inegociável.
3.  **Experiência "Cockpit":** O usuário não deve trocar de aba. O Chat deve permitir editar o CRM. O CRM deve permitir mandar mensagem. Integre, não separe.
4.  **Resiliência:** Se a API do GPT Maker falhar, a mensagem deve ser salva no banco com status `error` para retentativa. Nunca perca dados do cliente.

---

## 5. Status Atual & Próxima Fronteira

* **Conquistado:** Estrutura Multi-tenant, UI do CRM, Tabela de Mensagens, Integração básica de envio.
* **Foco Imediato:** **Conexão Realtime**. Fazer o chat "ganhar vida". Quando o cliente fala no WhatsApp, a tela do vendedor deve piscar instantaneamente.

Use este manifesto para guiar cada linha de código.
