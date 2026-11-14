const W = 1000, H = 500;
const svg   = d3.select("#map");
const wrap  = document.getElementById("wrap");
const selEl = document.getElementById("selection");
const popup = document.getElementById("popup");

// Dikdörtgen dünya haritası (equirectangular)
const projection = d3.geoEquirectangular().fitSize([W, H], { type: "Sphere" });
const path = d3.geoPath(projection);

svg.append("path").datum({ type: "Sphere" }).attr("class", "sphere").attr("d", path);

svg.append("g").selectAll("path")
  .data(topojson.feature(WORLD, WORLD.objects.countries).features)
  .join("path").attr("class", "country").attr("d", path);

// Noktaları çiz (SVG koordinatları)
POINTS.forEach(p => { [p.x, p.y] = projection([p.lon, p.lat]); });
const dots = svg.selectAll(".point").data(POINTS).join("circle")
  .attr("class", "point").attr("cx", d => d.x).attr("cy", d => d.y).attr("r", 4);

// Fare konumu -> SVG koordinatı
function toSvg(e) {
  const r = svg.node().getBoundingClientRect();
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  return {
    x: cl((e.clientX - r.left) * W / r.width, 0, W),
    y: cl((e.clientY - r.top)  * H / r.height, 0, H)
  };
}

let start = null, dragging = false, justDragged = false;

wrap.addEventListener("pointerdown", e => {
  if (e.button !== 0 || popup.contains(e.target)) return;
  start = toSvg(e); dragging = false;
});

window.addEventListener("pointermove", e => {
  if (!start) return;
  const cur = toSvg(e);
  const r = svg.node().getBoundingClientRect();
  const dist = Math.hypot((cur.x - start.x) * r.width / W, (cur.y - start.y) * r.height / H);
  if (!dragging && dist < 4) return;
  if (!dragging) { dragging = true; hidePopup(); }
  const x = Math.min(start.x, cur.x), y = Math.min(start.y, cur.y);
  const w = Math.abs(cur.x - start.x), h = Math.abs(cur.y - start.y);
  Object.assign(selEl.style, {
    display: "block",
    left: (x / W * 100) + "%", top: (y / H * 100) + "%",
    width: (w / W * 100) + "%", height: (h / H * 100) + "%"
  });
  dots.classed("active", d => d.x >= x && d.x <= x + w && d.y >= y && d.y <= y + h);
});

window.addEventListener("pointerup", () => {
  if (dragging) { justDragged = true; setTimeout(() => justDragged = false, 0); }
  start = null; dragging = false;
});

// Sol tık: nokta -> açıklama aç; boş yer -> önce açıklama, sonra seçim kapanır
document.addEventListener("click", e => {
  if (document.body.classList.contains("panel-open")) return;
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
