const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');

// Message Node for Linked List
class MessageNode {
  constructor(sender, recipient, message, timestamp) {
    this.sender = sender;
    this.recipient = recipient;
    this.message = message;
    this.timestamp = timestamp;
    this.next = null;
  }
}

// Linked List to store messages
class MessageList {
  constructor() {
    this.head = null;
  }

  addMessage(sender, recipient, message, timestamp) {
    const newNode = new MessageNode(sender, recipient, message, timestamp);
    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
  }

  getMessages() {
    const messages = [];
    let current = this.head;
    while (current) {
      messages.push({
        sender: current.sender,
        recipient: current.recipient,
        message: current.message,
        timestamp: current.timestamp
      });
      current = current.next;
    }
    return messages;
  }
}

// Encryption and Decryption Functions
const ENCRYPTION_KEY = crypto.randomBytes(32); // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return `${iv.toString('base64')}:${encrypted}`;
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'base64');
  const encryptedText = Buffer.from(textParts.join(':'), 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Initialize message list
const messageList = new MessageList();

// Set up server and middleware
const app = express();
app.use(bodyParser.json());
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity. You can restrict this to specific origins.
    methods: ["GET", "POST"]
  }
});

// Endpoint to handle sending messages
app.post('/sendmessage', (req, res) => {
  const { sender, recipient, message } = req.body;
  const decryptedMessage = decrypt(message);
  const timestamp = new Date().toISOString();
  messageList.addMessage(sender, recipient, decryptedMessage, timestamp);

  // Emit encrypted message to both sender and recipient
  const encryptedForClient = encrypt(decryptedMessage);
  io.emit('message', { sender, recipient, message: encryptedForClient, timestamp });
  res.status(200).send({ success: true, message: 'Message sent' });
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
