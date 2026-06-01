# Botequim na Mão 🍹

**Botequim na Mão** é uma aplicação web interativa e dinâmica focada no gerenciamento e exibição de um cardápio digital de um bar/botequim. A plataforma serve tanto aos clientes (que podem navegar pelas bebidas, adicionar ao carrinho e fazer pedidos) quanto à administração do estabelecimento (que pode gerenciar estoque, horário de funcionamento, catálogo de bebidas e pedidos em tempo real).

---

## 🚀 Funcionalidades

### Para o Cliente:
*   **Vitrine Interativa:** Visualização elegante do cardápio com filtros dinâmicos de bebidas.
*   **Detalhes do Produto:** Telas exclusivas para cada bebida, exibindo imagem, descrição e ingredientes necessários.
*   **Carrinho Inteligente:** Acompanhamento do cliente por todo o site através de um ícone flutuante persistente, que contabiliza itens agrupados.
*   **Checkout Rápido:** Possibilidade de enviar os pedidos diretamente para o bar com um clique, desde que o cliente esteja autenticado.
*   **Acompanhamento de Horários:** Verificação em tempo real (Home e Cabeçalho) informando se o botequim está aberto ou fechado no momento.

### Para a Administração (Gestão):
*   **Autenticação Restrita:** Painel seguro, acessível apenas por usuários com permissões de `admin`.
*   **Gestão de Bebidas:** Adição e edição de novos drinks no catálogo.
*   **Controle de Estoque Inteligente:** Capacidade de desativar ingredientes em falta. O sistema oculta automaticamente do cardápio final qualquer drink que utilize um ingrediente esgotado.
*   **Controle de Horários:** Definição dos dias e horas de funcionamento com sistema de **Trava de Emergência** (fechamento forçado).
*   **Painel de Pedidos (KDS - Kitchen Display System):** Recepção instantânea das comandas feitas pelos clientes. A equipe pode atualizar o status do pedido para "Em Preparação" (amarelo) e, posteriormente, "Finalizado" (verde), garantindo agilidade no balcão.

---

## 🛠 Tecnologias Utilizadas

Este projeto foi construído utilizando as bases fundamentais do desenvolvimento web, focando em performance, acessibilidade e responsividade sem a necessidade de frameworks pesados no backend.

*   **HTML5:** Estruturação semântica e acessível.
*   **CSS3 & Bootstrap 5.3.3:** Estilização baseada em utilitários e componentes prontos do Bootstrap, garantindo responsividade em dispositivos móveis, adaptado com regras próprias via `estilos.css`.
*   **Vanilla JavaScript (ES6+):** Lógica da aplicação concentrada inteiramente no front-end (`main.js`), manipulando o DOM e as regras de negócio de forma ágil e limpa.
*   **LocalStorage:** Simulação de banco de dados no navegador. Todas as receitas, horários, configurações de estoque, sessões de login e histórico de pedidos são salvos e resgatados localmente.

---

## 📂 Estrutura do Projeto

*   `index.html` — **Home:** Landing page apresentando o Botequim.
*   `sobre.html` — **O Botequim:** Página institucional contendo a história e mapa do local.
*   `cardapio.html` — **Cardápio:** Vitrine com os drinks gerados dinamicamente via JS.
*   `produto.html` — **Produto:** Tela de foco dedicada para as informações de uma única bebida.
*   `carrinho.html` — **Carrinho:** Carrinho de compras integrado para clientes logados finalizarem o pedido.
*   `login.html` — **Autenticação:** Porta de entrada para a simulação de usuários comuns e administradores (`admin`).
*   `gestao.html` — **Painel Administrativo:** Dashboard central da equipe do bar (drinks, estoque, horário, e KDS/pedidos).
*   `main.js` — **Motor da Aplicação:** Contém todos os algoritmos, ouvintes de eventos, inicializadores de página, funções de carrinho e manipulação de `localStorage`.
*   `estilos.css` — **Estilização Adicional:** Modificações pontuais e refinos estéticos (cores primárias, animações, ícones flutuantes, entre outros).
*   `documentacao/` — Pasta dedicada à documentação do projeto, como este arquivo.

---

## ⚙️ Como Executar

Por ser uma aplicação baseada inteiramente no lado do cliente (Client-Side), a execução é extremamente simples. 

1. Baixe os arquivos do projeto.
2. Abra o arquivo `index.html` em qualquer navegador web moderno (Google Chrome, Firefox, Safari).
3. Todo o sistema de navegação e banco de dados simulado funcionará diretamente a partir da leitura local do seu navegador. 

*(Dica: Para evitar problemas de CORS no carregamento de ícones ou JSONs, pode ser ideal rodar utilizando a extensão "Live Server" do VSCode).*
