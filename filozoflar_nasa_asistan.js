/*
 NASA ANALOG ASİSTAN (Groq AI Entegreli)
 Filozofların Takımı
 NASA Space Apps Challenge 2026
*/

(() => {
  "use strict";

  // Cloudflare Worker Adresiniz (Groq API Köprüsü)
  const CHAT_ENDPOINT = "https://nsa-ai.dincermertozer.workers.dev/";

  // 1. YAPAY ZEKÂ BAĞLANTI FONKSİYONU (GROQ)
  async function cevapVer(soru) {
    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: soru })
      });

      if (!res.ok) throw new Error("API yanıt vermedi");
      
      const data = await res.json();
      return data.reply || "Üzgünüm, şu anda yanıt oluşturamıyorum.";
    } catch (err) {
      console.warn("Groq bağlantı hatası:", err);
      return "Bağlantı kurulamadı. Lütfen internet bağlantınızı veya Cloudflare Worker ayarlarınızı kontrol edin.";
    }
  }

  // 2. ARAYÜZ VE STİL YÖNETİMİ
  function baslat() {
    const root = document.createElement("div");
    root.id = "filozoflar-nasa-asistan-root";
    document.body.appendChild(root);

    const shadow = root.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      * { box-sizing: border-box; }

      .nasa-buton {
        position: fixed;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        z-index: 2147483000;
        border: 0;
        border-radius: 12px 0 0 12px;
        padding: 14px 12px;
        background: #1263c7;
        color: white;
        cursor: pointer;
        font: 700 14px Arial, sans-serif;
        box-shadow: -3px 0 15px #0004;
        transition: background 0.2s, padding 0.2s;
        writing-mode: vertical-rl;
        text-orientation: mixed;
        letter-spacing: 1px;
      }

      .nasa-buton:hover {
        background: #1a75ec;
      }

      .nasa-panel {
        position: fixed;
        right: 55px;
        top: 50%;
        transform: translateY(-50%);
        width: min(380px, calc(100vw - 32px));
        height: min(550px, calc(100dvh - 40px));
        background: #071527;
        color: white;
        border: 1px solid #254669;
        border-radius: 16px;
        box-shadow: 0 15px 45px #0008;
        z-index: 2147483000;
        display: none;
        flex-direction: column;
        overflow: hidden;
        font-family: Arial, sans-serif;
      }

      .nasa-panel.acik { display: flex; }

      .nasa-baslik {
        padding: 15px;
        background: #102c4d;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
      }

      .nasa-kapat {
        background: transparent;
        color: white;
        border: 0;
        cursor: pointer;
        font-size: 20px;
      }

      .nasa-mesajlar {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .nasa-mesaj {
        max-width: 90%;
        padding: 11px 13px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.6;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .nasa-bot {
        background: #173553;
        align-self: flex-start;
      }

      .nasa-kullanici {
        background: #1263c7;
        align-self: flex-end;
      }

      .nasa-form {
        display: flex;
        padding: 10px;
        gap: 7px;
        border-top: 1px solid #254669;
        background: #091a2e;
      }

      .nasa-input {
        min-width: 0;
        flex: 1;
        background: #102c4d;
        border: 1px solid #355675;
        border-radius: 9px;
        color: white;
        outline: none;
        padding: 11px;
        font: 13px Arial, sans-serif;
      }

      .nasa-gonder {
        border: 0;
        border-radius: 9px;
        padding: 10px 14px;
        background: #1263c7;
        color: white;
        cursor: pointer;
        font-weight: bold;
      }

      .nasa-alt {
        padding: 7px;
        text-align: center;
        color: #94a9c0;
        font-size: 10px;
        background: #091a2e;
      }
    `;

    shadow.appendChild(style);

    const button = document.createElement("button");
    button.className = "nasa-buton";
    button.innerHTML = "◀";
    button.setAttribute("aria-label", "NASA Asistanını Aç/Kapat");

    const panel = document.createElement("section");
    panel.className = "nasa-panel";

    panel.innerHTML = `
      <div class="nasa-baslik">
        <span>NASA Analog Asistan (AI)</span>
        <button class="nasa-kapat" aria-label="Kapat">×</button>
      </div>
      <div class="nasa-mesajlar" aria-live="polite"></div>
      <form class="nasa-form">
        <input class="nasa-input"
          type="text"
          placeholder="Atacama veya Ay üssü hakkında sor..."
          aria-label="Mesajınız">
        <button class="nasa-gonder" type="submit">Gönder</button>
      </form>
      <div class="nasa-alt">
        Filozofların Takımı • Space Apps 2026
      </div>
    `;

    shadow.append(button, panel);

    const mesajlar = panel.querySelector(".nasa-mesajlar");
    const form = panel.querySelector(".nasa-form");
    const input = panel.querySelector(".nasa-input");

    function mesajEkle(metin, kim) {
      const mesaj = document.createElement("div");
      mesaj.className =
        "nasa-mesaj " +
        (kim === "bot" ? "nasa-bot" : "nasa-kullanici");
      mesaj.textContent = metin;
      mesajlar.appendChild(mesaj);
      mesajlar.scrollTop = mesajlar.scrollHeight;
      return mesaj;
    }

    mesajEkle(
      "Merhaba! 🚀\n\nBen Filozofların Takımı'nın yapay zekâ destekli NASA Analog Asistanıyım. Ay ve Mars analog sahaları hakkında bana dilediğin soruyu sorabilirsin.",
      "bot"
    );

    button.addEventListener("click", () => {
      const acik = panel.classList.toggle("acik");
      button.setAttribute("aria-expanded", String(acik));
      if (acik) input.focus();
    });

    panel.querySelector(".nasa-kapat").addEventListener("click", () => {
      panel.classList.remove("acik");
      button.setAttribute("aria-expanded", "false");
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const soru = input.value.trim();
      if (!soru) return;

      mesajEkle(soru, "kullanici");
      input.value = "";

      const yukleniyorMesaji = mesajEkle("Düşünüyor...", "bot");
      
      const yanıt = await cevapVer(soru);
      
      yukleniyorMesaji.textContent = yanıt;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", baslat);
  } else {
    baslat();
  }
})();