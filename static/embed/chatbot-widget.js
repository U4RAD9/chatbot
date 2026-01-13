(function () {
  function loadScript(src, callback) {
    const s = document.createElement("script");
    s.src = src;
    s.onload = callback;
    document.body.appendChild(s);
  }

  function initXRaiChat() {
    if (window.XRaiChatLoaded) return;
    window.XRaiChatLoaded = true;

    /* ---------- LOAD CSS ---------- */
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://chatbot.xraidigital.com/static/embed/widget.css";
    document.head.appendChild(css);

    /* ---------- CHAT BUTTON ---------- */
    const button = document.createElement("div");
    button.id = "xrai-chat-button";
    button.innerHTML = `
      <img src="https://chatbot.xraidigital.com/static/images/chatbox-icon.svg" />
    `;
    document.body.appendChild(button);

    /* ---------- CHAT CONTAINER ---------- */
    const container = document.createElement("div");
    container.id = "xrai-chat-container";
    container.style.display = "none";
    document.body.appendChild(container);

    /* ---------- LOAD UI THEN LOGIC ---------- */
    loadScript(
      "https://chatbot.xraidigital.com/static/embed/chat-ui.js",
      () => {
        loadScript(
          "https://chatbot.xraidigital.com/static/app.js",
          () => {
            // IMPORTANT: INIT AFTER DOM EXISTS
            if (window.initXRaiChatbot) {
              window.initXRaiChatbot();
            }
          }
        );
      }
    );

    /* ---------- TOGGLE ---------- */
    button.addEventListener("click", () => {
      container.style.display =
        container.style.display === "none" ? "block" : "none";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initXRaiChat);
  } else {
    initXRaiChat();
  }
})();
