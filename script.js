// Get DOM elements
const chatHistory = document.querySelector('.chat-history');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// Event listener for send button click
sendButton.addEventListener('click', sendMessage);

// Event listener for Enter key press in input field
messageInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

function DebugFunction(_debug_text = "Issues Found"){
    document.getElementById("debug_area").innerHTML = _debug_text;
}

// Function to send a message
function sendMessage() {
    DebugFunction("Method Executed");
    if (messageInput) {
        const message = messageInput.value.trim();
        if (message !== '') {
            // Create a new message element
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.innerHTML = `
                <p class="message-text">${message}</p>
                <span class="message-time">${getCurrentTime()}</span>
            `;
            chatHistory.appendChild(messageElement);
            
            // Clear the input field
            messageInput.value = '';
            
            // Scroll to the bottom of the chat history
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
    } else {
        DebugFunction("messageInput element not found");
    }
}

// Function to get the current time in a formatted string
function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}