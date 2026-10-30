# 📝 Aplicação de Lista de Tarefas (To-Do List)

Bem-vindo ao seu projeto de lista de tarefas! Esta aplicação foi criada com as tecnologias fundamentais da web (**HTML5**, **CSS3** e **JavaScript puro/Vanilla**), sem ferramentas complexas ou bibliotecas externas.

---

## 📂 Estrutura de Arquivos

O projeto está organizado com uma clara separação de responsabilidades:

```
lista-de-tarefas/
├── index.html   # Estrutura e esqueleto da aplicação
├── style.css    # Estilo visual, cores, espaçamento e responsividade
├── script.js    # Lógica, interatividade e armazenamento
├── test.js      # Suíte de testes automatizados (Node.js nativo)
└── README.md    # Guia explicativo do projeto
```

---

## 🧠 Como os Componentes Funcionam Juntos

### 1. `index.html` (O Esqueleto)
- Define quais elementos aparecem na tela:
  - Título e cabeçalho.
  - Formulário com campo de texto (`<input>`) e botão de envio (`<button>`).
  - Barra de contagem e botões de filtro (Todas, Pendentes, Concluídas).
  - A lista (`<ul id="task-list">`) onde as tarefas serão colocadas dinamicamente.
- Vincula o estilo (`style.css`) e o código de ação (`script.js`).

### 2. `style.css` (A Roupa / Aparência)
- Define a identidade visual: cores modernas, sombras suaves e fontes limpas.
- Usa **Flexbox** para alinhar os botões e itens de forma harmoniosa.
- Contém regras especiais para quando uma tarefa está concluída (risca o texto e reduz a opacidade).

### 3. `script.js` (O Cérebro / Interatividade)
Este arquivo é dividido em 5 etapas didáticas:
1. **Seleção de Elementos:** Captura os botões, campos de texto e listas do HTML para que o JavaScript consiga interagir com eles (`document.getElementById`).
2. **Estado (`tarefas = []`):** Guarda a lista de tarefas na memória do programa como objetos JavaScript (`{ id, texto, concluida }`).
3. **Persistência (`localStorage`):** Salva as tarefas no próprio navegador para que nada se perca ao fechar ou recarregar a página.
4. **Funções Principais:**
   - `adicionarTarefa()`: Cria uma nova tarefa com id único.
   - `alternarStatusTarefa()`: Marca ou desmarca a tarefa como concluída.
   - `removerTarefa()`: Exclui uma tarefa da lista.
   - `renderizar()`: Pega a lista de dados e gera o HTML correspondente na tela.
5. **Eventos do Usuário:** Ouve o envio do formulário (`submit`) e cliques nos botões de filtro.

---

## 🚀 Como Executar o Projeto

Você não precisa instalar nenhum programa adicional nem usar comandos complexos no terminal:

1. Navegue até a pasta do projeto:
   `C:\Users\conra\.gemini\antigravity\scratch\lista-de-tarefas`
2. Dê **dois cliques** no arquivo `index.html`.
3. Ele abrirá diretamente no seu navegador padrão (Chrome, Edge, Firefox, etc.) pronto para uso!

---

## 🧪 Como Rodar os Testes Automatizados

O projeto inclui uma suíte completa de testes que valida cada funcionalidade de forma automatizada:

1. Abra um terminal na pasta do projeto.
2. Execute o comando:
   ```bash
   node --test test.js
   ```
3. O terminal executará todos os testes e mostrará o relatório com `✔` para cada funcionalidade aprovada!

---

## 💡 Próximos Passos para Seus Estudos

Conforme você for avançando nos seus estudos, tente fazer pequenas modificações para praticar:
- [ ] Mudar as cores no início do `style.css` (na seção `:root`).
- [ ] Adicionar um botão para "Limpar todas as tarefas concluídas".
- [ ] Permitir editar o texto de uma tarefa já criada.
- [ ] Adicionar uma data limite ou prioridade (baixa, média, alta) para cada tarefa.
