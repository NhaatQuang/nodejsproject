let chatboxOpen = false;

// Toggle chatbox
function toggleChatbox() {
    const chatboxWindow = document.getElementById('chatboxWindow');
    const chatboxToggle = document.getElementById('chatboxToggle');
    
    if (chatboxOpen) {
        chatboxWindow.style.display = 'none';
        chatboxToggle.innerHTML = '<i class="fas fa-robot"></i>';
        chatboxOpen = false;
    } else {
        chatboxWindow.style.display = 'flex';
        chatboxToggle.innerHTML = '<i class="fas fa-times"></i>';
        chatboxOpen = true;
        
        // Focus vào input
        setTimeout(() => {
            document.getElementById('chatInput').focus();
        }, 100);
    }
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    const chatboxToggle = document.getElementById('chatboxToggle');
    const chatInput = document.getElementById('chatInput');
    
    if (chatboxToggle) {
        chatboxToggle.addEventListener('click', toggleChatbox);
    }
    
    if (chatInput) {
        // Enter để gửi tin nhắn
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

// Gửi tin nhắn (CẬP NHẬT)
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) {
        return;
    }
    
    // Hiển thị tin nhắn user
    addMessage(message, 'user');
    
    // Clear input và disable button
    chatInput.value = '';
    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = true;
    
    // Hiển thị typing indicator
    showTypingIndicator();
    
    try {
        // Gửi request đến server
        const response = await fetch('/customer/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        
        // Ẩn typing indicator
        hideTypingIndicator();
        
        if (data.success) {
            // Hiển thị phản hồi AI
            addMessage(data.response, 'ai');
            
            // Nếu có sản phẩm, hiển thị product cards
            if (data.hasProducts && data.products) {
                addProductCards(data.products);
            }
        } else {
            // Hiển thị lỗi hoặc fallback
            addMessage(data.fallback || data.error || 'Có lỗi xảy ra. Vui lòng thử lại.', 'ai');
        }
        
    } catch (error) {
        console.error('Chat error:', error);
        hideTypingIndicator();
        addMessage('⚠️ Kết nối không ổn định. Vui lòng thử lại sau.', 'ai');
    }
    
    // Enable button
    sendButton.disabled = false;
    chatInput.focus();
}

// Thêm tin nhắn vào chat
function addMessage(content, sender) {
    const messagesContainer = document.getElementById('chatboxMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    if (sender === 'user') {
        avatar.innerHTML = '<i class="fas fa-user"></i>';
    } else {
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    if (sender === 'user') {
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(avatar);
    } else {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
    }
    
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Thêm product cards vào chat (THÊM MỚI)
function addProductCards(productsHTML) {
    const messagesContainer = document.getElementById('chatboxMessages');
    
    const productDiv = document.createElement('div');
    productDiv.className = 'message ai';
    productDiv.style.maxWidth = '100%';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.style.maxWidth = '100%';
    contentDiv.innerHTML = productsHTML;
    
    productDiv.appendChild(contentDiv);
    messagesContainer.appendChild(productDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Hiển thị typing indicator
function showTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.classList.add('active');
    }
}

// Ẩn typing indicator
function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.classList.remove('active');
    }
}

// Format thời gian
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Quick reply function (THÊM MỚI)
function quickReply(text) {
    const chatInput = document.getElementById('chatInput');
    chatInput.value = text;
    sendMessage();
}