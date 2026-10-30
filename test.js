/**
 * ==============================================================================
 * SUÍTE DE TESTES AUTOMATIZADOS (TEST.JS)
 * 
 * Executa testes de ponta a ponta simulando o ambiente do navegador (DOM e LocalStorage).
 * Utiliza o executor de testes nativo do Node.js (node:test e node:assert).
 * ==============================================================================
 */

const { test, describe, beforeEach } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Caminhos dos arquivos
const htmlPath = path.join(__dirname, "index.html");
const cssPath = path.join(__dirname, "style.css");
const jsPath = path.join(__dirname, "script.js");

describe("1. Testes de Integridade de Arquivos e Estrutura", () => {
  test("index.html deve existir e conter os elementos essenciais", () => {
    assert.ok(fs.existsSync(htmlPath), "index.html não foi encontrado");
    const htmlContent = fs.readFileSync(htmlPath, "utf-8");

    // Validação dos IDs que o JavaScript precisa encontrar
    assert.match(htmlContent, /id="task-form"/, "Falta o elemento #task-form");
    assert.match(htmlContent, /id="task-input"/, "Falta o elemento #task-input");
    assert.match(htmlContent, /id="task-list"/, "Falta o elemento #task-list");
    assert.match(htmlContent, /id="task-counter"/, "Falta o elemento #task-counter");
    assert.match(htmlContent, /id="empty-state"/, "Falta o elemento #empty-state");
    assert.match(htmlContent, /class="filter-btn/i, "Faltam os botões de filtro");
  });

  test("style.css deve conter as regras visuais para tarefas concluídas e badges", () => {
    assert.ok(fs.existsSync(cssPath), "style.css não foi encontrado");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    assert.match(cssContent, /\.task-item\.completed/, "Falta a regra para .task-item.completed");
    assert.match(cssContent, /line-through/, "Falta a propriedade line-through para tarefas concluídas");
    assert.match(cssContent, /\.status-badge/, "Falta a classe .status-badge");
    assert.match(cssContent, /\.badge-completed/, "Falta a classe .badge-completed");
    assert.match(cssContent, /\.badge-pending/, "Falta a classe .badge-pending");
  });
});

class MockClassList {
  constructor() {
    this.classes = new Set();
  }
  add(...names) {
    names.forEach((n) => this.classes.add(n));
  }
  remove(...names) {
    names.forEach((n) => this.classes.delete(n));
  }
  contains(name) {
    return this.classes.has(name);
  }
  has(name) {
    return this.classes.has(name);
  }
  toggle(name) {
    if (this.classes.has(name)) {
      this.classes.delete(name);
      return false;
    } else {
      this.classes.add(name);
      return true;
    }
  }
  toString() {
    return Array.from(this.classes).join(" ");
  }
}

// Simulação leve e completa do DOM do Navegador para o script.js
class MockElement {
  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.classList = new MockClassList();
    this.attributes = {};
    this.listeners = {};
    this.value = "";
    this.textContent = "";
    this.checked = false;
    this.type = "";
    this.dataset = {};
  }

  get className() {
    return this.classList.toString();
  }

  set className(val) {
    this.classList = new MockClassList();
    if (val) {
      val.split(" ").filter(Boolean).forEach((cls) => this.classList.add(cls));
    }
  }

  get innerHTML() {
    return "";
  }

  set innerHTML(val) {
    if (val === "") {
      this.children = [];
    }
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  addEventListener(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  dispatchEvent(event, payload = {}) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(payload));
    }
  }

  focus() {}
}

describe("2. Testes Funcionais da Aplicação (script.js)", () => {
  let context;
  let mockStorage = {};

  beforeEach(() => {
    mockStorage = {};

    // Criamos os elementos do index.html no ambiente simulado
    const taskForm = new MockElement("form");
    const taskInput = new MockElement("input");
    const taskList = new MockElement("ul");
    const taskCounter = new MockElement("span");
    const emptyState = new MockElement("div");

    const btnAll = new MockElement("button");
    btnAll.className = "filter-btn active";
    btnAll.dataset.filter = "all";

    const btnPending = new MockElement("button");
    btnPending.className = "filter-btn";
    btnPending.dataset.filter = "pending";

    const btnCompleted = new MockElement("button");
    btnCompleted.className = "filter-btn";
    btnCompleted.dataset.filter = "completed";

    const filterButtons = [btnAll, btnPending, btnCompleted];

    const elementsById = {
      "task-form": taskForm,
      "task-input": taskInput,
      "task-list": taskList,
      "task-counter": taskCounter,
      "empty-state": emptyState,
    };

    const documentMock = {
      getElementById: (id) => elementsById[id] || null,
      querySelectorAll: (sel) => {
        if (sel === ".filter-btn") return filterButtons;
        return [];
      },
      createElement: (tag) => new MockElement(tag),
    };

    const localStorageMock = {
      getItem: (key) => mockStorage[key] || null,
      setItem: (key, val) => {
        mockStorage[key] = val;
      },
      clear: () => {
        mockStorage = {};
      },
    };

    // Montamos o contexto global simulado
    context = {
      document: documentMock,
      localStorage: localStorageMock,
      JSON,
      Date,
      console,
      setTimeout,
      clearTimeout,
    };

    vm.createContext(context);
    const scriptCode = fs.readFileSync(jsPath, "utf-8");
    vm.runInContext(scriptCode, context);
  });

  test("Estado inicial deve exibir mensagem de lista vazia e 0 tarefas pendentes", () => {
    const emptyState = context.document.getElementById("empty-state");
    const taskCounter = context.document.getElementById("task-counter");

    assert.ok(emptyState.classList.has("visible"), "O estado vazio deveria estar visível");
    assert.strictEqual(taskCounter.textContent, "0 pendentes");
  });

  test("Adicionar tarefa: deve atualizar a lista, o contador e o LocalStorage", () => {
    // Chama a função adicionarTarefa
    context.adicionarTarefa("Estudar JavaScript");

    const taskList = context.document.getElementById("task-list");
    const taskCounter = context.document.getElementById("task-counter");
    const emptyState = context.document.getElementById("empty-state");

    // Validações
    assert.strictEqual(taskList.children.length, 1, "Deveria haver 1 item na lista");
    assert.strictEqual(taskCounter.textContent, "1 pendente", "Contador deveria indicar 1 pendente");
    assert.ok(!emptyState.classList.has("visible"), "Estado vazio não deve estar visível");

    // Verifica se salvou no LocalStorage
    assert.ok(mockStorage["minhas_tarefas"], "Deveria ter salvo no LocalStorage");
    const tarefasSalvas = JSON.parse(mockStorage["minhas_tarefas"]);
    assert.strictEqual(tarefasSalvas.length, 1);
    assert.strictEqual(tarefasSalvas[0].texto, "Estudar JavaScript");
    assert.strictEqual(tarefasSalvas[0].concluida, false);

    // Verifica a etiqueta visual (Pendente)
    const li = taskList.children[0];
    const leftDiv = li.children[0];
    const statusBadge = leftDiv.children[2];
    assert.strictEqual(statusBadge.textContent, "Pendente");
    assert.ok(statusBadge.classList.has("badge-pending"));
    assert.ok(!li.classList.has("completed"));
  });

  const getTarefasSalvas = () => JSON.parse(mockStorage["minhas_tarefas"] || "[]");

  test("Concluir tarefa: deve alterar para concluída com estilo visual correto e atualizar contador", () => {
    context.adicionarTarefa("Fazer compras");
    const tarefas = getTarefasSalvas();
    assert.strictEqual(tarefas.length, 1);

    const taskList = context.document.getElementById("task-list");
    const taskCounter = context.document.getElementById("task-counter");
    const li = taskList.children[0];
    const leftDiv = li.children[0];
    const checkbox = leftDiv.children[0];
    const statusBadge = leftDiv.children[2];

    // Simula o usuário clicando no checkbox para concluir
    checkbox.dispatchEvent("change");

    // Validações no estado salvo e no DOM
    const tarefasAposConclusao = getTarefasSalvas();
    assert.strictEqual(tarefasAposConclusao[0].concluida, true, "A tarefa deveria estar concluída");
    
    // Como a renderização recria os nós da lista, pegamos o novo item renderizado
    const novoLi = taskList.children[0];
    const novoLeftDiv = novoLi.children[0];
    const novoCheckbox = novoLeftDiv.children[0];
    const novoStatusBadge = novoLeftDiv.children[2];

    assert.strictEqual(novoCheckbox.checked, true, "O checkbox deve estar marcado");
    assert.ok(novoLi.classList.has("completed"), "O item li deve ter a classe .completed");
    assert.strictEqual(novoStatusBadge.textContent, "Concluída ✓");
    assert.ok(novoStatusBadge.classList.has("badge-completed"));
    assert.strictEqual(taskCounter.textContent, "0 pendentes", "Contador deve indicar 0 pendentes");

    // Simula o usuário clicando novamente no checkbox (para reabrir a tarefa)
    novoCheckbox.dispatchEvent("change");
    const tarefasAposReabrir = getTarefasSalvas();
    assert.strictEqual(tarefasAposReabrir[0].concluida, false);

    const liReaberto = taskList.children[0];
    assert.ok(!liReaberto.classList.has("completed"), "A classe .completed deve ter sido removida");
    assert.strictEqual(liReaberto.children[0].children[2].textContent, "Pendente");
    assert.strictEqual(taskCounter.textContent, "1 pendente");
  });

  test("Remover tarefa: deve excluir da lista e do LocalStorage", () => {
    context.adicionarTarefa("Tarefa 1");
    context.adicionarTarefa("Tarefa 2");
    assert.strictEqual(getTarefasSalvas().length, 2);

    const taskList = context.document.getElementById("task-list");
    // O primeiro botão de exclusão na tela
    const deleteBtn = taskList.children[0].children[1];
    deleteBtn.dispatchEvent("click");

    assert.strictEqual(getTarefasSalvas().length, 1);
    assert.strictEqual(taskList.children.length, 1);

    // Remove a última tarefa restante
    const deleteBtnUltima = taskList.children[0].children[1];
    deleteBtnUltima.dispatchEvent("click");

    assert.strictEqual(getTarefasSalvas().length, 0);
    const emptyState = context.document.getElementById("empty-state");
    assert.ok(emptyState.classList.has("visible"), "Deve voltar a exibir o estado vazio");
  });

  test("Filtros: deve exibir apenas itens correspondentes ao clicar nos botões de filtro", () => {
    context.adicionarTarefa("Tarefa Concluída");
    context.adicionarTarefa("Tarefa Pendente");

    const taskList = context.document.getElementById("task-list");
    // Marca a 'Tarefa Concluída' como concluída
    // Como unshift insere no início: children[0] é 'Tarefa Pendente', children[1] é 'Tarefa Concluída'
    const checkboxConcluida = taskList.children[1].children[0].children[0];
    checkboxConcluida.dispatchEvent("change");

    const filterButtons = context.document.querySelectorAll(".filter-btn");
    const btnAll = filterButtons[0];
    const btnPending = filterButtons[1];
    const btnCompleted = filterButtons[2];

    // Clica no filtro 'Pendentes'
    btnPending.dispatchEvent("click");
    assert.strictEqual(taskList.children.length, 1);
    assert.strictEqual(taskList.children[0].children[0].children[1].textContent, "Tarefa Pendente");

    // Clica no filtro 'Concluídas'
    btnCompleted.dispatchEvent("click");
    assert.strictEqual(taskList.children.length, 1);
    assert.strictEqual(taskList.children[0].children[0].children[1].textContent, "Tarefa Concluída");

    // Clica no filtro 'Todas'
    btnAll.dispatchEvent("click");
    assert.strictEqual(taskList.children.length, 2);
  });

  test("Formulário: não deve adicionar tarefas vazias ou só com espaços", () => {
    const taskInput = context.document.getElementById("task-input");
    const taskForm = context.document.getElementById("task-form");

    // Tentativa 1: texto vazio
    taskInput.value = "";
    taskForm.dispatchEvent("submit", { preventDefault: () => {} });
    assert.strictEqual(getTarefasSalvas().length, 0);

    // Tentativa 2: apenas espaços
    taskInput.value = "     ";
    taskForm.dispatchEvent("submit", { preventDefault: () => {} });
    assert.strictEqual(getTarefasSalvas().length, 0);

    // Tentativa 3: texto válido
    taskInput.value = "Aprender Testes Automatizados";
    taskForm.dispatchEvent("submit", { preventDefault: () => {} });
    assert.strictEqual(getTarefasSalvas().length, 1);
    assert.strictEqual(taskInput.value, "", "O campo de entrada deve ser limpo após o envio");
  });

  test("Persistência: deve recarregar tarefas do LocalStorage na inicialização", () => {
    // Gravamos tarefas fictícias diretamente no LocalStorage
    mockStorage["minhas_tarefas"] = JSON.stringify([
      { id: 101, texto: "Tarefa Existente 1", concluida: false },
      { id: 102, texto: "Tarefa Existente 2", concluida: true },
    ]);

    // Dispara a rotina de carga
    context.carregarTarefasDoLocalStorage();
    context.renderizar();

    const taskList = context.document.getElementById("task-list");
    const taskCounter = context.document.getElementById("task-counter");

    assert.strictEqual(taskList.children.length, 2);
    assert.strictEqual(taskCounter.textContent, "1 pendente");
    assert.ok(taskList.children[1].classList.has("completed"));
  });
});
