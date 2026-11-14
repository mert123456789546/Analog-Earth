// Yan paneldeki "How to Use" ekranı
const HOWTO = {
  title: "How to Use",
  text: "Yazı",
  images: []      // örnek: ["images/howto1.jpeg"]
};

// Noktaların ekranları. Soldaki isim, points.js'teki name ile BİREBİR aynı olmalı.
const TEXTS = {
  "Kilauea Volcano (%92)":     { text: "Kilauea Volcano is one of the strongest geological analogues on Earth for studying basaltic volcanism, lava flow dynamics, and volcanic-tectonic interactions on the Moon and Mars. The fact that both Kīlauea and the volcanic plains of Mars and the Moon are composed of low-viscosity basaltic lava allows cooling lava textures and flow patterns to be closely compared. Furthermore, the underground lava tubes and collapsed crater pits found at Kīlauea provide some of the clearest terrestrial examples of the lava tube roof collapses recorded by lunar and Martian orbiters, making the site a direct reference for future simulations of human underground habitats. Additionally, sulfur dioxide and acidic gases released from the volcano's summit calderas interact with basaltic rocks to form secondary minerals, closely resembling the ancient aqueous and hydrothermal alteration processes investigated by exploration rovers in Martian craters.", images: ["images/Kileueadny.jpg", "images/Kilaeuay.jpg"] },
  "Black Point Lava Flow (%88)": { text: "Yazı", images: [] },
  "Askja Volcano (%85)":       { text: "Yazı", images: [] },
  "Atacama Desert (%95)":      { text: "Yazı", images: [] },
  "McMurdo Dry Valleys (%90)": { text: "Yazı", images: [] },
  "Devon Island (%92)":        { text: "Yazı", images: [] },
  "Mojave Desert (%98)":       { text: "Yazı", images: [] },
  "Lut Desert (%90)":          { text: "Yazı", images: [] },
  "Bodele Depression (%89)":   { text: "Yazı", images: [] },
  "Tuz Lake (%87)":            { text: "Yazı", images: [] },
  "Salar de Uyuni (%90)":      { text: "Yazı", images: [] },
  "Ladakh (%88)":              { text: "Yazı", images: [] },
  "Lonar Crater (%90 for both Moon and Mars)": { text: "Yazı", images: [] },
  "Qaidam Pendi (%90)":        { text: "Yazı", images: [] },
  "Jeju Island (%80)":         { text: "Yazı", images: [] }
};

// Haritada nokta olmayan, sadece panelde duran ekstra düğmeler (istersen boş bırak)
const EXTRA = [
  // { label: "Credits", text: "Kaynaklar.", images: [] }
  {label: "Source", text: "Yazı", images: [] }
];