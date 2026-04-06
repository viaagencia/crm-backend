# 🔗 Integração do CRM React com Backend

Este documento explica como conectar seu CRM React a este backend.

## 1️⃣ Criar arquivo de configuração da API

Crie o arquivo `src/config/api.ts` no seu projeto CRM:

```typescript
// src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API = {
  // Leads
  leads: {
    list: () => `${API_BASE_URL}/api/leads`,
    get: (id: string) => `${API_BASE_URL}/api/leads/${id}`,
    create: () => `${API_BASE_URL}/api/leads`,
    update: (id: string) => `${API_BASE_URL}/api/leads/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/leads/${id}`,
  },

  // Pacientes
  pacientes: {
    list: () => `${API_BASE_URL}/api/pacientes`,
    get: (id: string) => `${API_BASE_URL}/api/pacientes/${id}`,
    create: () => `${API_BASE_URL}/api/pacientes`,
    update: (id: string) => `${API_BASE_URL}/api/pacientes/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/pacientes/${id}`,
  },

  // Atividades
  atividades: {
    list: () => `${API_BASE_URL}/api/atividades`,
    byContato: (contatoId: string) => `${API_BASE_URL}/api/atividades/contato/${contatoId}`,
    create: () => `${API_BASE_URL}/api/atividades`,
    update: (id: string) => `${API_BASE_URL}/api/atividades/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/atividades/${id}`,
  },

  // Funis
  funis: {
    list: () => `${API_BASE_URL}/api/funis`,
    get: (id: string) => `${API_BASE_URL}/api/funis/${id}`,
    create: () => `${API_BASE_URL}/api/funis`,
    update: (id: string) => `${API_BASE_URL}/api/funis/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/funis/${id}`,
    addEtapa: (funilId: string) => `${API_BASE_URL}/api/funis/${funilId}/etapas`,
    updateEtapa: (funilId: string, etapaId: string) => `${API_BASE_URL}/api/funis/${funilId}/etapas/${etapaId}`,
    deleteEtapa: (funilId: string, etapaId: string) => `${API_BASE_URL}/api/funis/${funilId}/etapas/${etapaId}`,
  },

  // Tarefas
  tarefas: {
    list: () => `${API_BASE_URL}/api/tarefas`,
    byContato: (contatoId: string) => `${API_BASE_URL}/api/tarefas/contato/${contatoId}`,
    create: () => `${API_BASE_URL}/api/tarefas`,
    update: (id: string) => `${API_BASE_URL}/api/tarefas/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/tarefas/${id}`,
  },

  // Anotações
  anotacoes: {
    list: () => `${API_BASE_URL}/api/anotacoes`,
    byContato: (contatoId: string) => `${API_BASE_URL}/api/anotacoes/contato/${contatoId}`,
    create: () => `${API_BASE_URL}/api/anotacoes`,
    update: (id: string) => `${API_BASE_URL}/api/anotacoes/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/anotacoes/${id}`,
  },
};
```

## 2️⃣ Configurar variáveis de ambiente

Crie/atualize o arquivo `.env.local` no CRM:

```bash
# Desenvolvimento local
VITE_API_URL=http://localhost:3000

# Produção (descomente quando estiver no ar)
# VITE_API_URL=https://api.seudominio.com
```

## 3️⃣ Criar hook para fazer chamadas à API

Crie o arquivo `src/hooks/useApi.ts`:

```typescript
// src/hooks/useApi.ts
export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

export async function apiPost<T>(url: string, data: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

export async function apiPut<T>(url: string, data: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}
```

## 4️⃣ Atualizar o hook `useCrmData`

No arquivo `src/hooks/useCrmData.ts`, adicione as importações:

```typescript
import { API } from '@/config/api';
import { apiGet, apiPost, apiPut, apiDelete } from '@/hooks/useApi';
```

Depois, atualize o `useEffect` para carregar os dados:

```typescript
useEffect(() => {
  const loadData = async () => {
    try {
      const [leads, pacientes, funis] = await Promise.all([
        apiGet<Lead[]>(API.leads.list()),
        apiGet<Paciente[]>(API.pacientes.list()),
        apiGet<Funil[]>(API.funis.list()),
      ]);

      setLeads(leads);
      setPacientes(pacientes);
      setPipelines(funis);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      // Fallback para localStorage se API falhar
      const localLeads = JSON.parse(localStorage.getItem('crm-leads') || '[]');
      setLeads(localLeads);
    }
  };

  loadData();
}, []);
```

Exemplo: função `addLead` chamando a API:

```typescript
const addLead = async (lead: Omit<Lead, 'id' | 'tarefas' | 'anotacoes' | 'atividades'>) => {
  try {
    const newLead = await apiPost<Lead>(API.leads.create(), {
      nome: lead.nome,
      telefone: lead.telefone,
      email: lead.email,
      origem: lead.origem,
    });

    setLeads(prev => [...prev, newLead]);
    toast.success('Lead criado com sucesso!');
  } catch (err) {
    toast.error('Erro ao criar lead: ' + (err as Error).message);
  }
};
```

## 5️⃣ Exemplo Completo: Criar uma Atividade

```typescript
// No seu componente (ex: ContatoDetail.tsx)
import { API } from '@/config/api';
import { apiPost } from '@/hooks/useApi';

const addAtividade = async () => {
  try {
    const novaAtividade = await apiPost(API.atividades.create(), {
      contatoId: contato.id,
      contatoTipo: tipo,
      tipo: atividadeTipo,
      status: atividadeStatus,
      observacao: atividadeObs,
    });

    // Atualizar localmente
    onUpdate(contato.id, {
      atividades: [...(contato.atividades || []), novaAtividade]
    });

    toast.success('Atividade registrada!');
  } catch (err) {
    toast.error('Erro ao registrar atividade');
  }
};
```

## 6️⃣ Migração Passo a Passo (Recomendado)

Para não quebrar nada, faça em 3 fases:

### Fase 1: API como backup (localStorage é padrão)
```typescript
const addLead = async (lead: Lead) => {
  // Salvar localmente PRIMEIRO
  setLeads(prev => [...prev, lead]);

  // Tentar salvar na API (em background)
  try {
    await apiPost(API.leads.create(), lead);
  } catch (err) {
    console.warn('Erro ao sincronizar com API:', err);
  }
};
```

### Fase 2: API como padrão, localStorage como fallback
```typescript
const addLead = async (lead: Lead) => {
  try {
    const newLead = await apiPost<Lead>(API.leads.create(), lead);
    setLeads(prev => [...prev, newLead]);
  } catch (err) {
    console.warn('API indisponível, usando localStorage:', err);
    setLeads(prev => [...prev, lead]);
  }
};
```

### Fase 3: Apenas API (remover localStorage)
```typescript
const addLead = async (lead: Lead) => {
  const newLead = await apiPost<Lead>(API.leads.create(), lead);
  setLeads(prev => [...prev, newLead]);
};
```

## 7️⃣ Checklist de Integração

- [ ] Arquivo `src/config/api.ts` criado
- [ ] `.env.local` com `VITE_API_URL`
- [ ] Hook `useApi.ts` criado
- [ ] Backend rodando (local ou produção)
- [ ] `useCrmData.ts` atualizado para carregar da API
- [ ] Teste: criar um lead → verificar no console se chamou API
- [ ] Teste: recarregar página → lead ainda está lá
- [ ] Teste: duas pessoas em navegadores diferentes
  - Pessoa A cria atividade
  - Pessoa B recarrega página
  - Pessoa B vê a atividade
- [ ] Remover sincronização com Google Sheets de localStorage (opcional)

## 🚀 Deploy Final

Quando tudo estiver funcionando:

1. Remova o fallback de localStorage
2. Faça commit: `git commit -am "Integração com backend API"`
3. Push: `git push`
4. CRM fará redeploy na Hostinger automaticamente

## 📞 Suporte

Se algo não funcionar:

1. Abra Developer Tools (F12) → Console
2. Verifique se há erros de CORS
3. Confirme que API está rodando: visite `/api/health`
4. Teste um endpoint com Postman/Insomnia
5. Verifique as variáveis de ambiente

