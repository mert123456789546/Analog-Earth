const W = 1000, H = 500;
const svg   = d3.select("#map");
const wrap  = document.getElementById("wrap");
const selEl = document.getElementById("selection");
const popup = document.getElementById("popup");

const fsBtn      = document.getElementById("fsBtn");
const zoomInBtn  = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");

// Dikdörtgen dünya haritası (equirectangular)
const projection = d3.geoEquirectangular().fitSize([W, H], { type: "Sphere" });
const path = d3.geoPath(projection);

svg.append("path").datum({ type: "Sphere" }).attr("class", "sphere").attr("d", path);

const unmatched = [];
svg.append("g").selectAll("path")
  .data(topojson.feature(WORLD, WORLD.objects.countries).features)
  .join("path")
  .attr("class", d => {
    const continent = CONTINENT_OF[d.properties.name];
    if (!continent) unmatched.push(d.properties.name);
    return "country" + (continent ? " " + continent : "");
  })
  .attr("d", path);

if (unmatched.length) console.log("Kıtası belirlenmemiş ülkeler:", unmatched);

// Noktaları çiz (SVG koordinatları)
POINTS.forEach(p => { [p.x, p.y] = projection([p.lon, p.lat]); });
const dots = svg.selectAll(".point").data(POINTS).join("circle")
  .attr("class", d => "point" + (d.continent ? " " + d.continent : ""))
  .attr("cx", d => d.x).attr("cy", d => d.y).attr("r", 4);

// ---------- GÖRÜNÜM (YAKINLAŞTIRMA) ----------
const MAX_ZOOM = 8;
const view = { x: 0, y: 0, w: W, h: H };   // haritanın o an görünen kısmı (SVG birimi)
let selRect = null;                         // seçili alan (SVG biriminde)

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function applyView() {
  view.w = clamp(view.w, W / MAX_ZOOM, W);
  view.h = view.w * H / W;
  view.x = clamp(view.x, 0, W - view.w);
  view.y = clamp(view.y, 0, H - view.h);
  svg.attr("viewBox", `${view.x} ${view.y} ${view.w} ${view.h}`);
  dots.attr("r", 4 * view.w / W);           // noktalar yakınlaşınca ekranda aynı boyutta kalsın
  renderSelection();
  hidePopup();                              // açıklama kutusu eski yerde kalmasın
  zoomInBtn.disabled  = view.w <= W / MAX_ZOOM + 0.001;
  zoomOutBtn.disabled = view.w >= W - 0.001;
}

function zoomBy(factor) {
  const cx = view.x + view.w / 2, cy = view.y + view.h / 2;
  const newW = clamp(view.w / factor, W / MAX_ZOOM, W);
  view.w = newW;
  view.h = newW * H / W;
  view.x = cx - view.w / 2;
  view.y = cy - view.h / 2;
  applyView();
}

function renderSelection() {
  if (!selRect) { selEl.style.display = "none"; return; }
  Object.assign(selEl.style, {
    display: "block",
    left:   ((selRect.x - view.x) / view.w * 100) + "%",
    top:    ((selRect.y - view.y) / view.h * 100) + "%",
    width:  (selRect.w / view.w * 100) + "%",
    height: (selRect.h / view.h * 100) + "%"
  });
}

// Fare konumu -> SVG koordinatı (yakınlaştırmayı hesaba katar)
function toSvg(e) {
  const r = svg.node().getBoundingClientRect();
  return {
    x: clamp(view.x + (e.clientX - r.left) * view.w / r.width,  view.x, view.x + view.w),
    y: clamp(view.y + (e.clientY - r.top)  * view.h / r.height, view.y, view.y + view.h)
  };
}

// ---------- SÜRÜKLEME: SOL TUŞ = ALAN SEÇ, SAĞ/ORTA TUŞ = HARİTAYI KAYDIR ----------
let start = null, dragging = false, justDragged = false, panStart = null;

wrap.addEventListener("pointerdown", e => {
  if (popup.contains(e.target)) return;
  if (e.button === 1 || e.button === 2) {
    e.preventDefault();
    panStart = { cx: e.clientX, cy: e.clientY, vx: view.x, vy: view.y };
    wrap.classList.add("panning");
    return;
  }
  if (e.button !== 0) return;
  start = toSvg(e); dragging = false;
});

wrap.addEventListener("contextmenu", e => e.preventDefault());

window.addEventListener("pointermove", e => {
  if (panStart) {
    const r = svg.node().getBoundingClientRect();
    view.x = panStart.vx - (e.clientX - panStart.cx) * view.w / r.width;
    view.y = panStart.vy - (e.clientY - panStart.cy) * view.h / r.height;
    applyView();
    return;
  }
  if (!start) return;
  const cur = toSvg(e);
  const r = svg.node().getBoundingClientRect();
  const dist = Math.hypot((cur.x - start.x) * r.width / view.w, (cur.y - start.y) * r.height / view.h);
  if (!dragging && dist < 4) return;
  if (!dragging) { dragging = true; hidePopup(); }
  const x = Math.min(start.x, cur.x), y = Math.min(start.y, cur.y);
  const w = Math.abs(cur.x - start.x), h = Math.abs(cur.y - start.y);
  selRect = { x, y, w, h };
  renderSelection();
  dots.classed("active", d => d.x >= x && d.x <= x + w && d.y >= y && d.y <= y + h);
});

window.addEventListener("pointerup", () => {
  if (panStart) { panStart = null; wrap.classList.remove("panning"); }
  if (dragging) { justDragged = true; setTimeout(() => justDragged = false, 0); }
  start = null; dragging = false;
});

// Sol tık: nokta -> açıklama aç; boş yer -> önce açıklama, sonra seçim kapanır
document.addEventListener("click", e => {
  if (document.body.classList.contains("panel-open")) return;
  if (e.target.closest && e.target.closest("#controls, #themeSwitch")) return;
  if (justDragged) return;
  if (popup.contains(e.target)) return;
  const el = e.target.closest && e.target.closest(".point.active");
  if (el) {
    showPopup(d3.select(el).datum(), el);
  } else if (!popup.hidden) {
    hidePopup();
  } else {
    clearSelection();
  }
});

function clearSelection() {
  selRect = null;
  selEl.style.display = "none";
  dots.classed("active", false);
}

function showPopup(d, el) {
  popup.innerHTML = "";

  const imgs = d.images || (d.image ? [d.image] : []);
  if (imgs.length) popup.appendChild(buildSlider(imgs));

  const title = document.createElement("strong");
  title.textContent = d.name;
  const desc = document.createElement("span");
  desc.textContent = d.text;
  popup.append(title, desc);

  popup.hidden = false;
  const w = wrap.getBoundingClientRect(), c = el.getBoundingClientRect();
  const cx = c.left + c.width / 2 - w.left, cy = c.top + c.height / 2 - w.top;
  let left = cx + 14, top = cy - popup.offsetHeight / 2;
  if (left + popup.offsetWidth > w.width) left = cx - popup.offsetWidth - 14;
  top = Math.max(4, Math.min(top, w.height - popup.offsetHeight - 4));
  popup.style.left = left + "px"; popup.style.top = top + "px";
}

function hidePopup() { popup.hidden = true; }

function buildSlider(imgs) {
  const box = document.createElement("div");
  box.className = "slider";
  const track = document.createElement("div");
  track.className = "track";

  imgs.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.draggable = false;
    track.appendChild(img);
  });
  box.appendChild(track);

  let index = 0;
  const dotEls = [];

  function go(n) {
    index = Math.max(0, Math.min(imgs.length - 1, n));
    track.style.transition = "transform .3s ease";
    track.style.transform = `translateX(${-index * 100}%)`;
    dotEls.forEach((dot, k) => dot.classList.toggle("on", k === index));
  }

  if (imgs.length > 1) {
    // Oklar
    [["prev", "‹", -1], ["next", "›", 1]].forEach(([cls, label, step]) => {
      const b = document.createElement("button");
      b.className = "nav " + cls;
      b.textContent = label;
      b.addEventListener("pointerdown", e => e.stopPropagation());
      b.addEventListener("click", () => go(index + step));
      box.appendChild(b);
    });

    // Noktalar
    const dotsWrap = document.createElement("div");
    dotsWrap.className = "dots";
    imgs.forEach(() => {
      const dot = document.createElement("i");
      dotEls.push(dot);
      dotsWrap.appendChild(dot);
    });
    box.appendChild(dotsWrap);

    // Sürükleyerek kaydırma
    let startX = null, dx = 0;
    box.addEventListener("pointerdown", e => {
      startX = e.clientX; dx = 0;
      box.setPointerCapture(e.pointerId);
      track.style.transition = "none";
    });
    box.addEventListener("pointermove", e => {
      if (startX === null) return;
      dx = e.clientX - startX;
      track.style.transform = `translateX(calc(${-index * 100}% + ${dx}px))`;
    });
    const end = () => {
      if (startX === null) return;
      startX = null;
      if (dx < -40) go(index + 1);
      else if (dx > 40) go(index - 1);
      else go(index);
    };
    box.addEventListener("pointerup", end);
    box.addEventListener("pointercancel", end);
  }

  go(0);
  return box;
}

// ---------- SAĞ ALT KONTROLLER ----------
zoomInBtn.addEventListener("click",  () => zoomBy(1.5));
zoomOutBtn.addEventListener("click", () => zoomBy(1 / 1.5));

function setFs(on) {
  document.body.classList.toggle("fs", on);
  const label = on ? "Small screen" : "Full screen";
  fsBtn.title = label;
  fsBtn.setAttribute("aria-label", label);
  hidePopup();
}
fsBtn.addEventListener("click", () => {
  const on = !document.body.classList.contains("fs");
  setFs(on);
  if (on) {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  } else if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
});

// Kullanıcı Esc ile tarayıcı tam ekranından çıkarsa düzen de eski hâline dönsün
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) setFs(false);
});

// Touchpad ve fare tekerleği: kaydır / yakınlaştır
wrap.addEventListener("wheel", e => {
  if (popup.contains(e.target)) return;
  e.preventDefault();
  const r = svg.node().getBoundingClientRect();
  if (e.ctrlKey) {                       // pinch ya da Ctrl + tekerlek: imlecin olduğu yere yakınlaştır
    const mx = view.x + (e.clientX - r.left) * view.w / r.width;
    const my = view.y + (e.clientY - r.top)  * view.h / r.height;
    const newW = clamp(view.w / Math.exp(-e.deltaY * 0.01), W / MAX_ZOOM, W);
    const k = newW / view.w;
    view.x = mx - (mx - view.x) * k;
    view.y = my - (my - view.y) * k;
    view.w = newW;
  } else {                               // iki parmakla kaydırma: haritayı kaydır
    view.x += e.deltaX * view.w / r.width;
    view.y += e.deltaY * view.h / r.height;
  }
  applyView();
}, { passive: false });
applyView();

// ---------- LIGHT / DARK MODU ----------
const themeSwitch = document.getElementById("themeSwitch");

function applyTheme(light) {
  document.body.classList.toggle("light", light);
  themeSwitch.setAttribute("aria-checked", String(light));
}

themeSwitch.addEventListener("click", () => {
  const light = !document.body.classList.contains("light");
  applyTheme(light);
  try { localStorage.setItem("theme", light ? "light" : "dark"); } catch (e) {}
});

let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
applyTheme(savedTheme === "light");

// ---------- KONTROL KUTUSU SÜRÜKLENEBİLİR ----------
(function () {
  const box = document.getElementById("controls");
  let pos = null;              // kullanıcının seçtiği konum
  let drag = null;
  let suppressClick = false;

  function place(left, top) {
    left = clamp(left, 0, Math.max(0, window.innerWidth  - box.offsetWidth));
    top  = clamp(top,  0, Math.max(0, window.innerHeight - box.offsetHeight));
    box.style.left = left + "px";
    box.style.top = top + "px";
    box.style.right = "auto";
    box.style.bottom = "auto";
    pos = { left, top };
  }

  box.addEventListener("pointerdown", e => {
    if (e.button !== 0) return;
    const r = box.getBoundingClientRect();
    drag = { id: e.pointerId, px: e.clientX, py: e.clientY, left: r.left, top: r.top, started: false };
  });

  window.addEventListener("pointermove", e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.px, dy = e.clientY - drag.py;
    if (!drag.started) {
      if (Math.hypot(dx, dy) < 5) return;     // küçük titremeler sürükleme sayılmaz
      drag.started = true;
      box.classList.add("dragging");
    }
    place(drag.left + dx, drag.top + dy);
  });

  function end() {
    if (!drag) return;
    if (drag.started) {
      suppressClick = true;                    // bırakırken düğmeye basılmış sayılmasın
      setTimeout(() => { suppressClick = false; }, 0);
      box.classList.remove("dragging");
    }
    drag = null;
  }
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);

  box.addEventListener("click", e => {
    if (suppressClick) { e.stopPropagation(); e.preventDefault(); }
  }, true);

  // Pencere ya da tam ekran boyutu değişince kutu ekran dışında kalmasın
  window.addEventListener("resize", () => { if (pos) place(pos.left, pos.top); });
})();