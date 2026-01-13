(function () {
  function toggleChat() {
    const chat = document.querySelector(".chatbox__support");
    chat.style.display = chat.style.display === "block" ? "none" : "block";
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("#xrai-chat-toggle")) {
      toggleChat();
    }
  });
})();
