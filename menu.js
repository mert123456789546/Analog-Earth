const menuBtn    = document.getElementById("menuBtn");
const panelClose = document.getElementById("panelClose");
const overlay    = document.getElementById("overlay");
const panelList  = document.getElementById("panelList");
const modal      = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalBody  = document.getElementById("modalBody");

// Kıtaların panelde görünme sırası ve başlıkta yazacak adları
const CONTINENT_ORDER = ["north-america", "south-america", "europe", "africa", "asia", "oceania", "antarctica"];
const CONTINENT_NAMES = {
  "north-america": "North America",
  "south-america": "South America",
  "europe": "Europe",
  "africa": "Africa",
  "asia": "Asia",
  "oceania": "Oceania",
  "antarctica": "Antarctica"
};

function addButton(item) {
  const b = document.createElement("button");
  b.className = "menu-item"
    + (item.howto ? " howto" : "")
    + (item.continent ? " " + item.continent : "");
  b.textContent = item.label;
  b.addEventListener("click", () => {
    if (item.dictionary) openDictionary(item.label);
    else if (item.file) openTextFile(item.label, item.file);
    else openModal(item.label, item.text || "Yazı", item.images || []);
  });
  panelList.appendChild(b);
}

function addHeading(continent) {
  const h = document.createElement("div");
  h.className = "continent-title " + continent;
  h.textContent = CONTINENT_NAMES[continent];
  panelList.appendChild(h);
}

function pointItem(p) {
  const t = TEXTS[p.name] || {};
  return { label: p.name, text: t.text, images: t.images, continent: p.continent };
}

// 1) En üstte How to Use, Dictionary ve EXTRA düğmeleri (Source gibi)
addButton({ label: HOWTO.title, text: HOWTO.text, images: HOWTO.images, howto: true });
addButton({ label: "Dictionary", dictionary: true });
EXTRA.forEach(addButton);

// 2) Kıtalar: önce başlık, altında o kıtadaki noktalar
CONTINENT_ORDER.forEach(c => {
  const group = POINTS.filter(p => p.continent === c);
  if (!group.length) return;
  addHeading(c);
  group.forEach(p => addButton(pointItem(p)));
});

// 3) Kıtası yazılmamış ya da listede olmayan noktalar (başlıksız)
POINTS.filter(p => !CONTINENT_ORDER.includes(p.continent))
  .forEach(p => addButton(pointItem(p)));

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

// ---------- .TXT DOSYALARINI OKUMA ----------
const fileCache = {};

// Bir .txt dosyasını bir kez okur ve madde listesine çevirir
function loadBlocks(file) {
  if (!fileCache[file]) {
    fileCache[file] = fetch(file)
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
    fileCache[file].catch(() => { delete fileCache[file]; });   // hata olursa tekrar denenebilsin
  }
  return fileCache[file];
}

// Metindeki linkleri tıklanabilir yapar: [Yazı](link) ve çıplak https://... biçimleri
function linkify(container, text) {
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|https?:\/\/[^\s<>"']+/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    let label, url, end;
    if (m[1]) {
      label = m[1]; url = m[2]; end = m.index + m[0].length;
    } else {
      url = m[0];
      // sondaki noktalama işaretlerini linkten çıkar
      while (/[.,;:!?]$/.test(url) || (url.endsWith(")") && !url.includes("("))) {
        url = url.slice(0, -1);
      }
      label = url;
      end = m.index + url.length;
    }
    container.appendChild(document.createTextNode(text.slice(last, m.index)));
    const a = document.createElement("a");
    a.href = url;
    a.textContent = label;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    container.appendChild(a);
    last = end;
    re.lastIndex = end;
  }
  container.appendChild(document.createTextNode(text.slice(last)));
}

// "file" özelliği olan düğmeler (Source gibi): dosyayı oku, linkleri tıklanabilir göster
function openTextFile(title, file) {
  modalTitle.textContent = title;
  modalBody.innerHTML = "";

  const list = document.createElement("div");
  list.id = "sourceList";
  list.textContent = "Loading...";
  modalBody.appendChild(list);
  modal.classList.add("open");

  loadBlocks(file)
    .then(blocks => {
      list.innerHTML = "";
      blocks.forEach(b => {
        const div = document.createElement("div");
        div.className = "source-item";
        linkify(div, b);
        list.appendChild(div);
      });
    })
    .catch(err => {
      console.error(file + " could not be loaded:", err);
      list.textContent = "The file could not be loaded.";
    });
}

// ---------- SÖZLÜK ----------
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

  loadBlocks("dictionary.txt")
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