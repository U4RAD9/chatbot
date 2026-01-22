class Chatbox {
    constructor() {
        this.args = {
            // 🔥 WIDGET SELECTORS
            openButton: document.getElementById('xrai-chat-button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            micButton: document.querySelector('.mic__button')
        };

        this.messages = [];
        this.is_registering = false;
        this.registration_state = 0;
        this.user_data = {};

        // Initial bot message
        this.messages.push({
            name: "Sam",
            message: "I'm Rasa. How may I help you?"
        });
    }

    display() {
        const { openButton, chatBox, sendButton, micButton } = this.args;
        if (!openButton || !chatBox || !sendButton) {
            console.error("Chatbox elements missing");
            return;
        }

    sendButton.addEventListener("click", function (e) {
      e.preventDefault();   // 🚫 stops page reload
      sendMessage();
    });


        if (micButton) {
            micButton.addEventListener('mousedown', () => this.onMicButton(chatBox));
        }

        const input = chatBox.querySelector('#chat-input');
        input.addEventListener("keyup", ({ key }) => {
            if (key === "Enter") this.onSendButton(chatBox);
        });

        this.updateChatText(chatBox);
    }

    onSendButton(chatbox) {
        const textField = chatbox.querySelector('#chat-input');
        const text1 = textField.value.trim();
        if (!text1) return;

        this.messages.push({ name: "User", message: text1 });

        // Request callback
        if (/^request a call-back$/i.test(text1)) {
            this.is_registering = true;
            this.registration_state = 1;
            this.messages.push({ name: "Sam", message: "Enter your name" });
            this.updateChatText(chatbox);
            textField.value = '';
            return;
        }

        // Go back
        if (/^(back|go back)$/i.test(text1)) {
            this.resetRegistration();
            this.messages.push({
                name: "Sam",
                message: `
                <div class='prompt'>
                    Please select an option:
                    <ul>
                        <li><span class='btn btn-response'>X-RAY SINGLE VIEW</span></li>
                        <li><span class='btn btn-response'>X-RAY DOUBLE VIEW</span></li>
                        <li><span class='btn btn-response'>ECG</span></li>
                        <li><span class='btn btn-response'>Request a call-back</span></li>
                    </ul>
                </div>`
            });
            this.updateChatText(chatbox);
            textField.value = '';
            return;
        }

        if (!this.is_registering) {
            fetch('https://chatbot.xraidigital.com/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text1 })
            })
            .then(r => r.json())
            .then(r => {
                const answers = Array.isArray(r.answer) ? r.answer : [r.answer];
                answers.forEach(resp =>
                    this.messages.push({ name: "Sam", message: resp })
                );
                this.updateChatText(chatbox);
            });
        } else {
            this.handleRegistration(text1, chatbox);
        }

        textField.value = '';
    }

    handleRegistration(text, chatbox) {
        let response = '';

        switch (this.registration_state) {
            case 1:
                this.user_data.name = text;
                response = 'Enter your phone number';
                break;
            case 2:
                this.user_data.phone = text;
                response = 'Enter your email (or type No)';
                break;
            case 3:
                if (!/^no$/i.test(text)) this.user_data.email = text;
                response = 'Your call-back request has been successfully submitted.';
                this.bookAppointment(chatbox);
                break;
        }

        this.messages.push({ name: "Sam", message: response });
        this.updateChatText(chatbox);
        this.registration_state++;
    }

    bookAppointment(chatbox) {
        fetch('https://chatbot.xraidigital.com/book-appointment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.user_data)
        })
        .then(r => r.json())
        .then(r => {
            this.messages.push({ name: "Sam", message: r.answer });
            this.updateChatText(chatbox);
            this.resetRegistration();
        });
    }

    resetRegistration() {
        this.is_registering = false;
        this.registration_state = 0;
        this.user_data = {};
    }

    // ✅ FIXED MESSAGE ORDER (BOTTOM)
    updateChatText(chatbox) {
        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = this.messages.map(item => `
            <div class="messages__item ${
                item.name === "Sam"
                ? 'messages__item--visitor'
                : 'messages__item--operator'
            }">${item.message}</div>
        `).join('');

        chatmessage.scrollTop = chatmessage.scrollHeight;

        chatbox.querySelectorAll(".btn-response").forEach(btn => {
            btn.onclick = () => {
                chatbox.querySelector('#chat-input').value = btn.innerText;
                this.onSendButton(chatbox);
            };
        });
    }

    onMicButton(chatbox) {
        if (!('webkitSpeechRecognition' in window)) return;
        const recognition = new webkitSpeechRecognition();
        recognition.onresult = e => {
            chatbox.querySelector('#chat-input').value =
                e.results[0][0].transcript;
        };
        recognition.start();
    }
}

/* 🔥 WIDGET INIT */
window.initXRaiChatbot = function () {
    const chatbox = new Chatbox();
    chatbox.display();
};
