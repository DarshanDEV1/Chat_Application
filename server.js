const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const cors = require('cors');

// Message Node for Linked List
class MessageNode {
  // constructor(sender, recipient, message, timestamp) {
  constructor(sender, message, timestamp) {
    this.sender = sender;
    // this.recipient = recipient;
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

  // addMessage(sender, recipient, message, timestamp) {
  addMessage(sender, message, timestamp) {
    // const newNode = new MessageNode(sender, recipient, message, timestamp);
    const newNode = new MessageNode(sender, message, timestamp);
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
        // recipient: current.recipient,
        message: current.message,
        timestamp: current.timestamp
      });
      current = current.next;
    }
    return messages;
  }
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
  // const { sender, recipient, message } = req.body;
  const { sender, message } = req.body;
  const timestamp = new Date().toISOString();
  // messageList.addMessage(sender, recipient, message, timestamp);
  messageList.addMessage(sender, message, timestamp);

  // Emit encrypted message to both sender and recipient
  // io.emit('message', { sender, recipient, message: message, timestamp });
  io.emit('message', { sender, message: message, timestamp });
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