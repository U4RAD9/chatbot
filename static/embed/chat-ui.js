const root = document.getElementById("xrai-chat-container");

root.innerHTML = `
<div class="chatbox">
  <div class="chatbox__support chatbox--active">
    <div class="chatbox__header">
      <h4>XRAi Chat Assistant</h4>
      <p>Hi. My name is Rasa. How can I help you?</p>
    </div>
    <div class="chatbox__messages"></div>
    <div class="chatbox__footer">
      <input id="chat-input" placeholder="Write a message..." />
      <button class="send__button">Send</button>
    </div>
  </div>
</div>
`;
