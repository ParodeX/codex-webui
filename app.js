const storageKey = "codex-console-state-v1";

const initialState = {
  activeProjectId: "proj-codex",
  activeChatId: "chat-start",
  projects: [
    {
      id: "proj-codex",
      name: "Codex Web UI",
      path: "~/projects/codex-webui",
      notes: "Lokaler Prototyp fuer eine Bedienoberflaeche."
    },
    {
      id: "proj-demo",
      name: "Demo Workspace",
      path: "C:\\Users\\Du\\Projekte\\demo",
      notes: ""
    }
  ],
  chats: [
    {
      id: "chat-start",
      projectId: "proj-codex",
      title: "Startsession",
      messages: [
        {
          role: "system",
          text: "Codex Console bereit. Tippe /help fuer lokale Befehle."
        },
        {
          role: "codex",
          text: "Diese UI speichert Projekte, Chats und Notizen lokal im Browser. Eine echte Codex-Anbindung braucht spaeter einen kleinen Backend-Prozess, der API- oder CLI-Aufrufe ausfuehrt."
        }
      ]
    },
    {
      id: "chat-demo",
      projectId: "proj-demo",
      title: "Windows CLI Look",
      messages: [
        {
          role: "user",
          text: "Zeige mir meine Projekte."
        },
        {
          role: "codex",
          text: "Links siehst du Projekte, darunter die passenden Chats. Rechts stehen Status, Schnellbefehle und Notizen."
        }
      ]
    }
  ]
};

let state = loadState();

const projectList = document.querySelector("#projectList");
const chatList = document.querySelector("#chatList");
const messages = document.querySelector("#messages");
const commandForm = document.querySelector("#commandForm");
const commandInput = document.querySelector("#commandInput");
const projectTitle = document.querySelector("#projectTitle");
const chatTitle = document.querySelector("#chatTitle");
const workspacePath = document.querySelector("#workspacePath");
const messageCount = document.querySelector("#messageCount");
const notes = document.querySelector("#notes");
const exportDialog = document.querySelector("#exportDialog");
const exportText = document.querySelector("#exportText");

document.querySelector("#newProjectBtn").addEventListener("click", addProject);
document.querySelector("#newChatBtn").addEventListener("click", addChat);
document.querySelector("#clearBtn").addEventListener("click", clearChat);
document.querySelector("#exportBtn").addEventListener("click", exportChat);
document.querySelectorAll("[data-command]").forEach((button) => {
  button.addEventListener("click", () => {
    commandInput.value = button.dataset.command;
    commandInput.focus();
  });
});

notes.addEventListener("input", () => {
  const project = getActiveProject();
  project.notes = notes.value;
  saveState();
});

commandForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = commandInput.value.trim();
  if (!text) return;

  addMessage("user", text);
  commandInput.value = "";
  handleCommand(text);
});

render();

function loadState() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return structuredClone(initialState);

  try {
    return JSON.parse(raw);
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function getActiveProject() {
  return state.projects.find((project) => project.id === state.activeProjectId) || state.projects[0];
}

function getProjectChats(projectId = state.activeProjectId) {
  return state.chats.filter((chat) => chat.projectId === projectId);
}

function getActiveChat() {
  return state.chats.find((chat) => chat.id === state.activeChatId) || getProjectChats()[0];
}

function render() {
  const project = getActiveProject();
  const chat = getActiveChat();

  state.activeProjectId = project.id;
  state.activeChatId = chat.id;

  projectTitle.textContent = project.name;
  chatTitle.textContent = chat.title;
  workspacePath.textContent = project.path;
  notes.value = project.notes || "";
  messageCount.textContent = String(chat.messages.length);

  renderProjects();
  renderChats();
  renderMessages(chat);
  saveState();
}

function renderProjects() {
  projectList.replaceChildren(...state.projects.map((project) => {
    const button = document.createElement("button");
    button.className = `list-item${project.id === state.activeProjectId ? " active" : ""}`;
    button.innerHTML = `<strong></strong><small></small>`;
    button.querySelector("strong").textContent = project.name;
    button.querySelector("small").textContent = project.path;
    button.addEventListener("click", () => {
      state.activeProjectId = project.id;
      const firstChat = getProjectChats(project.id)[0] || createChat(project.id);
      state.activeChatId = firstChat.id;
      render();
    });
    return button;
  }));
}

function renderChats() {
  const chatButtons = getProjectChats().map((chat) => {
    const last = chat.messages.at(-1)?.text || "Keine Nachrichten";
    const button = document.createElement("button");
    button.className = `list-item${chat.id === state.activeChatId ? " active" : ""}`;
    button.innerHTML = `<strong></strong><small></small>`;
    button.querySelector("strong").textContent = chat.title;
    button.querySelector("small").textContent = last.slice(0, 58);
    button.addEventListener("click", () => {
      state.activeChatId = chat.id;
      render();
    });
    return button;
  });

  chatList.replaceChildren(...chatButtons);
}

function renderMessages(chat) {
  messages.replaceChildren(...chat.messages.map((message) => {
    const row = document.createElement("article");
    row.className = `message ${message.role}`;
    row.innerHTML = `<span class="role"></span><pre></pre>`;
    row.querySelector(".role").textContent = message.role;
    row.querySelector("pre").textContent = message.text;
    return row;
  }));
  messages.scrollTop = messages.scrollHeight;
}

function addMessage(role, text) {
  getActiveChat().messages.push({ role, text });
  saveState();
  render();
}

function handleCommand(text) {
  const normalized = text.toLowerCase();

  if (normalized === "/help") {
    addMessage("codex", [
      "Lokale Befehle:",
      "/help - Befehle anzeigen",
      "/project NAME - Projekt anlegen",
      "/chat NAME - Chat anlegen",
      "/clear - aktuellen Chat leeren",
      "",
      "Normale Texte werden als Chatnachricht gespeichert. Fuer echte Codex-Ausfuehrung braucht diese UI ein Backend."
    ].join("\n"));
    return;
  }

  if (normalized === "/clear") {
    clearChat();
    return;
  }

  if (normalized.startsWith("/project ")) {
    addProject(text.slice(9).trim());
    return;
  }

  if (normalized.startsWith("/chat ")) {
    addChat(text.slice(6).trim());
    return;
  }

  addMessage("codex", `Aufgabe gespeichert: "${text}"\n\nNaechster Ausbauschritt: Diese Nachricht an einen lokalen Codex-Bridge-Service senden und die Antwort hier streamen.`);
}

function addProject(nameFromCommand) {
  const name = typeof nameFromCommand === "string" && nameFromCommand
    ? nameFromCommand
    : prompt("Projektname");
  if (!name) return;

  const id = `proj-${Date.now()}`;
  state.projects.push({
    id,
    name,
    path: `~/projects/${slugify(name)}`,
    notes: ""
  });
  state.activeProjectId = id;
  state.activeChatId = createChat(id).id;
  render();
}

function addChat(titleFromCommand) {
  const title = typeof titleFromCommand === "string" && titleFromCommand
    ? titleFromCommand
    : prompt("Chatname");
  if (!title) return;

  const chat = createChat(state.activeProjectId, title);
  state.activeChatId = chat.id;
  render();
}

function createChat(projectId, title = "Neue Session") {
  const chat = {
    id: `chat-${Date.now()}-${Math.round(Math.random() * 999)}`,
    projectId,
    title,
    messages: [
      {
        role: "system",
        text: "Neue Codex Session angelegt."
      }
    ]
  };
  state.chats.push(chat);
  return chat;
}

function clearChat() {
  const chat = getActiveChat();
  chat.messages = [
    {
      role: "system",
      text: "Chat geleert."
    }
  ];
  render();
}

function exportChat() {
  const project = getActiveProject();
  const chat = getActiveChat();
  exportText.value = [
    `Projekt: ${project.name}`,
    `Pfad: ${project.path}`,
    `Chat: ${chat.title}`,
    "",
    ...chat.messages.map((message) => `[${message.role}] ${message.text}`)
  ].join("\n");
  exportDialog.showModal();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "projekt";
}
