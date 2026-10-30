/**
 * ==============================================================================
 * APLICAÇÃO DE LISTA DE TAREFAS (TODO LIST)
 * 
 * Conceitos aplicados aqui:
 * 1. Seleção de elementos do DOM (HTML)
 * 2. Estado da aplicação (uma lista de objetos em memória)
 * 3. Manipulação de eventos (escutar cliques e envios de formulário)
 * 4. Renderização dinâmica (criar HTML com base nos dados)
 * 5. Armazenamento local (LocalStorage para não perder tarefas ao recarregar a página)
 * ==============================================================================
 */

// 1. SELEÇÃO DE ELEMENTOS DO HTML
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCounter = document.getElementById("task-counter");
const emptyState = document.getElementById("empty-state");
const filterButtons = document.querySelectorAll(".filter-btn");

// 2. ESTADO DA APLICAÇÃO
// 'tarefas' guarda a lista de objetos, ex: [{ id: 1234, texto: "Estudar HTML", concluida: false }]
let tarefas = [];
let filtroAtual = "all"; // Pode ser: 'all', 'pending' ou 'completed'

// 3. PERSISTÊNCIA DE DADOS (LOCALSTORAGE)
// O LocalStorage é uma memória do navegador que guarda textos simples mesmo se fechar a página.
function carregarTarefasDoLocalStorage() {
  const dadosSalvos = localStorage.getItem("minhas_tarefas");
  if (dadosSalvos) {
    tarefas = JSON.parse(dadosSalvos);
  }
}

function salvarTarefasNoLocalStorage() {
  localStorage.setItem("minhas_tarefas", JSON.stringify(tarefas));
}

// 4. FUNÇÕES PRINCIPAIS (LÓGICA DO NEGÓCIO)

/**
 * Adiciona uma nova tarefa ao array
 */
function adicionarTarefa(texto) {
  const novaTarefa = {
    id: Date.now() + Math.random(), // Gera um identificador único mesmo em adições rápidas
    texto: texto.trim(),
    concluida: false
  };

  // Adiciona a nova tarefa no início da lista
  tarefas.unshift(novaTarefa);

  salvarTarefasNoLocalStorage();
  renderizar();
}

/**
 * Alterna entre concluída e pendente
 */
function alternarStatusTarefa(id) {
  // Percorre a lista e inverte o valor de 'concluida' para o item com o id correspondente
  tarefas = tarefas.map((tarefa) => {
    if (tarefa.id === id) {
      return { ...tarefa, concluida: !tarefa.concluida };
    }
    return tarefa;
  });

  salvarTarefasNoLocalStorage();
  renderizar();
}

/**
 * Remove uma tarefa da lista pelo ID
 */
function removerTarefa(id) {
  // Filtra mantendo apenas as tarefas que têm ID diferente do que queremos remover
  tarefas = tarefas.filter((tarefa) => tarefa.id !== id);

  salvarTarefasNoLocalStorage();
  renderizar();
}

// 5. RENDERIZAÇÃO NA TELA (ATUALIZA O HTML)
function renderizar() {
  // Limpa a lista atual na tela antes de desenhar os itens
  taskList.innerHTML = "";

  // Filtra as tarefas de acordo com o botão selecionado
  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtroAtual === "pending") return !tarefa.concluida;
    if (filtroAtual === "completed") return tarefa.concluida;
    return true; // 'all' retorna todas
  });

  // Exibe ou oculta a mensagem de lista vazia
  if (tarefasFiltradas.length === 0) {
    emptyState.classList.add("visible");
  } else {
    emptyState.classList.remove("visible");
  }

  // Cria os elementos visuais para cada tarefa
  tarefasFiltradas.forEach((tarefa) => {
    const li = document.createElement("li");
    li.className = `task-item ${tarefa.concluida ? "completed" : ""}`;

    // Lado esquerdo: checkbox, texto e etiqueta de status
    const leftDiv = document.createElement("div");
    leftDiv.className = "task-item-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = tarefa.concluida;
    checkbox.addEventListener("change", () => alternarStatusTarefa(tarefa.id));

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = tarefa.texto;

    // Etiqueta visual indicando claramente o status da tarefa
    const statusBadge = document.createElement("span");
    statusBadge.className = `status-badge ${tarefa.concluida ? "badge-completed" : "badge-pending"}`;
    statusBadge.textContent = tarefa.concluida ? "Concluída ✓" : "Pendente";

    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(span);
    leftDiv.appendChild(statusBadge);

    // Lado direito: botão de remover
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = "&times;"; // Símbolo '×' elegante
    deleteBtn.setAttribute("title", "Remover tarefa");
    deleteBtn.addEventListener("click", () => removerTarefa(tarefa.id));

    // Monta o item completo
    li.appendChild(leftDiv);
    li.appendChild(deleteBtn);

    // Adiciona o item à lista no HTML
    taskList.appendChild(li);
  });

  // Atualiza o contador de pendências
  const totalPendentes = tarefas.filter((t) => !t.concluida).length;
  taskCounter.textContent = `${totalPendentes} ${totalPendentes === 1 ? "pendente" : "pendentes"}`;
}

// 6. EVENTOS DO USUÁRIO

// Evento disparado ao enviar o formulário (clicar em Adicionar ou apertar Enter)
taskForm.addEventListener("submit", (evento) => {
  evento.preventDefault(); // Impede o recarregamento padrão da página

  const texto = taskInput.value;
  if (texto.trim() !== "") {
    adicionarTarefa(texto);
    taskInput.value = ""; // Limpa o campo de texto
    taskInput.focus();   // Devolve o cursor para o campo de texto
  }
});

// Eventos de clique nos botões de filtro (Todas, Pendentes, Concluídas)
filterButtons.forEach((botao) => {
  botao.addEventListener("click", () => {
    // Remove a classe 'active' de todos e adiciona no botão clicado
    filterButtons.forEach((b) => b.classList.remove("active"));
    botao.classList.add("active");

    // Atualiza a variável de filtro e redesenha a tela
    filtroAtual = botao.dataset.filter;
    renderizar();
  });
});

// 7. INICIALIZAÇÃO
// Quando o script carrega, lê os dados salvos e exibe na tela
carregarTarefasDoLocalStorage();
renderizar();
