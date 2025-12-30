class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            micButton: document.querySelector('.mic__button')
        };

        this.state = false;
        this.messages = [];
        this.is_registering = false;
        this.registration_state = 0;
        this.user_data = {};

        // Initial bot message
        let msg2 = {
            name: "Sam",
            message: "I'm Rasa. How may I help you?"
        };
        this.messages.push(msg2);
        this.updateChatText(this.args.chatBox);
    }

    display() {
        const { openButton, chatBox, sendButton, micButton } = this.args;
        if (!openButton || !chatBox || !sendButton) return;

        openButton.addEventListener('click', () => this.toggleState(chatBox));
        sendButton.addEventListener('click', () => this.onSendButton(chatBox));

        if (micButton) {
            micButton.addEventListener('mousedown', () => this.onMicButton(chatBox));
        }

        const input = chatBox.querySelector('#chat-input');
        if (!input) return;

        input.addEventListener("keyup", ({ key }) => {
            if (key === "Enter") {
                this.onSendButton(chatBox);
            }
        });
    }

    toggleState(chatbox) {
        this.state = !this.state;
        chatbox.classList.toggle('chatbox--active', this.state);
    }


    onSendButton(chatbox) {
        const textField = chatbox.querySelector('#chat-input');
        if (!textField) return;
    
        const text1 = textField.value.trim();
        if (!text1) return;
    
        // Add user message
        this.messages.push({ name: "User", message: text1 });
    
        /* 🔥 FIX: Handle "Request a call-back" BEFORE backend call */
        if (/^request a call-back$/i.test(text1)) {
            this.is_registering = true;
            this.registration_state = 1;
    
            this.messages.push({
                name: "Sam",
                message: "Enter your name"
            });
    
            this.updateChatText(chatbox);
            textField.value = '';
            return;
        }
    
        // Go Back
        if (/^(back|go back)$/i.test(text1)) {
            this.is_registering = false;
            this.registration_state = 0;
            this.user_data = {};
        
            this.messages.push({
                name: "Sam",
                message: `
                <div class='prompt'>
                    We provide a range of at-home diagnostic services. Please call our toll-free number 18002702900 or select from the following:
                    <ul>
                        <li><span class='btn btn-response'>X-RAY SINGLE VIEW</span></li>
                        <li><span class='btn btn-response'>X-RAY DOUBLE VIEW</span></li>
                        <li><span class='btn btn-response'>ECG</span></li>
                        <li><span class='btn btn-response'>PFT</span></li>
                        <li><span class='btn btn-response'>Holter 24hrs machine test</span></li>
                        <li><span class='btn btn-response'>Holter 72hrs patch</span></li>
                        <li><span class='btn btn-response'>Request a call-back</span></li>
                        <li><span class='btn btn-response' onclick="window.open('https://xraidigital.com/Home/Blog', '_blank')">Know more</span></li>
                    </ul>
                </div>`
            });
        
            this.updateChatText(chatbox);
            textField.value = '';
            return;
        }

    
        // 🔵 Normal chat flow
        if (!this.is_registering) {
            fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text1 })
            })
            .then(r => r.json())
            .then(r => {
                const answers = Array.isArray(r.answer) ? r.answer : [r.answer];
    
                answers.forEach(resp => {
                    this.messages.push({ name: "Sam", message: resp });
    
                    // Safety: backend-triggered registration (optional)
                    if (resp === 'Enter your name') {
                        this.is_registering = true;
                        this.registration_state = 1;
                    }
                });
    
                this.updateChatText(chatbox);
                textField.value = '';
            })
            .catch(console.error);
    
        } else {
            // 🟢 Registration flow
            this.handleRegistration(text1, chatbox);
            textField.value = '';
        }
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
                response = `
                <div class='prompt'>
                    Would you like to enter your email?
                    <ul>
                        <li><span class='btn btn-response'>Yes</span></li>
                        <li><span class='btn btn-response'>No</span></li>
                    </ul>
                </div>`;
                break;
            case 3:
                if (/^yes$/i.test(text)) {
                    response = 'Enter your email';
                } else {
                    this.registration_state = 4;
                    response = 'Your request is in progress, please wait...';
                }
                break;
            case 4:
                this.user_data.email = text;
                response = 'Your request is in progress, please wait...';
                break;
            default:
                this.resetRegistration();
                response = "<div class='prompt'>I do not understand...<span class='btn btn-response'>Go Back</span></div>";
        }

        this.messages.push({ name: "Sam", message: response });
        this.updateChatText(chatbox);

        if (this.registration_state === 4) {
            this.bookAppointment(chatbox);
        } else {
            this.registration_state++;
        }
    }

    bookAppointment(chatbox) {
        fetch('/book-appointment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.user_data)
        })
        .then(r => r.json())
        .then(r => {
            this.messages.push({ name: "Sam", message: r.answer });
            this.updateChatText(chatbox);
            this.resetRegistration();
        })
        .catch(console.error);
    }

    resetRegistration() {
        this.is_registering = false;
        this.registration_state = 0;
        this.user_data = {};
    }

    updateChatText(chatbox) {
        let html = '';
        this.messages.slice().reverse().forEach(item => {
            html += `
            <div class="messages__item ${
                item.name === "Sam"
                ? 'messages__item--visitor'
                : 'messages__item--operator'
            }">${item.message}</div>`;
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
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
        recognition.interimResults = true;

        recognition.onresult = e => {
            const transcript = Array.from(e.results)
                .map(r => r[0].transcript)
                .join('');
            chatbox.querySelector('#chat-input').value = transcript;
        };

        recognition.start();
    }
}

/* 🔒 DOM SAFE INIT */
document.addEventListener('DOMContentLoaded', () => {
    const chatbox = new Chatbox();
    chatbox.display();
});
