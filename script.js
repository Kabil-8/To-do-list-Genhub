let tasks = [];

const taskInput = document.getElementById("taskInput");
const descInput = document.getElementById("descInput");
const endDateInput = document.getElementById("endDate");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");
const filter = document.getElementById("filter");
const sort = document.getElementById("sort");
const toggleDark = document.getElementById("toggleDark");
const voiceBtn = document.getElementById("voiceBtn");

function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  window.speechSynthesis.speak(msg);
}

function listenForTask() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    taskInput.value = transcript;
    speak(`You said: ${transcript}`);
  };
}

function showPopup(message) {
  const popup = document.getElementById("popup");
  const msg = document.getElementById("popup-message");
  msg.textContent = message;
  popup.classList.remove("hidden");
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}

function addTask() {
  const name = taskInput.value.trim();
  const desc = descInput.value.trim();
  const end = endDateInput.value;
  const priority = priorityInput.value;
  if (!name || !end) {
    showPopup("Task name and end date are required.");
    return;
  }

  const task = {
    id: Date.now(),
    name,
    desc,
    end,
    priority,
    completed: false,
    created: new Date().toISOString()
  };

  tasks.push(task);
  speak(`Task ${name} added.`);
  scheduleReminder(task);
  renderTasks();
  taskInput.value = descInput.value = endDateInput.value = "";
}

function renderTasks() {
  const f = filter.value;
  const s = sort.value;
  let list = [...tasks];

  if (f === "completed") list = list.filter(t => t.completed);
  if (f === "pending") list = list.filter(t => !t.completed);

  if (s === "date") list.sort((a, b) => new Date(a.end) - new Date(b.end));
  if (s === "priority") {
    const order = { High: 1, Medium: 2, Low: 3 };
    list.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  taskList.innerHTML = "";
  list.forEach(t => {
    const li = document.createElement("li");
    li.className = "task-item" + (t.completed ? " completed" : "");

    li.innerHTML = `
      <strong>${t.name}</strong>
      <small>${t.desc}</small>
      <div class="task-meta">
        <span>🕒 ${new Date(t.end).toLocaleString()}</span>
        <span>⚡ ${t.priority}</span>
      </div>
      <div class="task-actions">
        <button onclick="toggleComplete(${t.id})">✔️</button>
        <button class="delete-btn" onclick="deleteTask(${t.id})">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function toggleComplete(id) {
  const t = tasks.find(t => t.id === id);
  t.completed = !t.completed;
  speak(`Marked ${t.name} as ${t.completed ? "completed" : "pending"}.`);
  renderTasks();
}

function deleteTask(id) {
  const t = tasks.find(t => t.id === id);
  showPopup(`Are you sure to delete '${t.name}'?`);
  tasks = tasks.filter(t => t.id !== id);
  speak(`Task ${t.name} deleted.`);
  renderTasks();
}

function scheduleReminder(task) {
  const time = new Date(task.end).getTime() - Date.now() - 60000;
  if (time > 0) {
    setTimeout(() => {
      speak(`Reminder: Task ${task.name} is due in 1 minute.`);
      showPopup(`Reminder: Task '${task.name}' is due in 1 minute!`);
    }, time);
  }
}

document.getElementById("addBtn").addEventListener("click", addTask);
voiceBtn.addEventListener("click", listenForTask);
filter.addEventListener("change", renderTasks);
sort.addEventListener("change", renderTasks);
toggleDark.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  updateDarkModeIcon();
});

function updateDarkModeIcon() {
  const heading = document.getElementById("mainHeading");
  if (document.body.classList.contains("dark")) {
    toggleDark.textContent = "☀️";
    heading.style.color = "white";
    localStorage.setItem("theme", "dark");
  } else {
    toggleDark.textContent = "🌙";
    heading.style.color = "black";
    localStorage.setItem("theme", "light");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
  updateDarkModeIcon();
});
