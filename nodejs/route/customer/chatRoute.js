const express = require('express');
const router = express.Router();
const chatController = require('../../controller/customer/chatController');

// Route gửi tin nhắn đến AI
router.post('/send', chatController.sendMessage);

module.exports = router;