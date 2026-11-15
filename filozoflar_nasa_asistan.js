/*
 NASA ANALOG ASSISTANT (Groq AI Integrated - Multilingual)
 Team Philosophers (Filozofların Takımı)
 NASA Space Apps Challenge 2026
*/

(() => {
  "use strict";

  const CHAT_ENDPOINT = "https://nsa-ai.dincermertozer.workers.dev/";

  async function askAssistant(question) {
    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          message: question,
          languageInstruction: "Detect the exact language of the user's message and reply naturally, scientifically, and concisely in that EXACT SAME language."
        })
      });

      if (!res.ok) throw new Error("API did not respond (HTTP " + res.status + ")");

      const data = await res.json();

      // Eğer Worker doğrudan sohbet yanıtı döndürdüyse onu kullan
      if (data.reply) {
        return data.reply;
      }

      // Eğer Worker JSON analiz objesi döndürdüyse, chatbot içinde şık bir sohbet metnine dönüştür
      if (data.summary) {
        let formatted = `${data.locationName ? "📍 " + data.locationName + "\n\n" : ""}${data.summary}`;
        if (data.criteria && data.criteria.nasaFit && data.criteria.nasaFit !== "-") {
          formatted += `\n\n🚀 NASA Fit: ${data.criteria.nasaFit}`;
        }
        return formatted;
      }

      return "Sorry, I could not generate a response right now.";
    } catch (err) {
      console.warn("Groq connection error:", err);
      return "Connection failed. Please check your internet connection or Cloudflare Worker settings.";
    }
  }

  function initAssistant() {
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

      .nasa-buton:hover { background: #1a75ec; }

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

      .nasa-bot { background: #173553; align-self: flex-start; }
      .nasa-kullanici { background: #1263c7; align-self: flex-end; }

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
    button.setAttribute("aria-label", "Open/Close NASA Assistant");

    const panel = document.createElement("section");
    panel.className = "nasa-panel";

    panel.innerHTML = `
      <div class="nasa-baslik">
        <span>NASA Analog Assistant (AI)</span>
        <button class="nasa-kapat" aria-label="Close">×</button>
      </div>
      <div class="nasa-mesajlar" aria-live="polite"></div>
      <form class="nasa-form">
        <input class="nasa-input" type="text" placeholder="Ask in any language (Atacama, Moon base...)" aria-label="Your message">
        <button class="nasa-gonder" type="submit">Send</button>
      </form>
      <div class="nasa-alt">
        Team Philosophers • NASA Space Apps 2026
      </div>
    `;

    shadow.append(button, panel);

    const messagesContainer = panel.querySelector(".nasa-mesajlar");
    const form = panel.querySelector(".nasa-form");
    const input = panel.querySelector(".nasa-input");

    function appendMessage(text, sender) {
      const msgDiv = document.createElement("div");
      msgDiv.className = "nasa-mesaj " + (sender === "bot" ? "nasa-bot" : "nasa-kullanici");
      msgDiv.textContent = text;
      messagesContainer.appendChild(msgDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      return msgDiv;
    }

    appendMessage(
      "Hello! 🚀\n\nI am Team Philosophers' AI-powered NASA Analog Assistant. Ask me anything about Moon & Mars analog sites in any language — I will respond in your language!",
      "bot"
    );

    button.addEventListener("click", () => {
      const isOpen = panel.classList.toggle("acik");
      button.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) input.focus();
    });

    panel.querySelector(".nasa-kapat").addEventListener("click", () => {
      panel.classList.remove("acik");
      button.setAttribute("aria-expanded", "false");
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const question = input.value.trim();
      if (!question) return;

      appendMessage(question, "user");
      input.value = "";

      const loadingMessage = appendMessage("Thinking...", "bot");
      const reply = await askAssistant(question);
      loadingMessage.textContent = reply;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAssistant);
  } else {
    initAssistant();
  }
})();