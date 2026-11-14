const menuBtn    = document.getElementById("menuBtn");
const panelClose = document.getElementById("panelClose");
const overlay    = document.getElementById("overlay");
const panelList  = document.getElementById("panelList");
const modal      = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalBody  = document.getElementById("modalBody");

// Panel düğmeleri: How to Use, Dictionary, points.js'teki noktalar, EXTRA
const entries = [
  { label: HOWTO.title, text: HOWTO.text, images: HOWTO.images, howto: true },
  { label: "Dictionary", dictionary: true },
  ...POINTS.map(p => {
    const t = TEXTS[p.name] || {};
    return { label: p.name, text: t.text, images: t.images };
  }),
  ...EXTRA
];

entries.forEach(item => {
  const b = document.createElement("button");
  b.className = "menu-item" + (item.howto ? " howto" : "");
  b.textContent = item.label;
  b.addEventListener("click", () => {
    if (item.dictionary) openDictionary(item.label);
    else openModal(item.label, item.text || "Yazı", item.images || []);
  });
  panelList.appendChild(b);
});

function openPanel() {
  hidePopup();
  clearSelection();
  document.body.classList.add("panel-open");
}

function closePanel() {
  closeModal();
  document.body.classList.remove("panel-open");
}

function openModal(title, text, images) {
  modalTitle.textContent = title;
  modalBody.innerHTML = "";

  images.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    modalBody.appendChild(img);
  });

  const p = document.createElement("p");
  p.textContent = text;
  modalBody.appendChild(p);

  modal.classList.add("open");
}

function closeModal() { modal.classList.remove("open"); }

// ---------- SÖZLÜK ----------
let dictPromise = null;

// dictionary.txt'yi bir kez okur ve madde listesine çevirir
function loadDictionary() {
  if (!dictPromise) {
    dictPromise = fetch("dictionary.txt")
      .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      })
      .then(text => {
        text = text.replace(/^\uFEFF/, "").trim();
        let blocks = text.split(/\r?\n\s*\r?\n/);          // boş satırla ayrılmış maddeler
        if (blocks.length === 1) blocks = text.split(/\r?\n/);  // yoksa her satır bir madde
        return blocks.map(b => b.trim()).filter(Boolean);
      });
    dictPromise.catch(() => { dictPromise = null; });       // hata olursa tekrar denenebilsin
  }
  return dictPromise;
}

function showEntries(list, blocks, query) {
  const q = query.trim().toLocaleLowerCase("tr");
  const found = blocks.filter(b => b.toLocaleLowerCase("tr").includes(q));
  list.innerHTML = "";
  found.forEach(b => {
    const div = document.createElement("div");
    div.className = "dict-item";
    div.textContent = b;
    list.appendChild(div);
  });
  if (!found.length) list.textContent = "No results.";
}

function openDictionary(title) {
  modalTitle.textContent = title;
  modalBody.innerHTML = "";

  const search = document.createElement("input");
  search.type = "search";
  search.id = "dictSearch";
  search.placeholder = "Search...";

  const list = document.createElement("div");
  list.id = "dictList";
  list.textContent = "Loading...";

  modalBody.append(search, list);
  modal.classList.add("open");

  loadDictionary()
    .then(blocks => {
      showEntries(list, blocks, "");
      search.addEventListener("input", () => showEntries(list, blocks, search.value));
      search.focus();
    })
    .catch(err => {
      console.error("Dictionary could not be loaded:", err);
      list.textContent = "The dictionary could not be loaded.";
    });
}

menuBtn.addEventListener("click", openPanel);
panelClose.addEventListener("click", closePanel);
overlay.addEventListener("click", closePanel);
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (modal.classList.contains("open")) closeModal();
  else closePanel();
});