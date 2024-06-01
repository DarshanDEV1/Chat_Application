// Get DOM elements
const chatHistory = document.querySelector('.chat-history');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const username = prompt('Enter your username:');
const recipient = prompt('Enter the recipient\'s name:');
const url = 'https://' + prompt('Enter the code url: ') + '.ngrok-free.app';

// 'https://ba31-117-217-54-22.ngrok-free.app'

// Connect to the server
const socket = io(url);

// Event listener for send button click
sendButton.addEventListener('click', () => {
  sendMessage();
});

// Event listener for Enter key press in input field
messageInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const message = messageInput.value.trim();
  if (message !== '') {
    const data = {
      sender: username,
      reciever: recipient,
      message: message
    };

    // Send the message to the server
    fetch(url + '/sendmessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(response => response.json()).then(data => {
      if (data.success) {
        messageInput.value = '';
      }
    }).catch(error => console.error('Error:', error));
  }
}

// Event listener for receiving messages from the server
socket.on('message', (messageData) => {
  displayMessage(messageData.sender, messageData.message, messageData.timestamp);
});

function displayMessage(sender, message, timestamp) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.innerHTML = `
    <p class="message-text"><strong>${sender}:</strong> ${message}</p>
    <span class="message-time">${formatTimestamp(timestamp)}</span>
  `;
  chatHistory.appendChild(messageElement);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
