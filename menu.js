const menuBtn    = document.getElementById("menuBtn");
const panelClose = document.getElementById("panelClose");
const overlay    = document.getElementById("overlay");
const panelList  = document.getElementById("panelList");
const modal      = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalBody  = document.getElementById("modalBody");

// Panel düğmeleri: önce How to Use, sonra points.js'teki noktalar, sonra EXTRA
const entries = [
  { label: HOWTO.title, text: HOWTO.text, images: HOWTO.images, howto: true },
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
  b.addEventListener("click", () =>
    openModal(item.label, item.text || "Yazı", item.images || []));
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