const API_KEY = 'AIzaSyDqNwMo5hbubYMcpiGJ3a5jMqwOWk9oTfs';
        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
        const chatMessages = document.getElementById('chat-messages');
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');

        async function generateResponse(prompt) {
            try {
                const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: prompt,
                                    },
                                ],
                            },
                        ],
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to generate response');
                }

                const data = await response.json();

                if (data && data.candidates && data.candidates.length > 0) {
                    const content = data.candidates[0].content;
                    
                    if (content && content.parts && content.parts.length > 0) {
                        return cleanMarkdown(content.parts[0].text);
                    } else {
                        throw new Error('Invalid content structure in API response');
                    }
                } else {
                    throw new Error('No candidates found in API response');
                }
            } catch (error) {
                console.error('Error generating response:', error);
                throw new Error('Failed to generate response');
            }
        }

        function cleanMarkdown(text) {
            return text
                .replace(/#{1,6}\s?/g, '')
                .replace(/\*\*/g, '')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
        }

        function showTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.classList.add('typing-indicator');
            typingDiv.id = 'typing-indicator';
            typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function hideTypingIndicator() {
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        function addMessage(message, isUser) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
            
            const profileImage = document.createElement('img');
            profileImage.classList.add('profile-image');
            profileImage.src = isUser ? 'user.jpg' : 'bot.jpg';
            profileImage.alt = isUser ? 'User' : 'Bot';
           
            const messageContent = document.createElement('div');
            messageContent.classList.add('message-content');
            messageContent.textContent = message;
            
            messageElement.appendChild(profileImage);
            messageElement.appendChild(messageContent);
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        async function handleUserInput() {
            const userMessage = userInput.value.trim();
            
            if (userMessage) {
                addMessage(userMessage, true);
                userInput.value = '';
                sendButton.disabled = true;
                userInput.disabled = true;
                
                showTypingIndicator();
        
                try {
                    const botMessage = await generateResponse(userMessage);
                    hideTypingIndicator();
                    addMessage(cleanMarkdown(botMessage), false);
                } catch (error) {
                    console.error('Error:', error);
                    hideTypingIndicator();
                    addMessage('Sorry, I encountered an error. Please try again.', false);
                } finally {
                    sendButton.disabled = false;
                    userInput.disabled = false;
                    userInput.focus();  
                }
            }
        }

        sendButton.addEventListener('click', handleUserInput);
        
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleUserInput();
            }
        });