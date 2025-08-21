// Storage key
const LS_EVENTS = "campus_events_v2";

// Load + Save
const loadEvents = () => JSON.parse(localStorage.getItem(LS_EVENTS) || "[]");
const saveEvents = (evts) => localStorage.setItem(LS_EVENTS, JSON.stringify(evts));

// Theme Toggle
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  const html = document.documentElement;
  themeToggle.addEventListener("click", () => {
    html.classList.toggle("dark");
    themeToggle.textContent = html.classList.contains("dark") ? "☀" : "🌙";
  });
}
// const html = document.documentElement;
//     const themeToggle = $('#themeToggle');
//     const themeIcon = $('#themeIcon');

//     const setTheme = (mode) => {
//       if (mode === 'dark') html.classList.add('dark');
//       else html.classList.remove('dark');
//       localStorage.setItem(LS_THEME, mode);
//       themeIcon.textContent = mode === 'dark' ? '🌞' : '🌙';
//     };

//     const initTheme = () => {
//       const saved = localStorage.getItem(LS_THEME);
//       if (saved) setTheme(saved);
//       else setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
//     };

//     themeToggle.addEventListener('click', () => {
//       setTheme(html.classList.contains('dark') ? 'light' : 'dark');
//     });

// ADD / EDIT PAGE
const form = document.getElementById("eventForm");
if (form) {
  const editData = JSON.parse(localStorage.getItem("editEvent"));
  if (editData) {
    document.getElementById("title").value = editData.title;
    document.getElementById("date").value = editData.date;
    document.getElementById("desc").value = editData.desc;
    localStorage.removeItem("editEvent");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const events = loadEvents();

    const file = document.getElementById("image").files[0];
    let imageData = editData?.image || "";
    if (file) {
      imageData = await new Promise((res) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.readAsDataURL(file);
      });
    }

    if (editData) {
      // update existing event
      const idx = events.findIndex(ev => ev.id === editData.id);
      events[idx] = { ...editData,
        title: document.getElementById("title").value.trim(),
        date: document.getElementById("date").value,
        desc: document.getElementById("desc").value.trim(),
        image: imageData
      };
    } else {
      // new event
      const newEvent = {
        id: Date.now().toString(),
        title: document.getElementById("title").value.trim(),
        date: document.getElementById("date").value,
        desc: document.getElementById("desc").value.trim(),
        image: imageData,
      };
      events.push(newEvent);
    }

    saveEvents(events);
    form.reset();
    alert("✅ Event saved!");
  });
}

// BROWSE PAGE
const eventGrid = document.getElementById("eventGrid");
if (eventGrid) {
  const renderEvents = (filter = "") => {
    const events = loadEvents()
      .filter(ev => ev.title.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    eventGrid.innerHTML = "";
    document.getElementById("emptyState").classList.toggle("hidden", events.length > 0);

    events.forEach(ev => {
      const card = document.createElement("div");
      card.className = "rounded-xl border bg-white/80 dark:bg-slate-900/80 shadow hover:shadow-lg transition overflow-hidden";
      card.innerHTML = `
        <img src="${ev.image || 'https://via.placeholder.com/400x200?text=Event'}" class="w-full h-40 object-cover"/>
        <div class="p-4">
          <h3 class="font-semibold">${ev.title}</h3>
          <p class="text-sm text-slate-500">${ev.date}</p>
          <p class="text-sm mt-1 line-clamp-2">${ev.desc}</p>
          <div class="flex gap-2 mt-3">
            <button data-id="${ev.id}" class="viewBtn px-3 py-1 rounded bg-indigo-600 text-white">View</button>
            <button data-id="${ev.id}" class="editBtn px-3 py-1 rounded bg-yellow-500 text-white">Edit</button>
            <button data-id="${ev.id}" class="deleteBtn px-3 py-1 rounded bg-red-600 text-white">Delete</button>
          </div>
        </div>`;
      eventGrid.appendChild(card);
    });

    // Bind buttons
    document.querySelectorAll(".viewBtn").forEach(btn => {
      btn.addEventListener("click", () => openModal(btn.dataset.id));
    });
    document.querySelectorAll(".deleteBtn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        let events = loadEvents().filter(e => e.id !== id);
        saveEvents(events);
        renderEvents();
      });
    });
    document.querySelectorAll(".editBtn").forEach(btn => {
      btn.addEventListener("click", () => {
        const ev = loadEvents().find(e => e.id === btn.dataset.id);
        localStorage.setItem("editEvent", JSON.stringify(ev));
        window.location.href = "add.html";
      });
    });
  };

  // Modal
  const modal = document.getElementById("modal");
  const closeModal = document.getElementById("closeModal");
  const openModal = (id) => {
    const ev = loadEvents().find(e => e.id === id);
    if (!ev) return;
    document.getElementById("modalTitle").textContent = ev.title;
    document.getElementById("modalDate").textContent = ev.date;
    document.getElementById("modalDesc").textContent = ev.desc;
    document.getElementById("modalImage").src = ev.image || "https://via.placeholder.com/400x200?text=Event";
    modal.classList.remove("hidden");
  };
  closeModal.addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.classList.add("hidden"); });

  // Search
  document.getElementById("nameSearch").addEventListener("input", (e) => renderEvents(e.target.value));
  renderEvents();
}