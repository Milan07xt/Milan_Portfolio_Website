function initAIAgent() {
    if (document.getElementById('ai-agent-widget')) return;

    // Inject Widget HTML
    const widgetHTML = `
        <div id="ai-agent-widget">
            <div id="ai-notification">
                <div class="notif-header">
                    <h4>Milan AI</h4>
                    <button id="notif-close"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <p>👋 Hi! I'm Milan's AI Portfolio Assistant.<br>What would you like to know about his skills, projects, or experience?</p>
            </div>
            
            <button id="ai-agent-btn" aria-label="Open AI Assistant">
                🤖
            </button>
            
            <div id="ai-chat-window">
                <div class="chat-header">
                    <div class="chat-header-info">
                        <div class="chat-avatar">🤖</div>
                        <div class="chat-title">
                            <h3>Milan AI</h3>
                            <span>Online</span>
                        </div>
                    </div>
                    <button id="chat-close"><i class="fa-solid fa-chevron-down"></i></button>
                </div>
                
                <div class="chat-body" id="chat-body">
                    <div class="message ai">
                        👋 Hi! I'm Milan's AI Portfolio Assistant. Welcome to Milan Rathod's portfolio! I can help you learn about his skills, projects, certificates, education, resume, GitHub, LinkedIn, and career interests. What would you like to know?
                    </div>
                </div>
                
                <div class="quick-actions">
                    <button class="quick-action-btn" data-query="👤 About Milan">👤 About Milan</button>
                    <button class="quick-action-btn" data-query="💻 Skills">💻 Skills</button>
                    <button class="quick-action-btn" data-query="🚀 Projects">🚀 Projects</button>
                    <button class="quick-action-btn" data-query="🏆 Certificates">🏆 Certificates</button>
                    <button class="quick-action-btn" data-query="🎓 Education">🎓 Education</button>
                    <button class="quick-action-btn" data-query="📄 Resume">📄 Resume</button>
                </div>
                
                <div class="chat-footer">
                    <input type="text" id="chat-input" placeholder="Ask a question..." autocomplete="off">
                    <button id="chat-send"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Elements
    const btn = document.getElementById('ai-agent-btn');
    const chatWindow = document.getElementById('ai-chat-window');
    const notif = document.getElementById('ai-notification');
    const notifClose = document.getElementById('notif-close');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatBody = document.getElementById('chat-body');
    const quickActions = document.querySelectorAll('.quick-action-btn');

    // Always use the relative /api/chat path to route to Vercel Serverless Functions
    const API_URL = window.__MILAN_AI_API_URL__ || '/api/chat';

    // Show notification shortly after load and auto-hide after 5 seconds
    let notifTimer;
    setTimeout(() => {
        if (!chatWindow.classList.contains('open')) {
            notif.classList.add('show');
            notifTimer = setTimeout(() => {
                notif.classList.remove('show');
            }, 5000);
        }
    }, 2000);

    // Hide notification when close button is clicked
    notifClose.addEventListener('click', (e) => {
        e.stopPropagation();
        notif.classList.remove('show');
        if (notifTimer) clearTimeout(notifTimer);
    });

    // Clicking the notification box opens the AI Agent chat
    notif.addEventListener('click', (e) => {
        if (e.target.closest('#notif-close')) return;
        chatWindow.classList.add('open');
        notif.classList.remove('show');
        if (notifTimer) clearTimeout(notifTimer);
        chatInput.focus();
    });

    btn.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        notif.classList.remove('show');
        if (notifTimer) clearTimeout(notifTimer);
        if (chatWindow.classList.contains('open')) {
            chatInput.focus();
        }
    });

    const navAiBtn = document.getElementById('nav-ai-btn');
    if (navAiBtn) {
        navAiBtn.addEventListener('click', (e) => {
            e.preventDefault();
            chatWindow.classList.add('open');
            notif.classList.remove('show');
            if (notifTimer) clearTimeout(notifTimer);
            chatInput.focus();
        });
    }

    chatClose.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });

    // Send Message
    const sendMessage = async (message) => {
        if (!message.trim()) return;

        // Add user message to UI
        appendMessage(message, 'user');
        chatInput.value = '';

        // Show typing indicator
        const typingId = showTypingIndicator();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                const errorText = await response.text();
                let details = 'The AI assistant is currently offline. Please start the backend or use the contact section to reach Milan.';

                try {
                    const parsed = JSON.parse(errorText);
                    if (parsed && parsed.error) details = parsed.error;
                    else if (parsed && parsed.detail) details = parsed.detail;
                } catch (err) {
                    if (errorText && errorText.trim()) details = errorText;
                }

                throw new Error(details);
            }

            const data = await response.json();
            removeTypingIndicator(typingId);
            appendMessage(data.answer, 'ai');
            
        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator(typingId);

            const fallbackMessage =
                'The AI assistant is currently offline. Please [contact Milan](#contact) or use the contact section to reach him.';

            appendMessage(
                error && error.message
                    ? error.message.includes('contact Milan') ? error.message : `${error.message}. Please [contact Milan](#contact) or use the contact section to reach him.`
                    : fallbackMessage,
                'ai'
            );
        }
    };

    // Events for sending
    chatSend.addEventListener('click', () => sendMessage(chatInput.value));
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(chatInput.value);
        }
    });

    // Quick Actions
    quickActions.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const query = e.target.getAttribute('data-query');
            sendMessage(query);
        });
    });

    // Helpers
    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        
        // Simple markdown parsing for bold, links, and stripping headers
        let formattedText = text
            .replace(/#{1,3}\s+(.*)/g, '<strong>$1</strong>') // Convert ### Header to bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Handle newlines as breaks
        formattedText = formattedText.replace(/\n/g, '<br>');

        msgDiv.innerHTML = formattedText;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = id;
        indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        chatBody.appendChild(indicator);
        chatBody.scrollTop = chatBody.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAIAgent);
} else {
    initAIAgent();
}
