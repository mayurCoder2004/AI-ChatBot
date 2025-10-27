// =============================
// 🔧 CONFIGURATION
// =============================

// ⚠️ Replace with your API key (keep private)
const API_KEY = 'AIzaSyDqNwMo5hbubYMcpiGJ3a5jMqwOWk9oTfs';

// ✅ Correct model endpoint for Gemini
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';


// =============================
// 💬 DOM ELEMENTS
// =============================
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');


// =============================
// 🤖 MAIN AI CALL
// =============================
async function generateResponse(prompt) {
    try {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        const res = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Handle API errors gracefully
        if (!res.ok) {
            const bodyText = await res.text();
            console.error('API returned non-OK status', res.status, res.statusText, bodyText);
            throw new Error(`API error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        console.log('Raw API response:', data);

        // Extract text safely from Gemini's response
        let text = '';
        if (data.candidates?.length) {
            const cand = data.candidates[0];
            text = cand?.content?.parts?.[0]?.text ?? cand?.content ?? cand?.text ?? '';
        }

        if (!text) text = JSON.stringify(data);
        return formatMarkdown(text);
    } catch (error) {
        console.error('Error generating response (detailed):', error);
        throw new Error('Failed to generate response — check console for API details.');
    }
}


// =============================
// ✨ MARKDOWN → CLEAN HTML FORMATTER
// =============================
function formatMarkdown(text) {
    if (!text) return '';

    text = text
        // Headings → bold + spacing
        .replace(/^#{1,6}\s*(.*)$/gm, '<h3>$1</h3>')
        // Bold & Italics
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<i>$1</i>')
        // Inline code
        .replace(/`{1,3}(.*?)`{1,3}/g, '<code>$1</code>')
        // Bulleted list
        .replace(/^\s*[\*\-]\s+(.*)$/gm, '<li>$1</li>')
        // Numbered list
        .replace(/^\s*(\d+)\.\s+(.*)$/gm, '<li><b>$1.</b> $2</li>')
        // Convert consecutive list items into <ul> or <ol>
        .replace(/(<li>.*<\/li>)/gs, '<ul class="list">$1</ul>')
        // Paragraph spacing
        .replace(/\n{2,}/g, '</p><p>')
        // Single newlines → <br>
        .replace(/\n/g, '<br>')
        // Wrap text into paragraphs if needed
        .replace(/^(.+)$/gm, '<p>$1</p>');

    // Clean multiple <ul> tags merging
    text = text.replace(/<\/ul>\s*<ul class="list">/g, '');

    return text.trim();
}


// =============================
// 🪄 TYPING INDICATOR
// =============================
function showTypingIndicator() {
    hideTypingIndicator();
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('typing-indicator');
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) typingIndicator.remove();
}


// =============================
// 💬 MESSAGE RENDERING
// =============================
function addMessage(message, isUser) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', isUser ? 'user-message' : 'bot-message');

    const profileImage = document.createElement('img');
    profileImage.classList.add('profile-image');
    profileImage.src = isUser ? 'user.jpg' : 'bot.jpg';
    profileImage.alt = isUser ? 'User' : 'Bot';

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.innerHTML = message; // ✅ preserves HTML formatting

    messageElement.appendChild(profileImage);
    messageElement.appendChild(messageContent);
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// =============================
// 🎯 USER INPUT HANDLER
// =============================
async function handleUserInput() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, true);
    userInput.value = '';
    sendButton.disabled = true;
    userInput.disabled = true;
    showTypingIndicator();

    try {
        const botMessage = await generateResponse(userMessage);
        hideTypingIndicator();
        addMessage(botMessage, false);
    } catch (error) {
        console.error('User-visible error:', error);
        hideTypingIndicator();
        addMessage('❌ Sorry, I encountered an error. Check console for details.', false);
    } finally {
        sendButton.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

sendButton.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserInput();
    }
});
