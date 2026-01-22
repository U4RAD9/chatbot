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
    css.href = "http://127.0.0.1:5000/static/embed/widget.css";
    document.head.appendChild(css);

    /* ---------- CHAT BUTTON ---------- */
    const button = document.createElement("div");
    button.id = "xrai-chat-button";
    button.innerHTML = `
      <img src="http://127.0.0.1:5000/static/images/chatbox-icon.svg" />
    `;
    document.body.appendChild(button);

    /* ---------- CHAT CONTAINER ---------- */
    const container = document.createElement("div");
    container.id = "xrai-chat-container";
    container.style.display = "none";
    document.body.appendChild(container);
    const observer = new MutationObserver(() => {
      if (container.style.display === "none") {
        container.style.display = "block";
      }
    });
    
    observer.observe(container, {
      attributes: true,
      attributeFilter: ["style"]
    });
    container.addEventListener("click", function (e) {
    e.stopPropagation();
    });

    /* ---------- LOAD UI THEN LOGIC ---------- */
    loadScript(
      // "https://chatbot.xraidigital.com/static/embed/chat-ui.js",
        "http://127.0.0.1:5000/static/embed/chat-ui.js",
      () => {
        loadScript(
          // "https://chatbot.xraidigital.com/static/app.js",
          "http://127.0.0.1:5000/static/app.js",
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
    button.addEventListener("click", function (e) {
    e.stopPropagation();          // 🚫 stop bubbling
    container.style.display = "block";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initXRaiChat);
  } else {
    initXRaiChat();
  }
})();
