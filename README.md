# AgriDash Pro

Gestão e acompanhamento dinâmico de lotes de animais no campo, com análise de curva de consumo baseada na tabela Cargill. Permite lançamento e visualização de dados via dashboard preciso.

## Funcionalidades Principais
- **Dashboard de Desempenho**: Visão geral do consumo, diferenças e indicadores chave dos lotes.
- **Gestão de Lotes/Integrados**: Histórico e controle total dos lotes ativos e fechados.
- **Curva de Referência**: Análise baseada na tabela Cargill com projeções de dias e metas diárias.
- **Exportação de Lançamentos**: Exportação direta dos dados e visitas para planilhas Excel.
- **Suporte a Múltiplos Tipos de Dados**: Registros detalhados do desenvolvimento do lote.

## Tecnologias
- **Frontend**: React, Tailwind CSS, Recharts, Lucide Icons, Vite
- **Backend / Database**: Supabase (PostgreSQL), Firebase
- **Exportação de Dados**: XLSX
- **Linguagem**: TypeScript

## Instalação e Execução

### Pré-requisitos
- [Node.js](https://nodejs.org/en/) (versão 18+ recomendada)
- `npm` ou `yarn` para gerenciamento de pacotes

### Passo a passo

1. **Clone o repositório**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd <NOME_DO_DIRETORIO>
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   - Copie o arquivo de exemplo de ambiente:
     ```bash
     cp .env.example .env
     ```
   - Preencha as chaves da API e as URLs do Supabase/Firebase necessárias no arquivo `.env`.

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. A aplicação estará disponível na porta configurada pelo Vite (normalmente `http://localhost:5173` ou `http://localhost:3000`).

## Estrutura do Projeto
- `src/` - Contém todo o código-fonte (componentes, dados, utilitários).
  - `components/` - Componentes principais da interface (Dashboard, Formulários, Tabelas).
  - `lib/` - Configurações de conexão e clientes (Supabase, Storage).
  - `types.ts` - Tipos TypeScript de toda a aplicação.
- `.env.example` - Template de variáveis de ambiente seguras.
- `package.json` - Dependências e scripts do projeto.

## Contribuição
Fique à vontade para abrir _issues_ ou enviar _pull requests_ com melhorias e correções.
