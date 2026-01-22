(function () {
  function openChat() {
    const chat = document.querySelector(".chatbox__support");
    chat.style.display = "block";   // 👈 FORCE OPEN
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("#xrai-chat-toggle")) {
      openChat();   // 👈 no toggle
    }
  });
})();
