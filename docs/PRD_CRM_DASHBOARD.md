# PRD - CRM & Dashboard SoloAI

**Versão:** 1.0  
**Data:** 2025-12-16  
**Status:** Draft

---

## 1. Visão Geral

### 1.1 Objetivo
Sistema CRM completo integrado com Dashboard analítico, permitindo gestão de leads/contatos com pipeline Kanban, campos customizáveis, agendamento de reuniões, histórico de interações e integrações via webhook.

### 1.2 Usuários-Alvo
- Gestores de vendas e SDRs
- Equipes de atendimento ao cliente
- Administradores de equipe

---

## 2. Arquitetura de Dados

### 2.1 Tabela Principal: `leads`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `equipe_id` | UUID | FK para equipes |
| `stage_id` | UUID | FK para pipeline_stages (fase atual) |
| `name` | TEXT | Nome do contato |
| `email` | TEXT | Email do contato |
| `phone` | TEXT | Telefone (formato: +55...) |
| `responsible_id` | UUID | FK para profiles (responsável) |
| `source` | TEXT | Origem do lead |
| `origem` | TEXT | Canal de entrada (agente_sdr/manual/webhook) |
| `opportunity_value` | NUMERIC | Valor da oportunidade |
| `meeting_scheduled` | BOOLEAN | Reunião agendada? |
| `meeting_date` | TIMESTAMP | Data/hora da reunião |
| `meeting_done` | BOOLEAN | Reunião realizada? |
| `no_show` | BOOLEAN | Cliente não compareceu? |
| `next_contact` | DATE | Próximo contato |
| `observations` | TEXT | Observações gerais |
| `tags` | TEXT[] | Tags/etiquetas |
| `custom_fields` | JSONB | Campos personalizados |
| `atendido_por_agente` | BOOLEAN | Flag de atendimento por agente |
| `interaction_id` | TEXT | ID de interação externa |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

### 2.2 Tabela: `lead_activities` (Histórico de Contatos)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `lead_id` | UUID | FK para leads |
| `user_id` | UUID | Quem registrou |
| `tipo` | TEXT | Tipo: ligacao/email/whatsapp/reuniao/nota |
| `descricao` | TEXT | Descrição da atividade |
| `metadata` | JSONB | Dados adicionais |
| `created_at` | TIMESTAMP | Data do registro |

### 2.3 Tabela: `pipeline_stages` (Fases do Pipeline)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `equipe_id` | UUID | FK para equipes |
| `name` | TEXT | Nome da fase |
| `position` | INT | Ordem de exibição |
| `color` | TEXT | Cor hex/hsl |
| `is_default` | BOOLEAN | Fase padrão para novos leads |

### 2.4 Tabela: `custom_field_definitions` (Definição de Campos)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `equipe_id` | UUID | FK para equipes |
| `field_key` | TEXT | Chave do campo (snake_case) |
| `field_label` | TEXT | Label de exibição |
| `field_type` | TEXT | text/number/date/select/boolean |
| `options` | JSONB | Opções para tipo select |
| `required` | BOOLEAN | Campo obrigatório? |
| `visible_in_card` | BOOLEAN | Mostrar no card do Kanban? |
| `position` | INT | Ordem de exibição |
| `created_at` | TIMESTAMP | Data de criação |

### 2.5 Tabela: `webhook_configs` (Configuração de Webhooks)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `equipe_id` | UUID | FK para equipes |
| `name` | TEXT | Nome do webhook |
| `direction` | TEXT | inbound/outbound |
| `url` | TEXT | URL (outbound) |
| `trigger_event` | TEXT | Evento: lead_created/lead_updated/stage_changed/meeting_scheduled |
| `active` | BOOLEAN | Webhook ativo? |
| `secret` | TEXT | Chave de autenticação |
| `headers` | JSONB | Headers customizados |
| `payload_template` | JSONB | Template do payload |
| `created_at` | TIMESTAMP | Data de criação |

---

## 3. Funcionalidades do CRM

### 3.1 Pipeline Kanban

#### 3.1.1 Visualização
- **Colunas**: Uma coluna por fase do pipeline (customizável)
- **Cards**: Exibem campos selecionados pelo usuário
- **Drag & Drop**: Mover leads entre fases
- **Contador**: Total de leads e valor por coluna
- **Filtros**: Por responsável, tags, data, campos customizados

#### 3.1.2 Card do Lead
```
┌─────────────────────────────────┐
│ 🟢 João Silva                   │
│ ☎️ (11) 99999-9999  📱 WhatsApp │
│ 📧 joao@email.com               │
│ 💰 R$ 5.000,00                  │
│ 📅 Reunião: 20/12 às 14h        │
│ 👤 Maria (responsável)          │
│ 🏷️ #qualificado #urgente        │
└─────────────────────────────────┘
```

#### 3.1.3 Ações Rápidas no Card
- Clicar no telefone → Abre WhatsApp (`https://wa.me/5511999999999`)
- Clicar no card → Abre modal de detalhes
- Menu de contexto → Editar, Mover, Excluir

### 3.2 Modal de Detalhes do Lead

#### 3.2.1 Abas/Seções
1. **Informações Básicas**
   - Nome, Email, Telefone
   - Responsável (dropdown de membros da equipe)
   - Fase atual
   - Valor da oportunidade
   - Origem/Source
   - Tags

2. **Campos Personalizados**
   - Exibe todos os campos definidos pela equipe
   - Editáveis inline

3. **Agendamento**
   - Checkbox: Reunião agendada
   - DateTimePicker: Data/hora da reunião
   - Checkbox: Reunião realizada
   - Checkbox: No-show
   - Campo: Próximo contato

4. **Histórico de Atividades**
   - Timeline de todas as interações
   - Botão para adicionar nova atividade
   - Tipos: Ligação, Email, WhatsApp, Reunião, Nota
   - Cada entrada mostra: tipo, descrição, quem registrou, quando

5. **Observações**
   - Textarea para notas gerais

### 3.3 Tabela de Contatos (View Alternativa)

#### 3.3.1 Funcionalidades
- **Visualização em tabela** com todas as colunas visíveis
- **Colunas configuráveis**: Usuário escolhe quais campos exibir
- **Ordenação**: Por qualquer coluna
- **Filtros avançados**: Múltiplos critérios
- **Busca global**: Pesquisa em todos os campos
- **Edição inline**: Clique duplo para editar
- **Seleção múltipla**: Ações em lote

#### 3.3.2 Ações em Lote
- Mover para fase
- Atribuir responsável
- Adicionar tags
- Exportar selecionados
- Excluir selecionados

### 3.4 Gerenciador de Campos Personalizados

#### 3.4.1 Interface
```
┌─────────────────────────────────────────────────┐
│ Campos Personalizados                    [+ Novo]│
├─────────────────────────────────────────────────┤
│ ≡ empresa      | Empresa      | texto    | ✓ 📋 │
│ ≡ cargo        | Cargo        | texto    | ✓ 📋 │
│ ≡ segmento     | Segmento     | seleção  | ✓ 📋 │
│ ≡ temperatura  | Temperatura  | seleção  | ✓ 📋 │
│ ≡ orcamento    | Orçamento    | número   | ☐ 📋 │
└─────────────────────────────────────────────────┘
Legenda: ✓ = obrigatório | 📋 = visível no card
```

#### 3.4.2 Tipos de Campo
- **Texto**: Input simples
- **Número**: Input numérico
- **Data**: DatePicker
- **Seleção**: Dropdown com opções predefinidas
- **Boolean**: Checkbox
- **Texto Longo**: Textarea

### 3.5 Import/Export de Dados

#### 3.5.1 Importação
- **Formatos**: CSV, Excel (.xlsx)
- **Mapeamento de colunas**: Interface para mapear colunas do arquivo para campos do CRM
- **Preview**: Visualização dos primeiros 10 registros antes de importar
- **Validação**: Alertas para dados inválidos
- **Opções**: 
  - Criar novos campos para colunas não mapeadas
  - Atualizar existentes vs apenas criar novos

#### 3.5.2 Exportação
- **Formatos**: CSV, Excel (.xlsx)
- **Filtros**: Exportar todos ou selecionados
- **Campos**: Escolher quais campos exportar
- **Inclui**: Opção para incluir histórico de atividades

### 3.6 Integração WhatsApp

#### 3.6.1 Link Direto
- Botão/ícone no card e modal
- URL: `https://wa.me/{phone_cleaned}?text={template_encoded}`
- Formatação automática do número (remove caracteres especiais, adiciona código país)

#### 3.6.2 Template de Mensagem (Futuro)
- Mensagens pré-definidas por fase
- Variáveis: `{{nome}}`, `{{empresa}}`, etc.

### 3.7 Webhooks

#### 3.7.1 Inbound (Receber Dados)
- **Endpoint**: `POST /functions/v1/crm-webhook`
- **Autenticação**: API Key no header ou query param
- **Payload esperado**:
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "+5511999999999",
  "source": "landing_page",
  "custom_fields": {
    "empresa": "Acme Inc",
    "cargo": "Diretor"
  }
}
```

#### 3.7.2 Outbound (Enviar Dados)
- **Triggers configuráveis**:
  - `lead_created`: Novo lead criado
  - `lead_updated`: Lead atualizado
  - `stage_changed`: Mudança de fase
  - `meeting_scheduled`: Reunião agendada
  - `meeting_done`: Reunião realizada
  - `no_show`: No-show registrado

- **Payload customizável**: Template JSON com variáveis
- **Retry**: 3 tentativas com backoff exponencial
- **Logs**: Histórico de envios com status

---

## 4. Dashboard

### 4.1 Métricas Principais (Cards)

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Leads  │ Reuniões     │ Reuniões     │ Taxa de      │
│     125      │ Agendadas    │ Realizadas   │ Conversão    │
│   +12 hoje   │     32       │     28       │    22.4%     │
└──────────────┴──────────────┴──────────────┴──────────────┘
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ No-Shows     │ Valor Total  │ Ticket Médio │ Leads Novos  │
│      4       │ R$ 156.000   │  R$ 4.875    │   (7 dias)   │
│   12.5%      │              │              │      45      │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### 4.2 Gráficos

#### 4.2.1 Funil de Conversão
- Gráfico de funil mostrando leads por fase
- Percentual de conversão entre fases

#### 4.2.2 Leads por Período
- Gráfico de linha/barras
- Filtro: últimos 7/30/90 dias
- Comparação com período anterior

#### 4.2.3 Performance por Responsável
- Tabela/gráfico de barras
- Métricas: leads atribuídos, reuniões, conversões

#### 4.2.4 Origem dos Leads
- Gráfico de pizza/donut
- Fonte: manual, webhook, agente SDR

#### 4.2.5 Reuniões por Dia/Semana
- Calendário heat map ou gráfico de barras
- Destacar dias com mais reuniões

### 4.3 Filtros Globais
- Período (date range)
- Responsável
- Origem do lead
- Tags
- Fase do pipeline

### 4.4 Tabela de Atividades Recentes
- Últimas 20 atividades
- Tipo, lead, responsável, data/hora
- Link para abrir o lead

---

## 5. Fluxos de Usuário

### 5.1 Criar Lead Manual
```
1. Clicar "Novo Lead" no Kanban ou Tabela
2. Preencher formulário com campos básicos + customizados
3. Selecionar fase inicial e responsável
4. Salvar → Lead aparece na coluna/tabela
5. Sistema registra atividade: "Lead criado"
```

### 5.2 Agendar Reunião
```
1. Abrir modal do lead
2. Ir na seção "Agendamento"
3. Marcar "Reunião agendada"
4. Selecionar data/hora
5. Salvar → Sistema registra atividade
6. (Opcional) Trigger webhook outbound
```

### 5.3 Registrar Contato
```
1. Abrir modal do lead
2. Ir na seção "Histórico"
3. Clicar "Nova Atividade"
4. Selecionar tipo (Ligação, WhatsApp, etc)
5. Escrever descrição
6. Salvar → Aparece na timeline
```

### 5.4 Importar Leads
```
1. Clicar "Importar" na área de contatos
2. Selecionar arquivo CSV/Excel
3. Mapear colunas para campos
4. Visualizar preview
5. Confirmar importação
6. Sistema processa e reporta resultado
```

### 5.5 Configurar Webhook Outbound
```
1. Ir em Configurações > Webhooks
2. Clicar "Novo Webhook"
3. Selecionar direção: Outbound
4. Inserir URL de destino
5. Selecionar trigger (ex: stage_changed)
6. Configurar payload template
7. Testar webhook
8. Ativar
```

---

## 6. Permissões e RLS

### 6.1 Políticas de Acesso
- **Leads**: Usuários veem apenas leads de sua equipe
- **Pipeline Stages**: Gerenciados por equipe
- **Custom Fields**: Definidos por equipe
- **Webhooks**: Configurados por equipe
- **Activities**: Visíveis para membros da equipe do lead

### 6.2 Roles (Futuro)
- **Admin**: Acesso total, configurações, webhooks
- **Manager**: Vê todos os leads, pode reatribuir
- **Member**: Vê apenas leads atribuídos a si

---

## 7. Integrações Técnicas

### 7.1 Edge Functions Necessárias

| Função | Propósito |
|--------|-----------|
| `crm-webhook` | Receber leads via webhook |
| `webhook-dispatcher` | Enviar webhooks outbound |
| `import-leads` | Processar importação de arquivos |
| `export-leads` | Gerar arquivo de exportação |

### 7.2 Realtime
- Tabela `leads`: Atualizações em tempo real no Kanban
- Tabela `lead_activities`: Atualizar timeline

---

## 8. UI/UX Guidelines

### 8.1 Navegação
```
Sidebar:
├── Dashboard
├── CRM
│   ├── Pipeline (Kanban)
│   └── Contatos (Tabela)
├── Configurações
│   ├── Campos Personalizados
│   ├── Fases do Pipeline
│   └── Webhooks
└── ...
```

### 8.2 Responsividade
- **Desktop**: Kanban completo, tabela com scroll horizontal
- **Tablet**: Kanban simplificado, tabela responsiva
- **Mobile**: Lista de cards, formulários full-width

### 8.3 Feedback Visual
- Toast para ações completadas
- Loading states em operações assíncronas
- Confirmação para ações destrutivas
- Indicadores de campos obrigatórios

---

## 9. Métricas de Sucesso

### 9.1 KPIs do Produto
- Tempo médio para criar lead
- Taxa de uso do Kanban vs Tabela
- Frequência de uso de campos customizados
- Volume de webhooks processados

### 9.2 KPIs de Negócio (Dashboard)
- Taxa de conversão lead → reunião
- Taxa de no-show
- Tempo médio no pipeline
- Valor médio por lead convertido

---

## 10. Roadmap de Implementação

### Fase 1 - MVP (Atual)
- [x] Kanban básico com drag-and-drop
- [x] Modal de detalhes do lead
- [x] Fases customizáveis
- [x] Webhook inbound básico
- [ ] Campo de responsável
- [ ] Agendamento de reunião com data/hora
- [ ] Link WhatsApp

### Fase 2 - Campos e Tabela
- [ ] Gerenciador de campos personalizados
- [ ] Visualização em tabela
- [ ] Filtros avançados
- [ ] Busca global

### Fase 3 - Import/Export
- [ ] Importação CSV/Excel
- [ ] Mapeamento de colunas
- [ ] Exportação com filtros

### Fase 4 - Webhooks Avançados
- [ ] Webhooks outbound
- [ ] Triggers configuráveis
- [ ] Logs de webhook

### Fase 5 - Dashboard
- [ ] Métricas principais
- [ ] Gráficos de conversão
- [ ] Filtros globais
- [ ] Performance por responsável

---

## 11. Considerações Técnicas

### 11.1 Performance
- Paginação na tabela de contatos (50 por página)
- Lazy loading de atividades no modal
- Debounce em filtros e busca
- Cache de campos customizados

### 11.2 Segurança
- RLS em todas as tabelas
- Validação de webhook secrets
- Sanitização de inputs
- Rate limiting em endpoints públicos

### 11.3 Escalabilidade
- Índices em campos frequentemente filtrados
- JSONB indexes para custom_fields
- Particionamento de lead_activities (futuro)

---

## Anexos

### A. Payload Webhook Inbound
```json
{
  "name": "string (required)",
  "email": "string",
  "phone": "string",
  "source": "string",
  "stage": "string (stage name)",
  "responsible_email": "string",
  "tags": ["string"],
  "custom_fields": {
    "key": "value"
  },
  "metadata": {
    "interaction_id": "string",
    "utm_source": "string"
  }
}
```

### B. Payload Webhook Outbound (Template)
```json
{
  "event": "{{trigger_event}}",
  "timestamp": "{{timestamp}}",
  "lead": {
    "id": "{{lead.id}}",
    "name": "{{lead.name}}",
    "email": "{{lead.email}}",
    "phone": "{{lead.phone}}",
    "stage": "{{lead.stage_name}}",
    "previous_stage": "{{lead.previous_stage_name}}",
    "responsible": "{{lead.responsible_name}}",
    "value": "{{lead.opportunity_value}}",
    "custom_fields": "{{lead.custom_fields}}"
  }
}
```

### C. Fórmulas de Métricas
```
Taxa de Conversão = (Reuniões Realizadas / Total Leads) * 100
Taxa de No-Show = (No-Shows / Reuniões Agendadas) * 100
Ticket Médio = Valor Total / Leads Convertidos
Tempo no Pipeline = AVG(updated_at - created_at) por fase
```
