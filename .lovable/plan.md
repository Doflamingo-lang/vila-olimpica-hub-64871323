

# Guia de Utilizador — Portal Vila Olimpica

## Objectivo
Criar uma nova pagina dedicada (`/guia`) com um guia completo e organizado para todos os utilizadores do portal, cobrindo tanto a area publica como a area do morador e o painel administrativo.

## Estrutura da Pagina

A pagina tera o Navbar no topo, um cabecalho descritivo e o conteudo organizado em seccoes expansiveis (Accordion), agrupadas por perfil de utilizador.

### Seccoes do Guia

**1. Navegacao no Portal (area publica)**
- Como aceder as paginas: Inicio, Sobre, Administracao, Imoveis, Marketplace, Noticias, Arquivo, Contato
- Botao flutuante do WhatsApp

**2. Pedido de Acesso (registo)**
- Passo a passo para preencher o formulario em `/pedido-acesso`
- Campos obrigatorios: nome, bloco, edificio, apartamento, tipo de morador, telefone, email
- O que acontece apos o envio (aguardar aprovacao da administracao)

**3. Login e Recuperacao de Senha**
- Como fazer login em `/auth`
- Como recuperar a senha (fluxo "Esqueceu sua senha?")
- Alteracao de senha temporaria no primeiro acesso

**4. Area do Morador**
- Resumo: visao geral com avisos e atalhos
- Avisos: como consultar avisos activos
- Pagamentos: como visualizar taxas condominiais e efectuar pagamentos
- Transacoes: historico de pagamentos
- Reservas: como aceder ao sistema de reservas
- Documentos: como aceder ao arquivo de documentos

**5. Sistema de Reservas**
- Como criar uma nova reserva (seleccionar area, data, horario)
- Regras obrigatorias do Termo de Uso (as 6 condicoes)
- Checkbox de aceitacao obrigatoria
- Como consultar e cancelar reservas existentes

**6. Marketplace**
- Como navegar e filtrar servicos por categoria
- Como ver detalhes e contactar empreendedores
- Como cadastrar o seu proprio servico em `/marketplace/cadastrar`

**7. Painel Administrativo (apenas para administradores)**
- Dashboard: visao geral com estatisticas
- Imoveis: gestao de propriedades
- Avisos: criar, editar e eliminar avisos
- Taxas: lancamento de taxas e envio de notificacoes
- Reservas: aprovar, confirmar ou cancelar reservas
- Marketplace: aprovar ou rejeitar servicos
- Noticias: publicar e gerir noticias
- Documentos: upload e gestao de documentos
- Estatisticas: downloads de documentos
- Moradores: lista completa com dados de registo
- Pedidos de Acesso: aprovar ou rejeitar pedidos
- Administradores: atribuir permissoes de admin

## Detalhes Tecnicos

- **Novo ficheiro**: `src/pages/UserGuidePage.tsx`
- **Rota**: `/guia` adicionada em `src/App.tsx`
- **Componentes utilizados**: Navbar, Footer, Accordion (para seccoes expansiveis), Card, Badge
- **Link no Navbar**: Adicionado item "Guia" no menu de navegacao em `src/components/Navbar.tsx`
- Pagina totalmente estatica (sem chamadas a base de dados)
- Icones do `lucide-react` para cada seccao
- Design consistente com o resto do portal

